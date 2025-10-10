<?php

Route::get('/milestones', [MilestoneController::class, 'index']);
Route::get('/deadlines', [DeadlineController::class, 'index']);
Route::get('/evaluations', [EvaluationController::class, 'index']);
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/major-completion/{studentId}', [RegistrarController::class, 'getCompletion']);
