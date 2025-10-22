<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdvisorController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
// use App\Http\Controllers\MilestoneController;
// use App\Http\Controllers\DeadlineController;
// use App\Http\Controllers\EvaluationController;
// use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RegistrarController;

Route::get('/major-completion/{studentId}', [RegistrarController::class, 'getCompletion']);
Route::get('/advisor/{studentId}', [AdvisorController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);

// Route::get('/milestones', [MilestoneController::class, 'index']);
// Route::get('/deadlines', [DeadlineController::class, 'index']);
// Route::get('/evaluations', [EvaluationController::class, 'index']);
// Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/advisor/message', [AdvisorController::class, 'sendMessage']);
Route::post('/courses', [CourseController::class, 'store']);
Route::apiResource('/courses', CourseController::class);
Route::apiResource('/enrollments', EnrollmentController::class);
