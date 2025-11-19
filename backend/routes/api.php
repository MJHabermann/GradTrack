<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\RegistrarController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\DeadlineController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ReminderController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);


// User management routes
Route::apiResource('users', UserController::class);
Route::get('/users/role/{role}', [UserController::class, 'getByRole']);

// Student management routes
Route::apiResource('students', StudentController::class);
Route::get('/students/program/{programType}', [StudentController::class, 'getByProgramType']);
Route::get('/students/professor/{professorId}', [StudentController::class, 'getByMajorProfessor']);
Route::get('/students/{id}/documents', [StudentController::class, 'getDocuments']);
Route::get('/students/{studentId}/documents/{documentId}/download', [StudentController::class, 'downloadDocument']);

// Admin-only routes for managing student advisors
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('/students/{id}/advisor', [StudentController::class, 'updateAdvisor']);
    Route::patch('/students/{id}/advisor', [StudentController::class, 'updateAdvisor']);
});

// Faculty management routes
Route::apiResource('faculty', FacultyController::class);
Route::get('/faculty/title/{title}', [FacultyController::class, 'getByTitle']);
Route::get('/faculty/office/{office}', [FacultyController::class, 'getByOffice']);
Route::get('/faculty/{id}/students', [FacultyController::class, 'getWithStudents']);

// Existing routes
Route::get('/major-completion/{studentId}', [RegistrarController::class, 'getCompletion']);

// Application routes
Route::get('/milestones', [MilestoneController::class, 'index']);
Route::get('/deadlines', [DeadlineController::class, 'index']);
Route::get('/evaluations', [EvaluationController::class, 'index']);
Route::get('/notifications', [NotificationController::class, 'index']);

// Document management routes
Route::middleware('auth:sanctum')->group(function () { // Only authenticated users can access these routes
    Route::get('/documents', [DocumentController::class, 'index']); // Get all documents for the authenticated user
    Route::post('/documents/upload', [DocumentController::class, 'upload']); // Upload a new document
    Route::get('/documents/{id}', [DocumentController::class, 'show']); // Get a single document's metadata
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']); // Download a document
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']); // Delete a document
});

// Student Reminders routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::patch('/reminders/{id}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{id}', [ReminderController::class, 'destroy']);
});

// Deadline routes
Route::get('/deadlines/scraped', [DeadlineController::class, 'getScrapedDeadlines']);

