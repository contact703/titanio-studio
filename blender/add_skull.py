"""
Highpoly Realistic Human Skull Generator for Blender
Creates a detailed skull model and places it under the tree
"""

import bpy
import bmesh
import math
from mathutils import Vector

print("=" * 50)
print("Highpoly Skull Generator 💀")
print("=" * 50)

# Remove the goat if it exists
if "Goat" in bpy.data.objects:
    bpy.data.objects.remove(bpy.data.objects["Goat"], do_unlink=True)
    print("✓ Removed goat")

# ============================================
# SKULL MATERIAL
# ============================================

def create_bone_material():
    """Create realistic bone material"""
    mat = bpy.data.materials.new(name="Bone_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (800, 0)
    
    # Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (500, 0)
    bsdf.inputs['Base Color'].default_value = (0.9, 0.85, 0.75, 1.0)  # Ivory/bone color
    bsdf.inputs['Roughness'].default_value = 0.6
    bsdf.inputs['Subsurface Weight'].default_value = 0.15
    bsdf.inputs['Subsurface Radius'].default_value = (0.1, 0.05, 0.02)
    
    # Noise texture for bone surface variation
    noise = nodes.new('ShaderNodeTexNoise')
    noise.location = (-200, 200)
    noise.inputs['Scale'].default_value = 30.0
    noise.inputs['Detail'].default_value = 10.0
    noise.inputs['Roughness'].default_value = 0.7
    
    # Color ramp for subtle color variation
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.location = (0, 200)
    ramp.color_ramp.elements[0].color = (0.8, 0.73, 0.63, 1.0)  # Slightly darker
    ramp.color_ramp.elements[1].color = (0.95, 0.9, 0.82, 1.0)  # Lighter bone
    
    # Mix for color
    mix = nodes.new('ShaderNodeMix')
    mix.location = (200, 100)
    mix.data_type = 'RGBA'
    mix.inputs['Factor'].default_value = 0.3
    
    # Bump for surface detail
    bump = nodes.new('ShaderNodeBump')
    bump.location = (200, -200)
    bump.inputs['Strength'].default_value = 0.15
    
    # Voronoi for porous bone texture
    voronoi = nodes.new('ShaderNodeTexVoronoi')
    voronoi.location = (-200, -100)
    voronoi.inputs['Scale'].default_value = 50.0
    voronoi.feature = 'F1'
    
    # Links
    links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], mix.inputs['A'])
    mix.inputs['B'].default_value = (0.9, 0.85, 0.75, 1.0)
    links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
    links.new(voronoi.outputs['Distance'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_teeth_material():
    """Create teeth material - slightly yellowed"""
    mat = bpy.data.materials.new(name="Teeth_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.95, 0.92, 0.8, 1.0)  # Off-white/ivory
    bsdf.inputs['Roughness'].default_value = 0.3
    bsdf.inputs['Specular IOR Level'].default_value = 0.8
    return mat

def create_eye_socket_material():
    """Create dark eye socket material"""
    mat = bpy.data.materials.new(name="Eye_Socket_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (0.05, 0.03, 0.02, 1.0)  # Very dark
    bsdf.inputs['Roughness'].default_value = 0.9
    return mat

# ============================================
# SKULL GEOMETRY
# ============================================

def create_cranium():
    """Create the main skull/cranium"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=64, ring_count=48,
        radius=0.12,
        location=(0, 0, 0.12)
    )
    cranium = bpy.context.active_object
    cranium.name = "Skull_Cranium"
    
    # Shape it into a skull
    cranium.scale = (0.85, 1.1, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    
    # Edit mode to shape
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(cranium.data)
    
    # Push back of skull out more
    for v in bm.verts:
        if v.co.y < -0.05:  # Back of skull
            v.co.y *= 1.15
            v.co.z += 0.01
        # Flatten bottom slightly
        if v.co.z < 0:
            v.co.z *= 0.7
    
    bmesh.update_edit_mesh(cranium.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Subdivision for smoothness
    mod = cranium.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return cranium

def create_face():
    """Create the facial structure"""
    # Upper face/brow ridge
    bpy.ops.mesh.primitive_cube_add(size=0.1, location=(0, 0.08, 0.05))
    face = bpy.context.active_object
    face.name = "Skull_Face"
    face.scale = (1.5, 0.8, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    
    mod = face.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return face

def create_eye_socket(side='left'):
    """Create an eye socket (hole)"""
    x_pos = 0.035 if side == 'left' else -0.035
    
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24, ring_count=16,
        radius=0.025,
        location=(x_pos, 0.1, 0.07)
    )
    socket = bpy.context.active_object
    socket.name = f"Skull_Eye_Socket_{side}"
    socket.scale = (1.0, 0.6, 1.2)
    
    return socket

def create_nasal_cavity():
    """Create the nasal cavity (triangular hole)"""
    bpy.ops.mesh.primitive_cone_add(
        vertices=3,
        radius1=0.018,
        radius2=0.005,
        depth=0.03,
        location=(0, 0.11, 0.02)
    )
    nose = bpy.context.active_object
    nose.name = "Skull_Nasal"
    nose.rotation_euler = (math.radians(90), 0, math.radians(180))
    
    return nose

def create_jaw():
    """Create the lower jaw/mandible"""
    # Main jaw bone
    bpy.ops.mesh.primitive_cube_add(size=0.05, location=(0, 0.05, -0.05))
    jaw = bpy.context.active_object
    jaw.name = "Skull_Jaw"
    jaw.scale = (2.0, 1.5, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    
    # Edit to shape jaw
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(jaw.data)
    
    for v in bm.verts:
        # Round the front
        if v.co.y > 0.02:
            v.co.y += 0.01
        # Chin
        if v.co.y > 0.02 and v.co.z < -0.01:
            v.co.z -= 0.015
            v.co.y += 0.01
    
    bmesh.update_edit_mesh(jaw.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    mod = jaw.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    
    return jaw

def create_teeth_row(upper=True):
    """Create a row of teeth"""
    teeth = []
    y_pos = 0.09 if upper else 0.075
    z_pos = 0.0 if upper else -0.035
    
    # Front teeth (incisors)
    for i in range(4):
        x_offset = (i - 1.5) * 0.012
        bpy.ops.mesh.primitive_cube_add(
            size=0.01,
            location=(x_offset, y_pos, z_pos)
        )
        tooth = bpy.context.active_object
        tooth.name = f"Tooth_{'Upper' if upper else 'Lower'}_{i}"
        tooth.scale = (0.8, 0.5, 1.5 if upper else 1.3)
        
        mod = tooth.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = 1
        mod.render_levels = 2
        teeth.append(tooth)
    
    # Canines
    for side in [-1, 1]:
        x_offset = side * 0.032
        bpy.ops.mesh.primitive_cone_add(
            vertices=8,
            radius1=0.005,
            radius2=0.003,
            depth=0.018,
            location=(x_offset, y_pos - 0.005, z_pos)
        )
        canine = bpy.context.active_object
        canine.name = f"Canine_{'Upper' if upper else 'Lower'}_{side}"
        canine.rotation_euler = (math.radians(180) if upper else 0, 0, 0)
        
        mod = canine.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = 1
        mod.render_levels = 2
        teeth.append(canine)
    
    # Molars
    for side in [-1, 1]:
        for j in range(3):
            x_offset = side * (0.045 + j * 0.012)
            bpy.ops.mesh.primitive_cube_add(
                size=0.01,
                location=(x_offset, y_pos - 0.015 - j * 0.008, z_pos)
            )
            molar = bpy.context.active_object
            molar.name = f"Molar_{'Upper' if upper else 'Lower'}_{side}_{j}"
            molar.scale = (1.0, 0.8, 1.2)
            
            mod = molar.modifiers.new(name="Subsurf", type='SUBSURF')
            mod.levels = 1
            mod.render_levels = 2
            teeth.append(molar)
    
    return teeth

def create_cheekbone(side='left'):
    """Create zygomatic bone (cheekbone)"""
    x_pos = 0.06 if side == 'left' else -0.06
    
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=12,
        radius=0.025,
        location=(x_pos, 0.05, 0.03)
    )
    cheek = bpy.context.active_object
    cheek.name = f"Skull_Cheekbone_{side}"
    cheek.scale = (0.8, 1.2, 0.6)
    
    mod = cheek.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return cheek

def create_temple(side='left'):
    """Create temporal region"""
    x_pos = 0.08 if side == 'left' else -0.08
    
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=12,
        radius=0.02,
        location=(x_pos, -0.02, 0.08)
    )
    temple = bpy.context.active_object
    temple.name = f"Skull_Temple_{side}"
    temple.scale = (0.5, 1.0, 1.2)
    
    mod = temple.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = 2
    mod.render_levels = 2
    
    return temple

# ============================================
# ASSEMBLE SKULL
# ============================================

def create_skull():
    """Assemble the complete skull"""
    
    # Materials
    bone_mat = create_bone_material()
    teeth_mat = create_teeth_material()
    socket_mat = create_eye_socket_material()
    
    all_parts = []
    
    # Main cranium
    cranium = create_cranium()
    cranium.data.materials.append(bone_mat)
    all_parts.append(cranium)
    
    # Face structure
    face = create_face()
    face.data.materials.append(bone_mat)
    all_parts.append(face)
    
    # Eye sockets
    for side in ['left', 'right']:
        socket = create_eye_socket(side)
        socket.data.materials.append(socket_mat)
        all_parts.append(socket)
    
    # Nasal cavity
    nose = create_nasal_cavity()
    nose.data.materials.append(socket_mat)
    all_parts.append(nose)
    
    # Cheekbones
    for side in ['left', 'right']:
        cheek = create_cheekbone(side)
        cheek.data.materials.append(bone_mat)
        all_parts.append(cheek)
    
    # Temples
    for side in ['left', 'right']:
        temple = create_temple(side)
        temple.data.materials.append(bone_mat)
        all_parts.append(temple)
    
    # Jaw
    jaw = create_jaw()
    jaw.data.materials.append(bone_mat)
    all_parts.append(jaw)
    
    # Teeth
    upper_teeth = create_teeth_row(upper=True)
    lower_teeth = create_teeth_row(upper=False)
    for tooth in upper_teeth + lower_teeth:
        tooth.data.materials.append(teeth_mat)
        all_parts.append(tooth)
    
    # Join all parts
    bpy.ops.object.select_all(action='DESELECT')
    for part in all_parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = cranium
    bpy.ops.object.join()
    
    skull = bpy.context.active_object
    skull.name = "Skull"
    
    # Position under tree
    skull.location = (0.8, 0.3, 0.0)
    skull.rotation_euler = (math.radians(-15), 0, math.radians(25))
    skull.scale = (1.5, 1.5, 1.5)
    
    return skull

# ============================================
# EXECUTE
# ============================================

skull = create_skull()
print(f"✓ Created skull with {len(skull.data.polygons)} faces")

# Update camera
camera = bpy.data.objects.get('Camera')
if camera:
    camera.location = (3, -3, 1.5)
    camera.rotation_euler = (math.radians(78), 0, math.radians(45))
    print("✓ Updated camera")

# Save
output_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/tree_with_skull.blend"
bpy.ops.wm.save_as_mainfile(filepath=output_path)
print(f"✓ Saved: {output_path}")

# Render with higher quality
bpy.context.scene.cycles.samples = 128
render_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/blender/tree_with_skull_render.png"
bpy.context.scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)
print(f"✓ Rendered: {render_path}")

print("=" * 50)
print("Done! 💀🌲")
print("=" * 50)
