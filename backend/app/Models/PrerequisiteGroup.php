<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrerequisiteGroup extends Model
{
    use HasFactory;

    protected $fillable = ['course_id'];

    public function prerequisites()
    {
        return $this->belongsToMany(Course::class, 'group_prerequisites', 'prerequisite_group_id', 'prerequisite_id');
    }
}

