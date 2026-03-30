"""
Low Poly Tree Generator for Blender
Generates a stylized low poly tree with trunk and foliage
Run with: blender --background --python low_poly_tree.py
"""

import bpy
import bmesh
import math
import random
from mathutils import Vector

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ============================================
# MATERIALS
# ============================================

def create_trunk_material():
    """Create a brown wood material for the trunk"""
    mat = bpy.data.materials.new(name="Trunk_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.35, 0.2, 0.1, 1.0)  # Brown
    bsdf.inputs['Roughness'].default_value = 0.8
    bsdf.location = (0, 0)
    
    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)
    
    # Link
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_leaves_material():
    """Create a green foliage material"""
    mat = bpy.data.materials.new(name="Leaves_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.15, 0.45, 0.15, 1.0)  # Forest green
    bsdf.inputs['Roughness'].default_value = 0.6
    bsdf.location = (0, 0)
    
    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)
    
    # Link
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

# ============================================
# GEOMETRY
# ============================================

def create_low_poly_trunk(base_radius=0.3, top_radius=0.15, height=2.0, segments=6):
    """Create a low poly tree trunk (tapered cylinder)"""
    
    # Create mesh and object
    mesh = bpy.data.meshes.new("Trunk_Mesh")
    obj = bpy.data.objects.new("Trunk", mesh)
    bpy.context.collection.objects.link(obj)
    
    # Create BMesh
    bm = bmesh.new()
    
    # Create vertices for bottom ring
    bottom_verts = []
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        x = base_radius * math.cos(angle)
        y = base_radius * math.sin(angle)
        v = bm.verts.new((x, y, 0))
        bottom_verts.append(v)
    
    # Create vertices for top ring (slightly irregular for low poly look)
    top_verts = []
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        # Add slight randomness for organic look
        r = top_radius * (0.9 + random.random() * 0.2)
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        v = bm.verts.new((x, y, height))
        top_verts.append(v)
    
    bm.verts.ensure_lookup_table()
    
    # Create side faces
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([
            bottom_verts[i],
            bottom_verts[next_i],
            top_verts[next_i],
            top_verts[i]
        ])
    
    # Create bottom cap
    bm.faces.new(bottom_verts[::-1])
    
    # Create top cap
    bm.faces.new(top_verts)
    
    # Write to mesh
    bm.to_mesh(mesh)
    bm.free()
    
    return obj

