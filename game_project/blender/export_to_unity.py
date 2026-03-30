"""
Export Blender assets to FBX for Unity
"""
import bpy
import os

# Output path
OUTPUT_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/game_project/unity/SlimeSurge/Assets/Models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 50)
print("Exporting assets to Unity...")
print("=" * 50)

# Get all mesh objects
mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']

# Export each object separately
for obj in mesh_objects:
    # Skip helper objects
    if obj.name.startswith("_") or "helper" in obj.name.lower():
        continue
    
    # Deselect all
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select this object
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    # Export path
    export_path = os.path.join(OUTPUT_DIR, f"{obj.name}.fbx")
    
    # Export as FBX
    bpy.ops.export_scene.fbx(
        filepath=export_path,
        use_selection=True,
        apply_scale_options='FBX_SCALE_ALL',
        path_mode='COPY',
        embed_textures=True,
        mesh_smooth_type='FACE',
        use_mesh_modifiers=True,
        bake_anim=False
    )
    
    print(f"✓ Exported: {obj.name}.fbx")

print("\n" + "=" * 50)
print(f"Exported {len(mesh_objects)} objects to {OUTPUT_DIR}")
print("=" * 50)
