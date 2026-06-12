<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\MaterialReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MaterialController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json([
            'categories' => MaterialCategory::withCount('materials')->orderBy('name')->get(),
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:material_categories,name',
        ]);

        $category = MaterialCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json(['message' => 'Kategori ditambahkan', 'category' => $category], 201);
    }

    public function deleteCategory(MaterialCategory $materialCategory): JsonResponse
    {
        $materialCategory->delete();
        return response()->json(['message' => 'Kategori dihapus']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Material::with(['category', 'creator:id,name']);

        if ($request->user()->role === 'siswa') {
            $query->active();
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $materials = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 12);

        return response()->json($materials);
    }

    public function show(Material $material): JsonResponse
    {
        return response()->json(['material' => $material->load(['category', 'creator:id,name'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:article,pdf,video,image',
            'file_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'category_id' => 'nullable|exists:material_categories,id',
        ]);

        $validated['created_by'] = $request->user()->id;
        $material = Material::create($validated);

        return response()->json([
            'message' => 'Materi berhasil ditambahkan',
            'material' => $material->load(['category', 'creator:id,name']),
        ], 201);
    }

    public function update(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:article,pdf,video,image',
            'file_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'category_id' => 'nullable|exists:material_categories,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $material->update($validated);

        return response()->json([
            'message' => 'Materi berhasil diubah',
            'material' => $material->fresh()->load(['category', 'creator:id,name']),
        ]);
    }

    public function destroy(Material $material): JsonResponse
    {
        $material->delete();
        return response()->json(['message' => 'Materi berhasil dihapus']);
    }

    public function markRead(Request $request, Material $material): JsonResponse
    {
        MaterialReading::updateOrCreate(
            ['user_id' => $request->user()->id, 'material_id' => $material->id],
            ['read_at' => now()]
        );

        return response()->json(['message' => 'Tercatat sudah dibaca']);
    }

    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,mp4,jpg,jpeg,png,webp|max:102400',
        ]);

        $path = $request->file('file')->store('materials', 'public');

        return response()->json([
            'message' => 'File berhasil diupload',
            'url' => asset('storage/' . $path),
        ]);
    }
}
