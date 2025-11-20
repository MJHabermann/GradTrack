<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use App\Models\Document;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Update or assign advisor for a student (Admin only)
     * 
     * @param Request $request
     * @param string $id Student ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAdvisor(Request $request, string $id)
    {
        $student = Student::with(['user', 'majorProfessor'])->findOrFail($id);

        $request->validate([
            'major_professor_id' => 'nullable|exists:users,id',
        ]);

        // If advisor is provided, validate that it's a faculty member
        if ($request->has('major_professor_id') && $request->major_professor_id !== null) {
            $advisor = User::findOrFail($request->major_professor_id);
            
            if ($advisor->role !== 'faculty') {
                return response()->json([
                    'message' => 'The specified user must be a faculty member to be assigned as an advisor.'
                ], 422);
            }
        }

        // Update the advisor
        $student->major_professor_id = $request->major_professor_id;
        $student->save();

        // Reload relationships
        $student->load(['user', 'majorProfessor']);

        return response()->json([
            'message' => $request->major_professor_id 
                ? 'Advisor assigned successfully' 
                : 'Advisor removed successfully',
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
                'updated_at' => $student->updated_at,
            ]
        ]);
    }

    /**
     * Get all documents for a specific student
     */
    public function getDocuments(string $id)
    {
        $student = Student::findOrFail($id);
        
        $documents = Document::where('user_id', $student->student_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'student_id' => $student->student_id,
            'documents' => $documents
        ]);
    }

    /**
     * Download a specific document for a student
     */
    public function downloadDocument(string $studentId, string $documentId)
    {
        $student = Student::findOrFail($studentId);
        $document = Document::findOrFail($documentId);

        // Verify the document belongs to this student
        if ($document->user_id != $student->student_id) {
            return response()->json(['error' => 'Document does not belong to this student'], 403);
        }

        if (!Storage::exists($document->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::download($document->file_path, $document->file_name);
    }
    
}
