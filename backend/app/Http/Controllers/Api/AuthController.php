<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'credential' => 'required|string',
            'password' => 'required|string',
            'role' => 'required|in:siswa,guru',
        ]);

        $user = $request->role === 'siswa'
            ? User::where('nisn', $request->credential)->first()
            : User::where('nip', $request->credential)
                ->orWhere('email', $request->credential)
                ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'credential' => ['Kredensial yang diberikan tidak sesuai.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi guru Anda.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'nisn' => $user->nisn,
                'nip' => $user->nip,
                'class' => $user->class,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->only([
                'id', 'name', 'email', 'role', 'nisn', 'nip', 'class', 'phone',
            ]),
        ]);
    }
}
