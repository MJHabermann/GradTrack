<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';
    protected $primaryKey = 'faculty_id';
    public $incrementing = false;

    protected $fillable = [
        'faculty_id',
        'title',
        'office',
    ];

    /**
     * Get the user record associated with this faculty member
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'faculty_id');
    }

    /**
     * Get students advised by this faculty member
     */
    public function advisedStudents()
    {
        return $this->hasMany(Student::class, 'major_professor_id', 'faculty_id');
    }

    /**
     * Get the faculty member's full name
     */
    public function getFullNameAttribute(): string
    {
        return $this->user ? trim($this->user->first_name . ' ' . $this->user->last_name) : '';
    }

    /**
     * Get the faculty member's title with name
     */
    public function getTitleWithNameAttribute(): string
    {
        return $this->title . ' ' . $this->full_name;
    }
}
