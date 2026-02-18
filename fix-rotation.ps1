$distPath = "dist\categories\necklaces.jpg"
$publicPath = "public\categories\necklaces.jpg"

Write-Host "📸 Necklaces image needs to be manually rotated" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please:" -ForegroundColor Cyan
Write-Host "1. Open $publicPath in an image editor (Paint, Photoshop, etc.)"
Write-Host "2. Rotate it to the correct orientation"
Write-Host "3. Save and overwrite the file"
Write-Host "4. Copy it to $distPath"
Write-Host "5. Then run: npm run convert-images"
Write-Host ""
Write-Host "Or tell me which direction to rotate (90, 180, or 270 degrees)" -ForegroundColor Green
