<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use App\Models\User;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculty
     */
    public function index(Request $request)
    {
        $query = Faculty::with(['user', 'advisedStudents']);

        // Filter by title if provided
        if ($request->has('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        // Filter by office if provided
        if ($request->has('office')) {
            $query->where('office', 'like', '%' . $request->office . '%');
        }

        $faculty = $query->get();

        return response()->json([
            'faculty' => $faculty->map(function ($facultyMember) {
                return [
                    'faculty_id' => $facultyMember->faculty_id,
                    'title' => $facultyMember->title,
                    'office' => $facultyMember->office,
                    'user' => $facultyMember->user,
                    'advised_students' => $facultyMember->advisedStudents,
                    'created_at' => $facultyMember->created_at,
                ];
            })
        ]);
    }

    /**
     * Store a newly created faculty member
     */
    public function store(Request $request)
    {
        $request->validate([
            'faculty_id' => 'required|exists:users,id|unique:faculty,faculty_id',
            'title' => 'required|string|max:255',
            'office' => 'nullable|string|max:255',
        ]);

        // Ensure the user has faculty role
        $user = User::findOrFail($request->faculty_id);
        if ($user->role !== 'faculty') {
            return response()->json([
                'message' => 'User must have faculty role to be added as faculty member'
            ], 422);
        }

        $faculty = Faculty::create($request->all());

        return response()->json([
            'message' => 'Faculty member created successfully',
            'faculty' => [
                'faculty_id' => $faculty->faculty_id,
                'title' => $faculty->title,
                'office' => $faculty->office,
                'user' => $faculty->user,
                'created_at' => $faculty->created_at,
            ]
        ], 201);
    }

    /**
     * Display the specified faculty member
     */
    public function show(string $id)
    {
        $faculty = Faculty::with(['user', 'advisedStudents'])->findOrFail($id);

        return response()->json([
            'faculty' => [
                'faculty_id' => $faculty->faculty_id,
                'title' => $faculty->title,
                'office' => $faculty->office,
                'user' => $faculty->user,
                'advised_students' => $faculty->advisedStudents,
                'created_at' => $faculty->created_at,
            ]
        ]);
    }

    /**
     * Update the specified faculty member
     */
    public function update(Request $request, string $id)
    {
        $faculty = Faculty::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'office' => 'nullable|string|max:255',
        ]);

        $faculty->update($request->all());

        return response()->json([
            'message' => 'Faculty member updated successfully',
            'faculty' => [
                'faculty_id' => $faculty->faculty_id,
                'title' => $faculty->title,
                'office' => $faculty->office,
                'updated_at' => $faculty->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified faculty member
     */
    public function destroy(string $id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();

        return response()->json([
            'message' => 'Faculty member deleted successfully'
        ]);
    }

    /**
     * Get faculty by title
     */
    public function getByTitle(string $title)
    {
        $faculty = Faculty::where('title', 'like', '%' . $title . '%')
            ->with(['user', 'advisedStudents'])
            ->get();

        return response()->json([
            'faculty' => $faculty->map(function ($facultyMember) {
                return [
                    'faculty_id' => $facultyMember->faculty_id,
                    'title' => $facultyMember->title,
                    'office' => $facultyMember->office,
                    'user' => $facultyMember->user,
                    'advised_students' => $facultyMember->advisedStudents,
                ];
            })
        ]);
    }

    /**
     * Get faculty by office
     */
    public function getByOffice(string $office)
    {
        $faculty = Faculty::where('office', 'like', '%' . $office . '%')
            ->with(['user', 'advisedStudents'])
            ->get();

        return response()->json([
            'faculty' => $faculty->map(function ($facultyMember) {
                return [
                    'faculty_id' => $facultyMember->faculty_id,
                    'title' => $facultyMember->title,
                    'office' => $facultyMember->office,
                    'user' => $facultyMember->user,
                    'advised_students' => $facultyMember->advisedStudents,
                ];
            })
        ]);
    }

    /**
     * Get faculty with their advised students
     */
public function getWithStudents(string $id)
{
    $faculty = Faculty::with(['user', 'advisedStudents.user'])->findOrFail($id);

    return response()->json([
        'faculty' => [
            'faculty_id' => $faculty->faculty_id,
            'title' => $faculty->title,
            'office' => $faculty->office,
            'user' => [
                'id' => $faculty->user->id,
                'first_name' => $faculty->user->first_name,
                'last_name' => $faculty->user->last_name,
                'email' => $faculty->user->email,
                'department' => $faculty->user->department,
                'role' => $faculty->user->role,
            ],
            'advised_students' => $faculty->advisedStudents->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'program_type' => $student->program_type,
                    'start_term' => $student->start_term,
                    'graduation_term' => $student->graduation_term,
                    'i9_status' => $student->i9_status,
                    'deficiency_cleared' => $student->deficiency_cleared,
                    'user' => [
                        'id' => $student->user->id,
                        'first_name' => $student->user->first_name,
                        'last_name' => $student->user->last_name,
                        'email' => $student->user->email,
                        'department' => $student->user->department,
                        'role' => $student->user->role,
                    ],
                ];
            }),
        ]
    ]);
}

}
