<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orWhereNull('user_id')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id && $notification->user_id !== null) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Notifikasi dibaca']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi dibaca']);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|in:info,warning,achievement,announcement',
        ]);

        $validated['created_by'] = $request->user()->id;
        $notification = Notification::create($validated);

        return response()->json([
            'message' => 'Notifikasi berhasil dikirim',
            'notification' => $notification,
        ], 201);
    }

    public function delete(Notification $notification): JsonResponse
    {
        $notification->delete();
        return response()->json(['message' => 'Notifikasi dihapus']);
    }
}
