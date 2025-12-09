<?php

namespace App\Http\Controllers;

use App\Models\Term;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TermController extends Controller
{
    public function index(Student $student)
    {
        $terms = Term::where('student_id', $student->student_id)
            ->with('courses')
            ->orderBy('order')
            ->get();

        // Transform to include full course details
        $termsWithCourses = $terms->map(function ($term) {
            return [
                'id' => $term->id,
                'student_id' => $term->student_id,
                'name' => $term->name,
                'order' => $term->order,
                'courses' => $term->courses->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'course_code' => $course->course_code,
                        'title' => $course->title,
                        'credits' => $course->credits,
                        'level' => $course->level,
                    ];
                })->toArray(),
                'created_at' => $term->created_at,
                'updated_at' => $term->updated_at,
            ];
        });

        return response()->json($termsWithCourses);
    }

    public function store(Request $request, Student $student)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $name = $request->input('name');

        // Check if term with this name already exists for this student
        $existingTerm = Term::where('student_id', $student->student_id)
            ->where('name', $name)
            ->first();

        if ($existingTerm) {
            return response()->json(['message' => 'A term with this name already exists for this student'], 422);
        }

        $max = Term::where('student_id', $student->student_id)->max('order') ?? 0;

        $term = Term::create([
            'student_id' => $student->student_id,
            'name' => $name,
            'order' => $max + 1,
        ]);

        return response()->json(['message' => 'Term created', 'term' => $term], 201);
    }

    public function addCourse(Request $request, Student $student, Term $term)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id'
        ]);

        if ($term->student_id !== $student->student_id) {
            return response()->json(['message' => 'Term does not belong to student'], 403);
        }

        $courseId = $request->input('course_id');

        if (DB::table('term_courses')->where('term_id', $term->id)->where('course_id', $courseId)->exists()) {
            return response()->json(['message' => 'Course already planned in this term'], 400);
        }

        $course = Course::findOrFail($courseId);

        // Gather completed courses for student
        $completed = Enrollment::where('student_id', $student->student_id)
            ->where(function ($q) {
                $q->where('status', 'completed')->orWhereNotNull('grade');
            })->pluck('course_id')->toArray();

        // Gather planned courses in earlier terms
        $earlierPlanned = DB::table('term_courses')
            ->join('terms', 'term_courses.term_id', '=', 'terms.id')
            ->where('terms.student_id', $student->student_id)
            ->where('terms.order', '<', $term->order)
            ->pluck('term_courses.course_id')
            ->toArray();

        $available = array_unique(array_merge($completed, $earlierPlanned));

        $groups = $course->prerequisiteGroups()->with('prerequisites')->get();

        // If no groups, allow
        if ($groups->isEmpty()) {
            DB::table('term_courses')->insert([
                'term_id' => $term->id,
                'course_id' => $courseId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return response()->json(['message' => 'Course planned successfully']);
        }

        $satisfied = false;
        $missing = [];

        foreach ($groups as $group) {
            $reqIds = $group->prerequisites->pluck('id')->toArray();
            $diff = array_diff($reqIds, $available);
            if (empty($diff)) {
                $satisfied = true;
                break;
            }
            $missing[] = $diff;
        }

        if (! $satisfied) {
            // Map missing ids to course codes for clarity
            $missingDetails = [];
            foreach ($missing as $m) {
                $missingDetails[] = Course::whereIn('id', $m)->get(['id', 'course_code', 'title']);
            }
            return response()->json(['message' => 'Prerequisites not satisfied', 'missing' => $missingDetails], 400);
        }

        DB::table('term_courses')->insert([
            'term_id' => $term->id,
            'course_id' => $courseId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Course planned successfully']);
    }

    public function removeCourse(Student $student, Term $term, Course $course)
    {
        if ($term->student_id !== $student->student_id) {
            return response()->json(['message' => 'Term does not belong to student'], 403);
        }

        DB::table('term_courses')->where('term_id', $term->id)->where('course_id', $course->id)->delete();

        return response()->json(['message' => 'Course removed from term']);
    }
}
