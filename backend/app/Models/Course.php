<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;
    protected $fillable = ['course_code', 'title', 'credits', 'level'];
    //protected $appends = ['prerequisite_groups'];
    public function prerequisites()
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'course_id', 'prerequisite_id');
    }
    public function prerequisiteGroups()
    {
        return $this->hasMany(PrerequisiteGroup::class, 'course_id');
    }
public function getPrerequisiteSummaryAttribute()
{
    return $this->prerequisiteGroups()->get()->map(function ($group) {
        $courses = $group->prerequisites()->pluck('course_code')->toArray();
        return implode(' OR ', $courses);
    })->toArray();
}


    public function isPrerequisiteFor()
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'prerequisite_id', 'course_id');
    }
}
;
