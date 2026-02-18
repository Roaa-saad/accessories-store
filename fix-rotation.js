import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function stripExif(imagePath) {
  try {
    const buffer = await sharp(imagePath)
      .withMetadata({ orientation: undefined }) // Remove orientation
      .toBuffer();
    
    await fs.promises.writeFile(imagePath, buffer);
    console.log(`✅ Stripped EXIF from: ${path.basename(imagePath)}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function fixAllImages() {
  console.log('🔄 Removing EXIF orientation data...\n');
  
  const files = [
    'dist/categories/necklaces.jpg',
    'public/categories/necklaces.jpg'
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      await stripExif(file);
    }
  }
  
  console.log('\n✨ Done! Now run: npm run convert-images');
}

fixAllImages();
