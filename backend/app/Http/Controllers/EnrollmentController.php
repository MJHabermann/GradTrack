<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{

    public function index()
    {
        return response()->json(Enrollment::all());
    }

    public function studentEnrollments($studentId)
    {
        $enrollments = Enrollment::where('student_id', $studentId)->get();
        return response()->json($enrollments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,student_id',
            'course_id' => 'required|integer|exists:courses,id',
            'term' => 'required|string',
            'status' => 'required|in:enrolled,completed,dropped,planned,failed',
            'grade' => 'nullable|string',
        ]);

        $enrollment = Enrollment::create($validated);
        return response()->json(['message' => 'Enrollment created successfully', 'enrollment' => $enrollment], 201);
    }
    public function update(Request $request, $id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->update($request->all());
        return response()->json(['message' => 'Enrollment updated successfully', 'enrollment' => $enrollment]);
    }
    public function destroy($id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->delete();
        return response()->json(['message' => 'Enrollment deleted successfully']);
    }
}
