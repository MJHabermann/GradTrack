<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
   use HasFactory;
    protected $fillable = ['course_code', 'title', 'credits', 'level'];

    public function prerequisites()
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'course_id', 'prerequisite_id');
    }

    public function isPrerequisiteFor(){
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'prerequisite_id', 'course_id');
    }
};
