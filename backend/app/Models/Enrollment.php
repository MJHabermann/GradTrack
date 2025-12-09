<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'course_id', 'term', 'status', 'grade'];

    /**
     * Get the course associated with this enrollment
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the student associated with this enrollment
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}

