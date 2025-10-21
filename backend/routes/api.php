<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\DeadlineController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RegistrarController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth');

// Application routes
Route::get('/milestones', [MilestoneController::class, 'index']);
Route::get('/deadlines', [DeadlineController::class, 'index']);
Route::get('/evaluations', [EvaluationController::class, 'index']);
Route::get('/notifications', [NotificationController::class, 'index']);
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdvisorController;
// use App\Http\Controllers\MilestoneController;
// use App\Http\Controllers\DeadlineController;
// use App\Http\Controllers\EvaluationController;
// use App\Http\Controllers\NotificationController;

Route::get('/major-completion/{studentId}', [RegistrarController::class, 'getCompletion']);
Route::get('/advisor/{studentId}', [AdvisorController::class, 'show']);
// Route::get('/milestones', [MilestoneController::class, 'index']);
// Route::get('/deadlines', [DeadlineController::class, 'index']);
// Route::get('/evaluations', [EvaluationController::class, 'index']);
// Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/advisor/message', [AdvisorController::class, 'sendMessage']);
