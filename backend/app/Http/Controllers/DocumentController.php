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

        // Ensure user owns this document
        if ($document->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
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

        // Ensure user owns this document
        if ($document->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($document);
    }
}