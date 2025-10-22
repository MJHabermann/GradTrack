<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\PreRequisiteGroup;
use Illuminate\Http\Request;

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
        ]);

        $course = Course::create($validated);
        return response()->json(['message' => 'Course created successfully', 'course' => $course], 201);
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
        $course->prerequisites()->detach();
        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }
}
