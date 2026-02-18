from PIL import Image
import os

def strip_exif(image_path):
    try:
        # Open image
        img = Image.open(image_path)
        
        # Get image data without EXIF
        data = list(img.getdata())
        image_without_exif = Image.new(img.mode, img.size)
        image_without_exif.putdata(data)
        
        # Save without EXIF
        image_without_exif.save(image_path, quality=95, optimize=True)
        print(f"✅ Stripped EXIF from: {os.path.basename(image_path)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

print("🔄 Removing EXIF orientation data...\n")

files = [
    "dist/categories/necklaces.jpg",
    "public/categories/necklaces.jpg"
]

for file in files:
    if os.path.exists(file):
        strip_exif(file)

print("\n✨ Done! Now run: npm run convert-images")
