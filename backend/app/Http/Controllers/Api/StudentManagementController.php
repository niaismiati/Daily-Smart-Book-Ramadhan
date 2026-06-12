<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classes;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::siswa()->with('class');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $students = $query->orderBy('name')->paginate($request->per_page ?? 20);

        return response()->json($students);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'siswa') {
            return response()->json(['message' => 'User bukan siswa'], 404);
        }
        return response()->json(['student' => $user->load('class')]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nisn' => 'required|string|unique:users,nisn',
            'class_id' => 'required|exists:classes,id',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string',
            'password' => 'required|string|min:6',
        ]);

        $validated['role'] = 'siswa';
        $validated['password'] = bcrypt($validated['password']);
        $validated['class'] = Classes::find($validated['class_id'])?->name;

        $user = User::create($validated);

        return response()->json([
            'message' => 'Siswa berhasil ditambahkan',
            'student' => $user->load('class'),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'siswa') {
            return response()->json(['message' => 'User bukan siswa'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'nisn' => 'sometimes|string|unique:users,nisn,' . $user->id,
            'class_id' => 'sometimes|exists:classes,id',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['class_id'])) {
            $validated['class'] = Classes::find($validated['class_id'])?->name;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Siswa berhasil diubah',
            'student' => $user->fresh()->load('class'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role !== 'siswa') {
            return response()->json(['message' => 'User bukan siswa'], 404);
        }
        $user->delete();
        return response()->json(['message' => 'Siswa berhasil dihapus']);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'siswa') {
            return response()->json(['message' => 'User bukan siswa'], 404);
        }

        $request->validate(['password' => 'required|string|min:6']);
        $user->update(['password' => bcrypt($request->password)]);

        return response()->json(['message' => 'Password berhasil direset']);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'students' => 'required|array',
            'students.*.name' => 'required|string|max:255',
            'students.*.nisn' => 'required|string|distinct',
            'students.*.class_id' => 'required|exists:classes,id',
            'students.*.password' => 'required|string|min:6',
        ]);

        $imported = 0;
        foreach ($request->students as $data) {
            $data['role'] = 'siswa';
            $data['password'] = bcrypt($data['password']);
            $data['class'] = Classes::find($data['class_id'])?->name;
            try {
                User::create($data);
                $imported++;
            } catch (\Exception $e) {
                continue;
            }
        }

        return response()->json([
            'message' => "{$imported} siswa berhasil diimpor",
            'imported' => $imported,
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $query = User::siswa()->with('class');

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $students = $query->orderBy('name')->get()->map(function ($s) {
            return [
                'Nama' => $s->name,
                'NISN' => $s->nisn,
                'Kelas' => $s->class?->name ?? $s->class,
                'Email' => $s->email,
                'Status' => $s->is_active ? 'Aktif' : 'Nonaktif',
            ];
        });

        return response()->json(['students' => $students]);
    }
}
