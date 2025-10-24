<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        // Validate the request
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed',
            'role' => 'required|string|in:student,faculty',
            'department' => 'nullable|string|max:255',
            // Student-specific fields
            'program_type' => 'nullable|string|in:Masters,PhD',
            'start_term' => 'nullable|string|max:255',
            'major_professor_id' => 'nullable|exists:users,id',
            // Faculty-specific fields
            'title' => 'nullable|string|max:255',
            'office' => 'nullable|string|max:255',
        ]);

        // Create the user with the role provided by the user
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role, 
            'department' => $request->department,
        ]);

        // Create student or faculty record based on role
        if ($user->role === 'student') {
            $studentData = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
            ];
            
            // Only add optional fields if they are provided
            if ($request->has('program_type')) {
                $studentData['program_type'] = $request->program_type;
            }
            if ($request->has('start_term')) {
                $studentData['start_term'] = $request->start_term;
            }
            if ($request->has('major_professor_id')) {
                $studentData['major_professor_id'] = $request->major_professor_id;
            }
            
            $user->student()->create($studentData);
        } elseif ($user->role === 'faculty') {
            $facultyData = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
            ];
            
            // Only add optional fields if they are provided
            if ($request->has('title')) {
                $facultyData['title'] = $request->title;
            }
            if ($request->has('office')) {
                $facultyData['office'] = $request->office;
            }
            
            $user->faculty()->create($facultyData);
        }

        // Log the user in after registration
        Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'student' => $user->student,
                'faculty' => $user->faculty,
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        // Validate the request
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt to authenticate
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            // Create a new personal access token for the user
            $token = $user->createToken('web')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department,
                ]
            ]);
        }

        // Authentication failed
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        if($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get all users
     */
    public function getAllUsers()
    {
        $users = User::with(['student', 'faculty'])->get();
        
        return response()->json([
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department,
                    'student' => $user->student,
                    'faculty' => $user->faculty,
                    'created_at' => $user->created_at,
                ];
            })
        ]);
    }

    /**
     * Get current user info
     */
    public function me(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'No authenticated user',
                'user' => null
            ]);
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'student' => $user->student,
                'faculty' => $user->faculty,
            ]
        ]);
    }
}
