"""
SLIME SURGE - Game Assets Generator
Creates low poly 3D assets for the hyper-casual game
"""

import bpy
import bmesh
import math
import random
from mathutils import Vector
import os

print("=" * 60)
print("🎮 SLIME SURGE - Asset Generator")
print("=" * 60)

# Output directory
OUTPUT_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/game_project/blender/exports"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ============================================
# MATERIALS
# ============================================

def create_slime_material(color=(0.5, 1.0, 0.3, 1.0), name="Slime_Green"):
    """Create glossy slime material with subsurface"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (600, 0)
    
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (300, 0)
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.15
    bsdf.inputs['Subsurface Weight'].default_value = 0.4
    bsdf.inputs['Subsurface Radius'].default_value = (0.5, 1.0, 0.3)
    bsdf.inputs['Specular IOR Level'].default_value = 0.8
    bsdf.inputs['Transmission Weight'].default_value = 0.2
    
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_matte_material(color, name):
    """Create simple matte material"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.7
    return mat

def create_gem_material(color, name):
    """Create shiny gem material"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.1
    bsdf.inputs['Specular IOR Level'].default_value = 1.0
    bsdf.inputs['Transmission Weight'].default_value = 0.3
    return mat

def create_metal_material(color, name):
    """Create metallic material"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = 0.3
    return mat

# ============================================
# SLIME CHARACTER
# ============================================

def create_slime(name="Slime", color=(0.5, 1.0, 0.3, 1.0)):
    """Create the main slime character"""
    # Base body - squashed sphere
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32, ring_count=16,
        radius=0.5,
        location=(0, 0, 0.3)
    )
    body = bpy.context.active_object
    body.name = f"{name}_Body"
    
    # Squash it
    body.scale = (1.0, 1.0, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    
    # Edit to make bottom flat
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(body.data)
    for v in bm.verts:
        if v.co.z < 0:
            v.co.z = max(v.co.z, -0.05)
            # Flatten bottom
            dist = math.sqrt(v.co.x**2 + v.co.y**2)
            if dist < 0.4:
                v.co.z = -0.05
    bmesh.update_edit_mesh(body.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Subdivision for smoothness
    mod = body.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    # Create eyes
    eye_positions = [(0.15, 0.25, 0.35), (-0.15, 0.25, 0.35)]
    eyes = []
    for i, pos in enumerate(eye_positions):
        # Eye white
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16, ring_count=12,
            radius=0.1,
            location=pos
        )
        eye_white = bpy.context.active_object
        eye_white.name = f"{name}_Eye_White_{i}"
        
        white_mat = create_matte_material((1, 1, 1, 1), f"Eye_White_{i}")
        eye_white.data.materials.append(white_mat)
        eyes.append(eye_white)
        
        # Pupil
        pupil_pos = (pos[0], pos[1] + 0.05, pos[2] + 0.02)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=12, ring_count=8,
            radius=0.05,
            location=pupil_pos
        )
        pupil = bpy.context.active_object
        pupil.name = f"{name}_Pupil_{i}"
        
        black_mat = create_matte_material((0.05, 0.05, 0.05, 1), f"Pupil_{i}")
        pupil.data.materials.append(black_mat)
        eyes.append(pupil)
        
        # Eye shine
        shine_pos = (pos[0] + 0.03, pos[1] + 0.07, pos[2] + 0.04)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=8, ring_count=6,
            radius=0.02,
            location=shine_pos
        )
        shine = bpy.context.active_object
        shine.name = f"{name}_Shine_{i}"
        shine.data.materials.append(white_mat)
        eyes.append(shine)
    
    # Apply material to body
    slime_mat = create_slime_material(color, f"Slime_Mat_{name}")
    body.data.materials.append(slime_mat)
    
    # Join all parts
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    for eye in eyes:
        eye.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    
    slime = bpy.context.active_object
    slime.name = name
    
    return slime

# ============================================
# COLLECTIBLES
# ============================================

