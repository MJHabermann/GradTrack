<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\AdvisorController;
use App\Http\Controllers\RegistrarController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\DeadlineController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\NotificationController;
// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/me', [AuthController::class, 'me']);

// User management routes
Route::apiResource('users', UserController::class);
Route::get('/users/role/{role}', [UserController::class, 'getByRole']);

// Student management routes
Route::apiResource('students', StudentController::class);
Route::get('/students/program/{programType}', [StudentController::class, 'getByProgramType']);
Route::get('/students/professor/{professorId}', [StudentController::class, 'getByMajorProfessor']);

// Faculty management routes
Route::apiResource('faculty', FacultyController::class);
Route::get('/faculty/title/{title}', [FacultyController::class, 'getByTitle']);
Route::get('/faculty/office/{office}', [FacultyController::class, 'getByOffice']);
Route::get('/faculty/{id}/students', [FacultyController::class, 'getWithStudents']);

// Existing routes
Route::get('/major-completion/{studentId}', [RegistrarController::class, 'getCompletion']);
Route::get('/advisor/{studentId}', [AdvisorController::class, 'show']);
Route::post('/advisor/message', [AdvisorController::class, 'sendMessage']);
// Application routes
Route::get('/milestones', [MilestoneController::class, 'index']);
Route::get('/deadlines', [DeadlineController::class, 'index']);
Route::get('/evaluations', [EvaluationController::class, 'index']);
Route::get('/notifications', [NotificationController::class, 'index']);

