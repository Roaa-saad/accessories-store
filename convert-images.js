import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesDir = path.join(__dirname, 'public', 'categories');
const productsDir = path.join(__dirname, 'public', 'products');

// Convert images in a directory to WebP
async function convertDirectoryToWebP(directory, dirName) {
  if (!fs.existsSync(directory)) {
    console.log(`⚠️  Directory ${dirName} doesn't exist, skipping...`);
    return;
  }

  const files = fs.readdirSync(directory);
  let converted = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const inputPath = path.join(directory, file);
      const outputPath = path.join(directory, file.replace(ext, '.webp'));
      
      try {
        await sharp(inputPath)
          .rotate(0) // Disable auto-rotation from EXIF
          .webp({ quality: 85 }) // High quality WebP
          .toFile(outputPath);
        
        console.log(`✅ Converted: ${dirName}/${file} → ${path.basename(outputPath)}`);
        converted++;
      } catch (error) {
        console.error(`❌ Error converting ${dirName}/${file}:`, error.message);
      }
    }
  }
  
  return converted;
}

// Convert all images
async function convertAllImages() {
  console.log('🔄 Starting image conversion to WebP...\n');
  
  const categoriesCount = await convertDirectoryToWebP(categoriesDir, 'categories');
  console.log('');
  const productsCount = await convertDirectoryToWebP(productsDir, 'products');
  
  console.log('\n✨ Conversion complete!');
  console.log(`📊 Categories: ${categoriesCount || 0} images converted`);
  console.log(`📊 Products: ${productsCount || 0} images converted`);
}

convertAllImages();