def create_gem(color=(0.8, 0.2, 0.9, 1.0), name="Gem"):
    """Create a collectible gem"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=6, ring_count=4,
        radius=0.15,
        location=(0, 0, 0.15)
    )
    gem = bpy.context.active_object
    gem.name = name
    
    # Make it faceted
    gem.scale = (0.8, 0.8, 1.2)
    bpy.ops.object.transform_apply(scale=True)
    
    mat = create_gem_material(color, f"Gem_Mat_{name}")
    gem.data.materials.append(mat)
    
    return gem

def create_coin(name="Coin"):
    """Create a gold coin"""
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=0.15,
        depth=0.03,
        location=(0, 0, 0.15)
    )
    coin = bpy.context.active_object
    coin.name = name
    
    mat = create_metal_material((1.0, 0.85, 0.0, 1.0), "Gold")
    coin.data.materials.append(mat)
    
    return coin

def create_fruit_apple(name="Apple"):
    """Create a low poly apple"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=8, ring_count=6,
        radius=0.12,
        location=(0, 0, 0.12)
    )
    apple = bpy.context.active_object
    apple.name = name
    
    # Dent at top
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(apple.data)
    for v in bm.verts:
        if v.co.z > 0.08:
            factor = (v.co.z - 0.08) / 0.04
            v.co.z -= factor * 0.03
    bmesh.update_edit_mesh(apple.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Stem
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6,
        radius=0.015,
        depth=0.04,
        location=(0, 0, 0.14)
    )
    stem = bpy.context.active_object
    stem.name = f"{name}_Stem"
    
    stem_mat = create_matte_material((0.4, 0.25, 0.1, 1.0), "Stem")
    stem.data.materials.append(stem_mat)
    
    apple_mat = create_matte_material((0.9, 0.15, 0.15, 1.0), "Apple_Red")
    apple.data.materials.append(apple_mat)
    
    # Join
    bpy.ops.object.select_all(action='DESELECT')
    apple.select_set(True)
    stem.select_set(True)
    bpy.context.view_layer.objects.active = apple
    bpy.ops.object.join()
    
    return bpy.context.active_object

def create_star(name="Star"):
    """Create a collectible star"""
    # Use a circle extruded with star shape
    bpy.ops.mesh.primitive_circle_add(
        vertices=10,
        radius=0.15,
        location=(0, 0, 0.15)
    )
    star = bpy.context.active_object
    star.name = name
    
    # Make star shape
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(star.data)
    for i, v in enumerate(bm.verts):
        if i % 2 == 1:  # Every other vertex
            v.co *= 0.5
    bmesh.update_edit_mesh(star.data)
    
    # Extrude
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(
        TRANSFORM_OT_translate={"value": (0, 0, 0.05)}
    )
    bpy.ops.object.mode_set(mode='OBJECT')
    
    mat = create_metal_material((1.0, 0.9, 0.2, 1.0), "Star_Gold")
    star.data.materials.append(mat)
    
    return star

def create_cube_obstacle(name="Cube", color=(0.9, 0.3, 0.3, 1.0)):
    """Create an obstacle cube"""
    bpy.ops.mesh.primitive_cube_add(size=0.4, location=(0, 0, 0.2))
    cube = bpy.context.active_object
    cube.name = name
    
    # Bevel edges
    mod = cube.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = 0.02
    mod.segments = 2
    
    mat = create_matte_material(color, f"Cube_Mat_{name}")
    cube.data.materials.append(mat)
    
    return cube

# ============================================
# GATES
# ============================================

def create_gate(multiplier="x2", color=(0.2, 0.9, 0.4, 1.0), name="Gate"):
    """Create a multiplier gate"""
    # Left pillar
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=0.08,
        depth=1.0,
        location=(-0.5, 0, 0.5)
    )
    left = bpy.context.active_object
    left.name = f"{name}_Left"
    
    # Right pillar
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=0.08,
        depth=1.0,
        location=(0.5, 0, 0.5)
    )
    right = bpy.context.active_object
    right.name = f"{name}_Right"
    
    # Top bar
    bpy.ops.mesh.primitive_cube_add(
        size=1.0,
        location=(0, 0, 0.9)
    )
    top = bpy.context.active_object
    top.name = f"{name}_Top"
    top.scale = (1.2, 0.1, 0.15)
    bpy.ops.object.transform_apply(scale=True)
    
    # Apply material
    mat = create_matte_material(color, f"Gate_Mat_{name}")
    left.data.materials.append(mat)
    right.data.materials.append(mat)
    top.data.materials.append(mat)
    
    # Join
    bpy.ops.object.select_all(action='DESELECT')
    left.select_set(True)
    right.select_set(True)
    top.select_set(True)
    bpy.context.view_layer.objects.active = left
    bpy.ops.object.join()
    
    gate = bpy.context.active_object
    gate.name = name
    
    return gate

# ============================================
# ENVIRONMENT
# ============================================

