"""
Simple script to generate placeholder icons for the browser extension.
Run this to create basic PNG icons if you don't have image editing software.

Requirements: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os

    # Create icons directory if it doesn't exist
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    # Define sizes
    sizes = [16, 48, 128]

    for size in sizes:
        # Create image with gradient background (simplified)
        img = Image.new('RGB', (size, size), color='#667eea')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple circle (magnifying glass)
        circle_size = int(size * 0.6)
        circle_pos = int(size * 0.2)
        draw.ellipse(
            [circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size],
            outline='white',
            width=max(2, size // 20)
        )
        
        # Draw handle of magnifying glass
        handle_start = int(size * 0.65)
        handle_end = int(size * 0.85)
        draw.line(
            [handle_start, handle_start, handle_end, handle_end],
            fill='white',
            width=max(2, size // 20)
        )
        
        # Save icon
        icon_path = os.path.join(icons_dir, f'icon{size}.png')
        img.save(icon_path, 'PNG')
        print(f'✓ Created {icon_path}')

    print('\n✅ All icons created successfully!')
    print('You can now load the extension in Chrome.')

except ImportError:
    print('❌ PIL (Pillow) not installed.')
    print('\nPlease install it using:')
    print('  pip install pillow')
    print('\nThen run this script again:')
    print('  python generate_icons.py')
    
except Exception as e:
    print(f'❌ Error: {e}')
    print('\nAlternatively, you can:')
    print('1. Use any image editor to create 3 PNG files')
    print('2. Save them as icon16.png, icon48.png, icon128.png')
    print('3. Place them in the icons/ folder')