def create_low_poly_foliage(center, radius, height, segments=8, rings=3):
    """Create a low poly cone/sphere for foliage"""
    
    mesh = bpy.data.meshes.new("Foliage_Mesh")
    obj = bpy.data.objects.new("Foliage", mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    
    # Create layered cone shape (Christmas tree style)
    all_rings = []
    
    for ring in range(rings + 1):
        t = ring / rings
        # Cone shape with slight bulge
        ring_radius = radius * (1 - t * 0.9)
        ring_height = center.z + height * t
        
        ring_verts = []
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            # Add randomness for low poly organic look
            r = ring_radius * (0.85 + random.random() * 0.3)
            x = center.x + r * math.cos(angle)
            y = center.y + r * math.sin(angle)
            z = ring_height + random.uniform(-0.1, 0.1) * height
            v = bm.verts.new((x, y, z))
            ring_verts.append(v)
        all_rings.append(ring_verts)
    
    # Add top vertex
    top_vert = bm.verts.new((center.x, center.y, center.z + height * 1.1))
    
    bm.verts.ensure_lookup_table()
    
    # Create faces between rings
    for ring_idx in range(len(all_rings) - 1):
        lower_ring = all_rings[ring_idx]
        upper_ring = all_rings[ring_idx + 1]
        
        for i in range(segments):
            next_i = (i + 1) % segments
            bm.faces.new([
                lower_ring[i],
                lower_ring[next_i],
                upper_ring[next_i],
                upper_ring[i]
            ])
    
    # Create top cone faces
    top_ring = all_rings[-1]
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([top_ring[i], top_ring[next_i], top_vert])
    
    # Create bottom cap
    bm.faces.new(all_rings[0][::-1])
    
    bm.to_mesh(mesh)
    bm.free()
    
    return obj

def create_tree():
    """Create a complete low poly tree"""
    
    # Create materials
    trunk_mat = create_trunk_material()
    leaves_mat = create_leaves_material()
    
    # Create trunk
    trunk = create_low_poly_trunk(
        base_radius=0.25,
        top_radius=0.12,
        height=1.8,
        segments=6
    )
    trunk.data.materials.append(trunk_mat)
    
    # Create main foliage layers (3 stacked cones)
    foliage_objects = []
    
    # Bottom layer (largest)
    foliage1 = create_low_poly_foliage(
        center=Vector((0, 0, 1.5)),
        radius=1.2,
        height=1.0,
        segments=8,
        rings=2
    )
    foliage1.data.materials.append(leaves_mat)
    foliage_objects.append(foliage1)
    
    # Middle layer
    foliage2 = create_low_poly_foliage(
        center=Vector((0, 0, 2.2)),
        radius=0.9,
        height=0.9,
        segments=7,
        rings=2
    )
    foliage2.data.materials.append(leaves_mat)
    foliage_objects.append(foliage2)
    
    # Top layer (smallest)
    foliage3 = create_low_poly_foliage(
        center=Vector((0, 0, 2.8)),
        radius=0.6,
        height=0.8,
        segments=6,
        rings=2
    )
    foliage3.data.materials.append(leaves_mat)
    foliage_objects.append(foliage3)
    
    # Join all foliage into one object
    bpy.context.view_layer.objects.active = foliage1
    for obj in foliage_objects:
        obj.select_set(True)
    bpy.ops.object.join()
    
    # Rename
    foliage = bpy.context.active_object
    foliage.name = "Tree_Foliage"
    
    # Select both trunk and foliage
    trunk.select_set(True)
    foliage.select_set(True)
    
    return trunk, foliage

# ============================================
# SCENE SETUP
# ============================================

def setup_scene():
    """Setup lighting and camera"""
    
    # Add sun light
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 3.0
    sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(45))
    
    # Add camera
    bpy.ops.object.camera_add(location=(4, -4, 3))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(70), 0, math.radians(45))
    bpy.context.scene.camera = camera
    
    # Set render settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 64
    bpy.context.scene.render.resolution_x = 1920
    bpy.context.scene.render.resolution_y = 1080
    
    # Set world background
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.6, 0.8, 1.0, 1.0)  # Light blue sky
    bg.inputs['Strength'].default_value = 0.5

def add_ground():
    """Add a simple ground plane"""
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Ground"
    
    # Create ground material
    mat = bpy.data.materials.new(name="Ground_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.3, 0.5, 0.2, 1.0)  # Grass green
    bsdf.inputs['Roughness'].default_value = 0.9
    
    ground.data.materials.append(mat)
    ground.select_set(False)

# ============================================
# MAIN
# ============================================

print("=" * 50)
print("Low Poly Tree Generator")
print("=" * 50)

# Set random seed for reproducibility
random.seed(42)

# Create tree
trunk, foliage = create_tree()
print(f"✓ Created trunk with {len(trunk.data.polygons)} faces")
print(f"✓ Created foliage with {len(foliage.data.polygons)} faces")

# Add ground
add_ground()
print("✓ Added ground plane")

# Setup scene
setup_scene()
print("✓ Setup lighting and camera")

# Save the file
output_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/low_poly_tree.blend"
bpy.ops.wm.save_as_mainfile(filepath=output_path)
print(f"✓ Saved to: {output_path}")

# Render preview
render_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/low_poly_tree_render.png"
bpy.context.scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)
print(f"✓ Rendered to: {render_path}")

print("=" * 50)
print("Done! 🌲")
print("=" * 50)
