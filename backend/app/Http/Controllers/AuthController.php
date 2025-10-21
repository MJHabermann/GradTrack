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
            'password' => 'required|string|min:8|confirmed',
            'department' => 'nullable|string|max:255',
        ]);

        // Create the user (role will default to 'student')
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student', // Always 'student' for new registrations
            'department' => $request->department,
        ]);

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
            
            return response()->json([
                'message' => 'Login successful',
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
