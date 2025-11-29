<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdvisorController extends Controller
{
    public function show($studentId)
    {
        return response()->json(['message' => 'Advisor lookup not implemented', 'studentId' => $studentId], 200);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'message' => 'required|string',
        ]);

        // Placeholder: in production you'd send/store the message
        return response()->json(['message' => 'Message received'], 200);
    }
}
