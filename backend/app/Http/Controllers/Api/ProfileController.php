<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('class'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string',
            'photo' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diubah',
            'user' => $user->fresh()->load('class'),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Password saat ini salah'], 422);
        }

        $user->update(['password' => bcrypt($validated['new_password'])]);

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('photo')->store('photos', 'public');

        $request->user()->update(['photo' => $path]);

        return response()->json([
            'message' => 'Foto berhasil diupload',
            'url' => asset('storage/' . $path),
        ]);
    }
}
