<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\PreRequisiteGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::query();

        if ($request->has('level')) {
            $query->where('level', $request->input('level'));
        }

        $courses = $query
            ->with('prerequisiteGroups.prerequisites')
            ->orderBy('course_code')
            ->get();
        return response()->json($courses);

    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_code' => 'required|string|unique:courses,course_code',
            'title' => 'required|string',
            'credits' => 'required|integer|min:0',
            'level' => 'required|in:undergraduate,graduate',
            'prerequisite_groups' => 'nullable|array',
        ]);

        $course = Course::create($validated);
        
        // Handle prerequisite_groups if provided during import
        if ($request->has('prerequisite_groups') && is_array($request->input('prerequisite_groups'))) {
            foreach ($request->input('prerequisite_groups') as $groupData) {
                if (isset($groupData['prerequisites']) && is_array($groupData['prerequisites'])) {
                    // Create the prerequisite group
                    $group = $course->prerequisiteGroups()->create();
                    
                    // Extract prerequisite course codes and find their IDs
                    $prerequisiteIds = [];
                    foreach ($groupData['prerequisites'] as $prereqData) {
                        if (isset($prereqData['course_code'])) {
                            // Find the prerequisite course by course_code
                            $prereqCourse = Course::where('course_code', $prereqData['course_code'])->first();
                            if ($prereqCourse) {
                                $prerequisiteIds[] = $prereqCourse->id;
                            }
                        }
                    }
                    
                    // Attach the prerequisites to the group
                    if (!empty($prerequisiteIds)) {
                        $group->prerequisites()->attach($prerequisiteIds);
                    }
                }
            }
        }
        
        return response()->json(['message' => 'Course created successfully', 'course' => $course->load('prerequisiteGroups.prerequisites')], 201);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'course_code' => 'sometimes|required|string|unique:courses,course_code,' . $course->id,
            'title' => 'sometimes|required|string',
            'credits' => 'sometimes|required|integer|min:0',
            'level' => 'sometimes|required|in:undergraduate,graduate',
        ]);
        $course->update($validated);
        return response()->json(['message' => 'Course updated successfully', 'course' => $course]);
    }
    public function addPrerequisite(Request $request, Course $course)
    {
        $validated = $request->validate([
            'prerequisite_id' => 'required|exists:courses,id',
        ]);

        if ($course->prerequisites()->where('prerequisite_id', $validated['prerequisite_id'])->exists()) {
            return response()->json(['message' => 'Prerequisite already added'], 400);
        }

        $course->prerequisites()->attach($validated['prerequisite_id']);
        return response()->json(['message' => 'Prerequisite added successfully']);
    }
    public function addPrerequisiteGroup(Request $request, Course $course)
    {
        $validated = $request->validate([
            'prerequisite_ids' => 'required|array|min:1',
            'prerequisite_ids.*' => 'exists:courses,id',
        ]);
        $group = $course->prerequisiteGroups()->create();
        $group->prerequisites()->attach($validated['prerequisite_ids']);

        return response()->json(['message' => 'Prerequisite group added successfully']);
    }
    public function removePrerequisiteGroup(Course $course, $group_id)
    {
        $group = $course->prerequisiteGroups()->findOrFail($group_id);
        $group->prerequisites()->detach();
        $group->delete();

        return response()->json(['message' => 'Prerequisite group removed successfully']);
    }

    public function destroy(Course $course)
    {
        try {
            if (DB::connection()->getDriverName() === 'sqlite') {
                DB::statement('PRAGMA foreign_keys = OFF');
            }
            Enrollment::where('course_id', $course->id)->delete();
            DB::table('term_courses')->where('course_id', $course->id)->delete();
            $course->prerequisites()->detach();
            $course->prerequisiteGroups()->delete();
            $course->delete();
            if (DB::connection()->getDriverName() === 'sqlite') {
                DB::statement('PRAGMA foreign_keys = ON');
            }
            return response()->json(['message' => 'Course deleted']);
        } catch (\Exception $e) {
            if (DB::connection()->getDriverName() === 'sqlite') {
                DB::statement('PRAGMA foreign_keys = ON');
            }
            return response()->json(['message' => 'Error deleting course: ' . $e->getMessage()], 500);
        }
    }
    
}
