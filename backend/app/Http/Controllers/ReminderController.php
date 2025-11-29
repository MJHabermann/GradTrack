<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reminder;

class ReminderController extends Controller
{
    public function index(Request $request)
    {
        return Reminder::where('user_id', $request->user()->id)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'in:low,medium,high',
        ]);

        $validated['user_id'] = $request->user()->id;

        return Reminder::create($validated);
    }

    public function update(Request $request, $id)
    {
        $reminder = Reminder::where('user_id', $request->user()->id)->findOrFail($id);
        $reminder->update($request->only(['text', 'due_date', 'priority', 'is_complete']));
        return $reminder;
    }

    public function destroy(Request $request, $id)
    {
        $reminder = Reminder::where('user_id', $request->user()->id)->findOrFail($id);
        $reminder->delete();
        return response()->json(['message' => 'Reminder deleted']);
    }

}

