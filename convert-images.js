import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesDir = path.join(__dirname, 'public', 'categories');

// Convert all JPG/JPEG/PNG images to WebP
async function convertImagesToWebP() {
  const files = fs.readdirSync(categoriesDir);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const inputPath = path.join(categoriesDir, file);
      const outputPath = path.join(categoriesDir, file.replace(ext, '.webp'));
      
      try {
        await sharp(inputPath)
          .webp({ quality: 85 }) // High quality WebP
          .toFile(outputPath);
        
        console.log(`✅ Converted: ${file} → ${path.basename(outputPath)}`);
      } catch (error) {
        console.error(`❌ Error converting ${file}:`, error.message);
      }
    }
  }
  
  console.log('\n✨ All images converted to WebP format!');
}

convertImagesToWebP();
