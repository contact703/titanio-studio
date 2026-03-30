"""
Highpoly Realistic Goat Generator for Blender
Creates a detailed goat model and places it under the tree
Run with: blender low_poly_tree.blend --background --python add_goat.py
"""

import bpy
import bmesh
import math
import random
from mathutils import Vector

print("=" * 50)
print("Highpoly Goat Generator")
print("=" * 50)

# ============================================
# MATERIALS
# ============================================

def create_goat_fur_material():
    """Create realistic goat fur material with subsurface scattering"""
    mat = bpy.data.materials.new(name="Goat_Fur")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (800, 0)
    
    # Principled BSDF for fur
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (400, 0)
    bsdf.inputs['Base Color'].default_value = (0.65, 0.55, 0.45, 1.0)  # Light brown/cream
    bsdf.inputs['Roughness'].default_value = 0.85
    bsdf.inputs['Subsurface Weight'].default_value = 0.1
    bsdf.inputs['Subsurface Radius'].default_value = (0.1, 0.05, 0.02)
    bsdf.inputs['Sheen Weight'].default_value = 0.3  # Fur sheen
    
    # Noise texture for fur variation
    noise = nodes.new('ShaderNodeTexNoise')
    noise.location = (-200, 100)
    noise.inputs['Scale'].default_value = 50.0
    noise.inputs['Detail'].default_value = 8.0
    
    # Color ramp for fur color variation
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.location = (0, 100)
    ramp.color_ramp.elements[0].color = (0.5, 0.4, 0.3, 1.0)  # Darker brown
    ramp.color_ramp.elements[1].color = (0.75, 0.65, 0.55, 1.0)  # Lighter cream
    
    # Bump for fur texture
    bump = nodes.new('ShaderNodeBump')
    bump.location = (200, -200)
    bump.inputs['Strength'].default_value = 0.3
    
    # Links
    links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_horn_material():
    """Create realistic horn material"""
    mat = bpy.data.materials.new(name="Goat_Horn")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (600, 0)
    
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (300, 0)
    bsdf.inputs['Base Color'].default_value = (0.25, 0.2, 0.15, 1.0)  # Dark brown
    bsdf.inputs['Roughness'].default_value = 0.4
    bsdf.inputs['Specular IOR Level'].default_value = 0.5
    
    # Ring texture for horn rings
    wave = nodes.new('ShaderNodeTexWave')
    wave.location = (-100, 0)
    wave.wave_type = 'RINGS'
    wave.inputs['Scale'].default_value = 15.0
    
    bump = nodes.new('ShaderNodeBump')
    bump.location = (100, -150)
    bump.inputs['Strength'].default_value = 0.5
    
    links.new(wave.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_hoof_material():
    """Create hoof material"""
    mat = bpy.data.materials.new(name="Goat_Hoof")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.15, 0.12, 0.1, 1.0)  # Very dark brown
    bsdf.inputs['Roughness'].default_value = 0.6
    return mat

def create_eye_material():
    """Create eye material"""
    mat = bpy.data.materials.new(name="Goat_Eye")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.8, 0.6, 0.1, 1.0)  # Golden/amber
    bsdf.inputs['Roughness'].default_value = 0.1
    bsdf.inputs['Specular IOR Level'].default_value = 1.0
    return mat

def create_nose_material():
    """Create nose material"""
    mat = bpy.data.materials.new(name="Goat_Nose")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.2, 0.15, 0.15, 1.0)  # Dark pinkish
    bsdf.inputs['Roughness'].default_value = 0.7
    bsdf.inputs['Subsurface Weight'].default_value = 0.2
    return mat

# ============================================
# GOAT BODY PARTS
# ============================================

