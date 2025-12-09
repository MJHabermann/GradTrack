<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reminder;
use App\Models\User;

class ReminderController extends Controller
{
    public function index(Request $request)
    {
        $reminders = Reminder::where('user_id', $request->user()->id)
            ->with('createdBy:id,first_name,last_name')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reminders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'in:low,medium,high',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['created_by_id'] = $request->user()->id;

        $reminder = Reminder::create($validated);
        $reminder->load('createdBy:id,first_name,last_name');
        
        return response()->json($reminder, 201);
    }

    /**
     * Send a reminder to a specific student (for faculty/admin)
     */
    public function sendToStudent(Request $request, $studentId)
    {
        $user = $request->user();

        // Only admin and faculty can send reminders to students
        if (!$user->isAdmin() && !$user->isFaculty()) {
            return response()->json(['error' => 'Unauthorized. Admin or Faculty access required.'], 403);
        }

        // Verify the student exists
        $student = User::where('id', $studentId)
            ->where('role', 'student')
            ->firstOrFail();

        $validated = $request->validate([
            'text' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'in:low,medium,high',
        ]);

        $validated['user_id'] = $studentId;
        $validated['created_by_id'] = $user->id;
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $reminder = Reminder::create($validated);

        return response()->json([
            'message' => 'Reminder sent successfully',
            'reminder' => $reminder->load('createdBy:id,first_name,last_name')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $reminder = Reminder::where('user_id', $request->user()->id)->findOrFail($id);
        $reminder->update($request->only(['text', 'due_date', 'priority', 'is_complete']));
        $reminder->load('createdBy:id,first_name,last_name');
        return response()->json($reminder);
    }

    public function destroy(Request $request, $id)
    {
        $reminder = Reminder::where('user_id', $request->user()->id)->findOrFail($id);
        $reminder->delete();
        return response()->json(['message' => 'Reminder deleted']);
    }

}

