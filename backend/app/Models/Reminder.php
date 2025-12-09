<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    protected $fillable = [
        'user_id',
        'text',
        'due_date',
        'priority',
        'is_complete',
        'created_by_id', // ID of the faculty/admin who created the reminder
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_complete' => 'boolean',
    ];

    /**
     * Get the user (student) who owns this reminder
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user (faculty/admin) who created this reminder
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
