<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     */
    public function index(Request $request)
    {
        $query = Student::with(['user', 'majorProfessor']);

        // Filter by program type if provided
        if ($request->has('program_type')) {
            $query->where('program_type', $request->program_type);
        }

        // Filter by I9 status if provided
        if ($request->has('i9_status')) {
            $query->where('i9_status', $request->i9_status);
        }

        // Filter by deficiency cleared if provided
        if ($request->has('deficiency_cleared')) {
            $query->where('deficiency_cleared', $request->boolean('deficiency_cleared'));
        }

        $students = $query->get();

        return response()->json([
            'students' => $students->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'program_type' => $student->program_type,
                    'major_professor_id' => $student->major_professor_id,
                    'start_term' => $student->start_term,
                    'i9_status' => $student->i9_status,
                    'deficiency_cleared' => $student->deficiency_cleared,
                    'graduation_term' => $student->graduation_term,
                    'user' => $student->user,
                    'major_professor' => $student->majorProfessor,
                    'created_at' => $student->created_at,
                ];
            })
        ]);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id|unique:students,student_id',
            'program_type' => 'required|in:Masters,PhD',
            'major_professor_id' => 'nullable|exists:users,id',
            'start_term' => 'required|string|max:255',
            'i9_status' => 'required|in:Pending,Completed',
            'deficiency_cleared' => 'boolean',
            'graduation_term' => 'nullable|string|max:255',
        ]);

        // Ensure the user has student role
        $user = User::findOrFail($request->student_id);
        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'User must have student role to be added as student'
            ], 422);
        }

        $student = Student::create($request->all());

        return response()->json([
            'message' => 'Student created successfully',
            'student' => [
                'student_id' => $student->student_id,
                'program_type' => $student->program_type,
                'major_professor_id' => $student->major_professor_id,
                'start_term' => $student->start_term,
                'i9_status' => $student->i9_status,
                'deficiency_cleared' => $student->deficiency_cleared,
                'graduation_term' => $student->graduation_term,
                'user' => $student->user,
                'created_at' => $student->created_at,
            ]
        ], 201);
    }

    /**
     * Display the specified student
     */
    public function show(string $id)
    {
        $student = Student::with(['user', 'majorProfessor'])->findOrFail($id);

        return response()->json([
            'student' => [
                'student_id' => $student->student_id,
                'program_type' => $student->program_type,
                'major_professor_id' => $student->major_professor_id,
                'start_term' => $student->start_term,
                'i9_status' => $student->i9_status,
                'deficiency_cleared' => $student->deficiency_cleared,
                'graduation_term' => $student->graduation_term,
                'user' => $student->user,
                'major_professor' => $student->majorProfessor,
                'created_at' => $student->created_at,
            ]
        ]);
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'program_type' => 'sometimes|required|in:Masters,PhD',
            'major_professor_id' => 'nullable|exists:users,id',
            'start_term' => 'sometimes|required|string|max:255',
            'i9_status' => 'sometimes|required|in:Pending,Completed',
            'deficiency_cleared' => 'sometimes|boolean',
            'graduation_term' => 'nullable|string|max:255',
        ]);

        $student->update($request->all());

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => [
                'student_id' => $student->student_id,
                'program_type' => $student->program_type,
                'major_professor_id' => $student->major_professor_id,
                'start_term' => $student->start_term,
                'i9_status' => $student->i9_status,
                'deficiency_cleared' => $student->deficiency_cleared,
                'user' => $student->user,
                'major_professor' => $student->majorProfessor,
                'graduation_term' => $student->graduation_term,
                'updated_at' => $student->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified student
     */
    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }

    /**
     * Get students by program type
     */
    public function getByProgramType(string $programType)
    {
        $students = Student::where('program_type', $programType)
            ->with(['user', 'majorProfessor'])
            ->get();

        return response()->json([
            'students' => $students->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'program_type' => $student->program_type,
                    'major_professor_id' => $student->major_professor_id,
                    'start_term' => $student->start_term,
                    'i9_status' => $student->i9_status,
                    'deficiency_cleared' => $student->deficiency_cleared,
                    'graduation_term' => $student->graduation_term,
                    'user' => $student->user,
                    'major_professor' => $student->majorProfessor,
                ];
            })
        ]);
    }

    /**
     * Get students by major professor
     */
    public function getByMajorProfessor(string $professorId)
    {
        $students = Student::where('major_professor_id', $professorId)
            ->with(['user', 'majorProfessor'])
            ->get();

        return response()->json([
            'students' => $students->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'program_type' => $student->program_type,
                    'major_professor_id' => $student->major_professor_id,
                    'start_term' => $student->start_term,
                    'i9_status' => $student->i9_status,
                    'deficiency_cleared' => $student->deficiency_cleared,
                    'graduation_term' => $student->graduation_term,
                    'user' => $student->user,
                    'major_professor' => $student->majorProfessor,
                ];
            })
        ]);
    }
}