def create_platform(name="Platform"):
    """Create a game platform/track section"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.1))
    platform = bpy.context.active_object
    platform.name = name
    platform.scale = (2, 5, 0.2)
    bpy.ops.object.transform_apply(scale=True)
    
    # Bevel
    mod = platform.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = 0.05
    mod.segments = 2
    
    mat = create_matte_material((0.9, 0.85, 0.95, 1.0), "Platform_Pastel")
    platform.data.materials.append(mat)
    
    return platform

def create_cloud(name="Cloud"):
    """Create a low poly cloud"""
    positions = [
        (0, 0, 0),
        (0.25, 0.1, 0.05),
        (-0.2, -0.05, 0.03),
        (0.1, -0.15, -0.02),
    ]
    
    spheres = []
    for i, pos in enumerate(positions):
        size = 0.2 + random.random() * 0.1
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=8, ring_count=6,
            radius=size,
            location=pos
        )
        sphere = bpy.context.active_object
        sphere.name = f"{name}_Part_{i}"
        spheres.append(sphere)
    
    # Join
    bpy.ops.object.select_all(action='DESELECT')
    for s in spheres:
        s.select_set(True)
    bpy.context.view_layer.objects.active = spheres[0]
    bpy.ops.object.join()
    
    cloud = bpy.context.active_object
    cloud.name = name
    
    mat = create_matte_material((1.0, 1.0, 1.0, 1.0), "Cloud_White")
    cloud.data.materials.append(mat)
    
    return cloud

# ============================================
# BOSS
# ============================================

def create_boss_cube(name="Boss_Cube"):
    """Create a boss enemy - big angry cube"""
    bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 0.75))
    boss = bpy.context.active_object
    boss.name = name
    
    # Bevel
    mod = boss.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = 0.05
    mod.segments = 2
    
    # Eyes
    eye_positions = [(0.3, 0.76, 0.9), (-0.3, 0.76, 0.9)]
    for i, pos in enumerate(eye_positions):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=12, ring_count=8,
            radius=0.15,
            location=pos
        )
        eye = bpy.context.active_object
        eye.name = f"{name}_Eye_{i}"
        
        white_mat = create_matte_material((1, 1, 1, 1), f"Boss_Eye_White_{i}")
        eye.data.materials.append(white_mat)
        
        # Angry pupil
        pupil_pos = (pos[0], pos[1] + 0.1, pos[2] - 0.03)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=8, ring_count=6,
            radius=0.08,
            location=pupil_pos
        )
        pupil = bpy.context.active_object
        pupil.name = f"{name}_Pupil_{i}"
        
        red_mat = create_matte_material((0.8, 0.1, 0.1, 1), f"Boss_Pupil_{i}")
        pupil.data.materials.append(red_mat)
    
    # Boss body material
    mat = create_matte_material((0.3, 0.3, 0.35, 1.0), "Boss_Dark")
    boss.data.materials.append(mat)
    
    return boss

# ============================================
# GENERATE ALL ASSETS
# ============================================

def setup_scene():
    """Setup rendering"""
    # Camera
    bpy.ops.object.camera_add(location=(3, -3, 2))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(65), 0, math.radians(45))
    bpy.context.scene.camera = camera
    
    # Light
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 3
    
    # World
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.7, 0.85, 1.0, 1.0)
    
    # Render settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 64
    bpy.context.scene.render.resolution_x = 1920
    bpy.context.scene.render.resolution_y = 1080

# Generate assets
print("\n📦 Generating assets...\n")

# 1. Main Slime Character
slime = create_slime("Blobby", (0.5, 1.0, 0.3, 1.0))
slime.location = (0, 0, 0)
print(f"✓ Created Slime: {len(slime.data.polygons)} faces")

# 2. Slime variants (different colors)
colors = [
    ((0.3, 0.7, 1.0, 1.0), "Slime_Blue"),
    ((1.0, 0.5, 0.2, 1.0), "Slime_Orange"),
    ((0.9, 0.3, 0.9, 1.0), "Slime_Purple"),
    ((1.0, 0.8, 0.2, 1.0), "Slime_Gold"),
]
for i, (color, name) in enumerate(colors):
    variant = create_slime(name, color)
    variant.location = ((i+1) * 1.5, 0, 0)
    print(f"✓ Created {name}")

# 3. Collectibles
gem = create_gem((0.9, 0.2, 0.9, 1.0), "Gem_Purple")
gem.location = (0, 2, 0)
print("✓ Created Gem")

coin = create_coin("Gold_Coin")
coin.location = (1, 2, 0)
print("✓ Created Coin")

apple = create_fruit_apple("Apple")
apple.location = (2, 2, 0)
print("✓ Created Apple")

star = create_star("Star")
star.location = (3, 2, 0)
print("✓ Created Star")

# 4. Obstacle
cube_obs = create_cube_obstacle("Obstacle_Red", (0.9, 0.3, 0.3, 1.0))
cube_obs.location = (0, 4, 0)
print("✓ Created Obstacle")

# 5. Gate
gate = create_gate("x2", (0.2, 0.9, 0.4, 1.0), "Gate_Multiply")
gate.location = (0, 6, 0)
print("✓ Created Gate")

# 6. Platform
platform = create_platform("Track_Section")
platform.location = (0, -3, 0)
print("✓ Created Platform")

# 7. Cloud
cloud = create_cloud("Cloud")
cloud.location = (3, 0, 2)
print("✓ Created Cloud")

# 8. Boss
boss = create_boss_cube("Boss_Cube")
boss.location = (0, 10, 0)
print("✓ Created Boss")

# Setup scene
setup_scene()
print("\n✓ Scene setup complete")

# Save
blend_path = f"{OUTPUT_DIR}/slime_surge_assets.blend"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"✓ Saved: {blend_path}")

# Render
render_path = f"{OUTPUT_DIR}/assets_preview.png"
bpy.context.scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)
print(f"✓ Rendered: {render_path}")

print("\n" + "=" * 60)
print("🎮 All assets generated successfully!")
print("=" * 60)