def create_body():
    """Create the main body - elongated sphere"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32, ring_count=24,
        radius=0.4,
        location=(0, 0, 0.5)
    )
    body = bpy.context.active_object
    body.name = "Goat_Body"
    
    # Scale to make it elongated
    body.scale = (1.0, 1.8, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    
    # Add subdivision
    mod = body.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return body

def create_head():
    """Create the head"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24, ring_count=16,
        radius=0.18,
        location=(0, 1.0, 0.7)
    )
    head = bpy.context.active_object
    head.name = "Goat_Head"
    
    # Scale for goat head shape
    head.scale = (0.85, 1.3, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    
    mod = head.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return head

def create_snout():
    """Create the snout/muzzle"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=12,
        radius=0.1,
        location=(0, 1.25, 0.6)
    )
    snout = bpy.context.active_object
    snout.name = "Goat_Snout"
    
    snout.scale = (0.9, 1.2, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    
    mod = snout.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return snout

def create_ear(side='left'):
    """Create an ear"""
    bpy.ops.mesh.primitive_cone_add(
        vertices=12,
        radius1=0.06,
        radius2=0.02,
        depth=0.15,
        location=(0.12 if side == 'left' else -0.12, 0.95, 0.85)
    )
    ear = bpy.context.active_object
    ear.name = f"Goat_Ear_{side}"
    
    # Rotate ear outward
    ear.rotation_euler = (math.radians(70), math.radians(30 if side == 'left' else -30), 0)
    
    mod = ear.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return ear

def create_horn(side='left'):
    """Create a curved horn"""
    # Create a curve for the horn path
    bpy.ops.curve.primitive_bezier_curve_add(location=(0.08 if side == 'left' else -0.08, 0.9, 0.9))
    curve = bpy.context.active_object
    curve.name = f"Goat_Horn_Curve_{side}"
    
    # Adjust curve points for horn shape
    points = curve.data.splines[0].bezier_points
    points[0].co = Vector((0, 0, 0))
    points[0].handle_right = Vector((0, 0.1, 0.1))
    points[0].handle_left = Vector((0, -0.05, -0.05))
    
    points[1].co = Vector((0.05 if side == 'left' else -0.05, 0.1, 0.25))
    points[1].handle_left = Vector((0.02 if side == 'left' else -0.02, 0.05, 0.15))
    points[1].handle_right = Vector((0.08 if side == 'left' else -0.08, 0.15, 0.35))
    
    # Set curve bevel for thickness
    curve.data.bevel_depth = 0.025
    curve.data.bevel_resolution = 8
    curve.data.use_fill_caps = True
    
    # Taper - thinner at tip
    curve.data.taper_radius_mode = 'OVERRIDE'
    for point in points:
        point.radius = 1.0
    points[1].radius = 0.3
    
    # Convert to mesh
    bpy.ops.object.convert(target='MESH')
    horn = bpy.context.active_object
    horn.name = f"Goat_Horn_{side}"
    
    mod = horn.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return horn

def create_leg(position):
    """Create a leg at the given position (x, y)"""
    x, y = position
    
    # Upper leg
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=0.06,
        depth=0.3,
        location=(x, y, 0.35)
    )
    upper = bpy.context.active_object
    upper.name = f"Goat_Leg_Upper_{x}_{y}"
    
    # Lower leg
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=0.045,
        depth=0.25,
        location=(x, y, 0.12)
    )
    lower = bpy.context.active_object
    lower.name = f"Goat_Leg_Lower_{x}_{y}"
    
    # Hoof
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=12, ring_count=8,
        radius=0.05,
        location=(x, y, 0.02)
    )
    hoof = bpy.context.active_object
    hoof.name = f"Goat_Hoof_{x}_{y}"
    hoof.scale = (0.8, 1.2, 0.6)
    
    # Add subdivision to all
    for obj in [upper, lower, hoof]:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = 1
        mod.render_levels = 2
    
    return upper, lower, hoof

def create_eye(side='left'):
    """Create an eye"""
    x_pos = 0.08 if side == 'left' else -0.08
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=12,
        radius=0.025,
        location=(x_pos, 1.1, 0.75)
    )
    eye = bpy.context.active_object
    eye.name = f"Goat_Eye_{side}"
    return eye

def create_tail():
    """Create a small tail"""
    bpy.ops.mesh.primitive_cone_add(
        vertices=12,
        radius1=0.04,
        radius2=0.015,
        depth=0.12,
        location=(0, -0.7, 0.55)
    )
    tail = bpy.context.active_object
    tail.name = "Goat_Tail"
    tail.rotation_euler = (math.radians(-45), 0, 0)
    
    mod = tail.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return tail

def create_beard():
    """Create a goat beard"""
    bpy.ops.mesh.primitive_cone_add(
        vertices=8,
        radius1=0.03,
        radius2=0.01,
        depth=0.1,
        location=(0, 1.15, 0.5)
    )
    beard = bpy.context.active_object
    beard.name = "Goat_Beard"
    beard.rotation_euler = (math.radians(20), 0, 0)
    
    mod = beard.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return beard

# ============================================
# MAIN GOAT ASSEMBLY
# ============================================

def create_goat():
    """Assemble the complete goat"""
    
    # Create materials
    fur_mat = create_goat_fur_material()
    horn_mat = create_horn_material()
    hoof_mat = create_hoof_material()
    eye_mat = create_eye_material()
    nose_mat = create_nose_material()
    
    all_parts = []
    
    # Body
    body = create_body()
    body.data.materials.append(fur_mat)
    all_parts.append(body)
    
    # Head
    head = create_head()
    head.data.materials.append(fur_mat)
    all_parts.append(head)
    
    # Snout
    snout = create_snout()
    snout.data.materials.append(nose_mat)
    all_parts.append(snout)
    
    # Ears
    for side in ['left', 'right']:
        ear = create_ear(side)
        ear.data.materials.append(fur_mat)
        all_parts.append(ear)
    
    # Horns
    for side in ['left', 'right']:
        horn = create_horn(side)
        horn.data.materials.append(horn_mat)
        all_parts.append(horn)
    
    # Legs (4 legs)
    leg_positions = [
        (0.15, 0.5),   # Front left
        (-0.15, 0.5),  # Front right
        (0.15, -0.5),  # Back left
        (-0.15, -0.5), # Back right
    ]
    
    for pos in leg_positions:
        upper, lower, hoof = create_leg(pos)
        upper.data.materials.append(fur_mat)
        lower.data.materials.append(fur_mat)
        hoof.data.materials.append(hoof_mat)
        all_parts.extend([upper, lower, hoof])
    
    # Eyes
    for side in ['left', 'right']:
        eye = create_eye(side)
        eye.data.materials.append(eye_mat)
        all_parts.append(eye)
    
    # Tail
    tail = create_tail()
    tail.data.materials.append(fur_mat)
    all_parts.append(tail)
    
    # Beard
    beard = create_beard()
    beard.data.materials.append(fur_mat)
    all_parts.append(beard)
    
    # Select all parts and join
    bpy.ops.object.select_all(action='DESELECT')
    for part in all_parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    
    goat = bpy.context.active_object
    goat.name = "Goat"
    
    # Position under tree
    goat.location = (1.2, 0.5, 0)
    goat.rotation_euler = (0, 0, math.radians(-30))
    goat.scale = (0.8, 0.8, 0.8)
    
    return goat

# ============================================
# EXECUTE
# ============================================

# Create the goat
goat = create_goat()
print(f"✓ Created goat with {len(goat.data.polygons)} faces")

# Update camera to show both tree and goat
camera = bpy.data.objects.get('Camera')
if camera:
    camera.location = (5, -5, 2.5)
    camera.rotation_euler = (math.radians(75), 0, math.radians(45))
    print("✓ Updated camera position")

# Save
output_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/tree_with_goat.blend"
bpy.ops.wm.save_as_mainfile(filepath=output_path)
print(f"✓ Saved to: {output_path}")

# Render
render_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/tree_with_goat_render.png"
bpy.context.scene.render.filepath = render_path
bpy.context.scene.cycles.samples = 128  # More samples for better quality
bpy.ops.render.render(write_still=True)
print(f"✓ Rendered to: {render_path}")

print("=" * 50)
print("Done! 🐐🌲")
print("=" * 50)
