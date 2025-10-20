<?php

namespace App\Http\Controllers;

use App\Models\Advisor;
use App\Models\Student;
use Illuminate\Http\Request;

class AdvisorController extends Controller
{
    public function show($studentId)
    {
        $student = Student::with('advisor')->find($studentId);

        if (!$student || !$student->advisor) {
            return response()->json(['error' => 'Advisor not found'], 404);
        }

        return response()->json($student->advisor);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'studentId' => 'required|integer',
            'message' => 'required|string',
        ]);

        // TODO: Send email or store message
        return response()->json(['status' => 'Message sent']);
    }
}
