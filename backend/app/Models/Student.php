<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'program_type',
        'major_professor_id',
        'start_term',
        'i9_status',
        'deficiency_cleared',
        'graduation_term',
    ];

    protected $casts = [
        'deficiency_cleared' => 'boolean',
    ];

    /**
     * Get the user record associated with this student
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the major professor (advisor) for this student
     */
    public function majorProfessor()
    {
        return $this->belongsTo(User::class, 'major_professor_id');
    }

    /**
     * Check if the student is a Masters student
     */
    public function isMasters(): bool
    {
        return $this->program_type === 'Masters';
    }

    /**
     * Check if the student is a PhD student
     */
    public function isPhD(): bool
    {
        return $this->program_type === 'PhD';
    }

    /**
     * Check if I9 status is completed
     */
    public function hasCompletedI9(): bool
    {
        return $this->i9_status === 'Completed';
    }
}
