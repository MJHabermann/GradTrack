<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RegistrarController extends Controller
{
    public function getCompletion($studentId)
    {
        //TODO: Get IT to fetch real registrar data
        // Example logic — replace with real registrar integration
        $completedCredits = 78;
        $requiredCredits = 120;

        $percentage = round(($completedCredits / $requiredCredits) * 100, 2);

        return response()->json([
            'completed' => $completedCredits,
            'required' => $requiredCredits,
            'percentage' => $percentage
        ]);
    }
}
