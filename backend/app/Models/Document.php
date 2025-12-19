<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'tag',
        'is_required',
        'required_document_type',
        'status',
        'review_comment',
        'deadline',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}