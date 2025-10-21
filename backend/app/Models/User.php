<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'department',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => 'string',
        ];
    }

    /**
     * Check if the user is an administrator
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Check if the user is faculty
     */
    public function isFaculty(): bool
    {
        return $this->role === 'faculty';
    }

    /**
     * Get the user's full name
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Get the student record if this user is a student
     */
    public function student()
    {
        return $this->hasOne(Student::class, 'student_id');
    }

    /**
     * Get students advised by this user (if faculty)
     */
    public function advisedStudents()
    {
        return $this->hasMany(Student::class, 'major_professor_id');
    }

    /**
     * Get the faculty record if this user is faculty
     */
    public function faculty()
    {
        return $this->hasOne(Faculty::class, 'faculty_id');
    }
}
