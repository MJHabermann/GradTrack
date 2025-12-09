<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Get all documents for the authenticated user
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        $documents = Document::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    /**
     * Upload a new document
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'tag' => 'nullable|string',
            'is_required' => 'nullable|boolean',
            'required_document_type' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $userId = $request->user()->id;

        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store file in storage/app/documents/{userId}/
        $path = $file->storeAs("documents/{$userId}", $filename);

        // Create database record
        $document = Document::create([
            'user_id' => $userId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'tag' => $request->input('tag', 'Untagged'),
            'is_required' => $request->input('is_required', false),
            'required_document_type' => $request->input('required_document_type'),
            'status' => 'Pending Review', // Set status to Pending Review when uploaded
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'document' => $document
        ], 201);
    }

    /**
     * Download a document
     */
    public function download($id)
    {
        $document = Document::findOrFail($id);
        $user = auth()->user();

        // Ensure user owns this document OR is admin/faculty
        if ($document->user_id !== $user->id && !$user->isAdmin() && !$user->isFaculty()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // If faculty (not admin), ensure document belongs to one of their advisees
        if ($user->isFaculty() && !$user->isAdmin() && $document->user_id !== $user->id) {
            $advisedStudentIds = $user->advisedStudents()->pluck('student_id')->toArray();
            if (!in_array($document->user_id, $advisedStudentIds)) {
                return response()->json(['error' => 'Unauthorized. You can only access documents from your advisees.'], 403);
            }
        }

        if (!Storage::exists($document->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::download($document->file_path, $document->file_name);
    }

    /**
     * Delete a document
     */
    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Ensure user owns this document
        if ($document->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        // Delete database record
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully'
        ]);
    }

    /**
     * Get a single document's metadata
     */
    public function show($id)
    {
        $document = Document::findOrFail($id);
        $user = auth()->user();

        // Ensure user owns this document OR is admin/faculty
        if ($document->user_id !== $user->id && !$user->isAdmin() && !$user->isFaculty()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // If faculty (not admin), ensure document belongs to one of their advisees
        if ($user->isFaculty() && !$user->isAdmin() && $document->user_id !== $user->id) {
            $advisedStudentIds = $user->advisedStudents()->pluck('student_id')->toArray();
            if (!in_array($document->user_id, $advisedStudentIds)) {
                return response()->json(['error' => 'Unauthorized. You can only access documents from your advisees.'], 403);
            }
        }

        return response()->json($document);
    }

    /**
     * Get all documents (for admin/faculty review)
     */
    public function getAllDocuments(Request $request)
    {
        $user = $request->user();

        // Only admin and faculty can view all documents
        if (!$user->isAdmin() && !$user->isFaculty()) {
            return response()->json(['error' => 'Unauthorized. Admin or Faculty access required.'], 403);
        }

        $query = Document::with('user:id,first_name,last_name,email');

        // If faculty, only show documents from their advisees
        if ($user->isFaculty() && !$user->isAdmin()) {
            $advisedStudentIds = $user->advisedStudents()->pluck('student_id')->toArray();
            
            // If faculty has no advisees, return empty array
            if (empty($advisedStudentIds)) {
                return response()->json([]);
            }
            
            $query->whereIn('user_id', $advisedStudentIds);
        }

        $documents = $query->orderBy('created_at', 'desc')->get();

        // Add uploaded_by field 
        $documents = $documents->map(function ($doc) {
            $doc->uploaded_by = $doc->user ? $doc->user->first_name . ' ' . $doc->user->last_name : 'Unknown';
            return $doc;
        });

        return response()->json($documents);
    }

    /**
     * Update document status (for admin/faculty)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        // Only admin and faculty can update document status
        if (!$user->isAdmin() && !$user->isFaculty()) {
            return response()->json(['error' => 'Unauthorized. Admin or Faculty access required.'], 403);
        }

        // Validate based on status
        $rules = [
            'status' => 'required|string|in:Approved,Declined,Pending Review',
        ];
        
        // Require review_comment when declining a document
        if ($request->input('status') === 'Declined') {
            $rules['review_comment'] = 'required|string|max:2000';
        } else {
            $rules['review_comment'] = 'nullable|string|max:2000';
        }
        
        $request->validate($rules);

        $document = Document::findOrFail($id);

        // If faculty (not admin), ensure document belongs to one of their advisees
        if ($user->isFaculty() && !$user->isAdmin()) {
            $advisedStudentIds = $user->advisedStudents()->pluck('student_id')->toArray();
            if (!in_array($document->user_id, $advisedStudentIds)) {
                return response()->json(['error' => 'Unauthorized. You can only update documents from your advisees.'], 403);
            }
        }

        $document->status = $request->input('status');
        
        // Store review comment if provided
        if ($request->has('review_comment')) {
            $document->review_comment = $request->input('review_comment');
        } else {
            // Clear comment if not provided 
            $document->review_comment = null;
        }
        
        $document->save();

        return response()->json([
            'message' => 'Document status updated successfully',
            'document' => $document
        ]);
    }
}