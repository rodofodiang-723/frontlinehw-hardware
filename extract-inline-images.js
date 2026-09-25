const fs = require('fs');
const path = require('path');

const root = __dirname;
const outputDir = path.join(root, 'index_24', 'assets', 'optimized');
const sourceFiles = [
  path.join(root, 'index_24', 'index.html'),
  path.join(root, 'index_24', 'index_24.js')
];

fs.mkdirSync(outputDir, { recursive: true });

const replacements = new Map();
let nextImage = 1;

for (const sourceFile of sourceFiles) {
  let source = fs.readFileSync(sourceFile, 'utf8');
  source = source.replace(/data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+/g, (dataUrl, format) => {
    if (!replacements.has(dataUrl)) {
      const extension = format === 'jpeg' ? 'jpg' : format;
      const fileName = `inline-${String(nextImage++).padStart(3, '0')}.${extension}`;
      const encodedImage = dataUrl.slice(dataUrl.indexOf(',') + 1);
      fs.writeFileSync(path.join(outputDir, fileName), Buffer.from(encodedImage, 'base64'));
      replacements.set(dataUrl, `assets/optimized/${fileName}`);
    }
    return replacements.get(dataUrl);
  });
  fs.writeFileSync(sourceFile, source);
}

console.log(`Extracted ${replacements.size} unique inline images.`);