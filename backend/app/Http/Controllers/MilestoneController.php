<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;

class MilestoneController extends Controller
{
    /**
     * Get milestones for a student
     * If studentId is provided in query, use that; otherwise use authenticated user's student ID
     */
    public function index(Request $request)
    {
        $studentId = $request->query('studentId');
        
        // If no studentId provided, try to get from authenticated user
        if (!$studentId && Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'student' && $user->student) {
                $studentId = $user->id;
            }
        }
        
        // If still no studentId, return empty milestones
        if (!$studentId) {
            return response()->json([
                'milestones' => []
            ]);
        }
        
        // Get student record
        $student = Student::with(['documents'])->find($studentId);
        
        if (!$student) {
            return response()->json([
                'milestones' => []
            ]);
        }
        
        // Define the list of required document types that every student must have
        // This matches the required documents list in the frontend
        $requiredDocumentTypes = [
            'Application Form',
            'Transcripts',
            'Letters of Recommendation',
            'Statement of Purpose',
            'Resume or CV',
            'I-9 Employment Eligibility Verification',
        ];
        
        // Check if all required document types have at least one document uploaded
        $allRequiredUploaded = true;
        foreach ($requiredDocumentTypes as $docType) {
            $hasDocument = $student->documents()
                ->where('required_document_type', $docType)
                ->where('is_required', true)
                ->exists();
            
            if (!$hasDocument) {
                $allRequiredUploaded = false;
                break;
            }
        }
        
        // Check if all required documents are approved
        // For each required document type, check if at least one document is approved
        $allRequiredApproved = false;
        if ($allRequiredUploaded) {
            $allRequiredApproved = true;
            foreach ($requiredDocumentTypes as $docType) {
                $hasApprovedDocument = $student->documents()
                    ->where('required_document_type', $docType)
                    ->where('is_required', true)
                    ->where('status', 'Approved')
                    ->exists();
                
                if (!$hasApprovedDocument) {
                    $allRequiredApproved = false;
                    break;
                }
            }
        }
        
        // Build milestones array
        $milestones = [
            [
                'id' => 1,
                'title' => 'Deficiency Courses Cleared',
                'completed' => $student->deficiency_cleared ?? false,
            ],
            [
                'id' => 2,
                'title' => 'Major Professor Selected',
                'completed' => !is_null($student->major_professor_id),
            ],
            [
                'id' => 3,
                'title' => 'Documents Uploaded',
                'completed' => $allRequiredUploaded,
            ],
            [
                'id' => 4,
                'title' => 'Documents Approved',
                'completed' => $allRequiredApproved,
            ],
        ];
        
        return response()->json([
            'milestones' => $milestones
        ]);
    }
}
