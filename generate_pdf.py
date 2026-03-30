#!/usr/bin/env python3
"""Generate a PDF matching the RYZ/Wirestock submission format.
Landscape page, instruction text on top, 3 photos side by side with labels."""

import sys
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm, cm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.utils import ImageReader
from PIL import Image

def create_pdf(input1_path, input2_path, result_path, output_path, instruction_text):
    page_w, page_h = landscape(A4)  # 297mm x 210mm
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    
    # Colors
    dark_bg = HexColor('#1a1a1a')
    label_color = HexColor('#333333')
    instruction_color = black
    
    # Margins
    margin_x = 25 * mm
    margin_top = 20 * mm
    margin_bottom = 15 * mm
    
    # --- INSTRUCTION TEXT ---
    instruction_y = page_h - margin_top
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin_x, instruction_y, "Instruction:")
    
    # Wrap instruction text
    c.setFont("Helvetica", 10)
    # Calculate text width for wrapping
    text_width = page_w - 2 * margin_x - 70  # leave some space after "Instruction: "
    
    # Simple text wrapping
    words = instruction_text.split()
    lines = []
    current_line = ""
    for word in words:
        test = current_line + (" " if current_line else "") + word
        if c.stringWidth(test, "Helvetica", 10) < text_width:
            current_line = test
        else:
            lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    
    # Draw instruction - first line after "Instruction: "
    x_after_label = margin_x + c.stringWidth("Instruction: ", "Helvetica-Bold", 11) + 2
    if lines:
        c.drawString(x_after_label, instruction_y, lines[0])
        for i, line in enumerate(lines[1:], 1):
            c.drawString(margin_x, instruction_y - (i * 14), line)
    
    text_bottom = instruction_y - (len(lines) * 14) - 10
    
    # --- IMAGE AREA ---
    # Three images side by side with equal spacing
    num_images = 3
    spacing = 10 * mm
    total_spacing = spacing * (num_images - 1)
    available_width = page_w - 2 * margin_x
    img_box_width = (available_width - total_spacing) / num_images
    
    # Image height: fill remaining space minus labels
    label_height = 20 * mm
    img_box_height = text_bottom - margin_bottom - label_height
    
    images = [input1_path, input2_path, result_path]
    labels = ["Input image 1", "Input image 2", "Result image"]
    
    for i, (img_path, label) in enumerate(zip(images, labels)):
        x = margin_x + i * (img_box_width + spacing)
        y_bottom = margin_bottom + label_height
        
        # Draw image (fit within box, centered)
        try:
            pil_img = Image.open(img_path)
            iw, ih = pil_img.size
            
            # Calculate scaling to fit in box
            scale_w = img_box_width / iw
            scale_h = img_box_height / ih
            scale = min(scale_w, scale_h)
            
            draw_w = iw * scale
            draw_h = ih * scale
            
            # Center in box
            draw_x = x + (img_box_width - draw_w) / 2
            draw_y = y_bottom + (img_box_height - draw_h) / 2
            
            # Draw thin border
            c.setStrokeColor(HexColor('#cccccc'))
            c.setLineWidth(0.5)
            c.rect(draw_x - 1, draw_y - 1, draw_w + 2, draw_h + 2)
            
            # Draw image
            c.drawImage(ImageReader(img_path), draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True)
            
        except Exception as e:
            # Placeholder if image fails
            c.setFillColor(HexColor('#f0f0f0'))
            c.rect(x, y_bottom, img_box_width, img_box_height, fill=1)
            c.setFillColor(black)
            c.drawCentredString(x + img_box_width/2, y_bottom + img_box_height/2, f"[Image {i+1}]")
        
        # Draw label
        c.setFillColor(label_color)
        c.setFont("Helvetica", 10)
        label_y = y_bottom - 15
        c.drawString(x, label_y, label)
    
    c.save()
    print(f"PDF saved to: {output_path}")
    print(f"Page size: {page_w/mm:.0f}mm x {page_h/mm:.0f}mm (landscape A4)")

if __name__ == "__main__":
    workspace = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
    
    input1 = os.path.join(workspace, "input1.jpg")
    input2 = os.path.join(workspace, "input2.jpg")
    result = os.path.join(workspace, "result.jpg")
    output = os.path.join(workspace, "wirestock_submission.pdf")
    
    instruction = ("Combine the two people into one image, seated next to each other in a casual, "
                   "friendly setting. Show them in a relaxed, natural pose as if they are close friends "
                   "spending time together.")
    
    # Check which images exist
    for name, path in [("Input 1", input1), ("Input 2", input2), ("Result", result)]:
        exists = "✅" if os.path.exists(path) else "❌ MISSING"
        print(f"{name}: {exists} - {path}")
    
    if all(os.path.exists(p) for p in [input1, input2, result]):
        create_pdf(input1, input2, result, output, instruction)
    else:
        print("\nWaiting for all 3 images before generating PDF.")
