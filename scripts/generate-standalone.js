import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Copy raw source index.html
const rawIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
fs.writeFileSync(path.join(publicDir, 'source_index.html'), rawIndex, 'utf-8');

// 2. Build standalone inlined index.html from dist
if (fs.existsSync(distDir)) {
  const distHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(distHtmlPath)) {
    let html = fs.readFileSync(distHtmlPath, 'utf-8');

    // Find and inline CSS
    const cssRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="\/assets\/([^"]+)">/g;
    html = html.replace(cssRegex, (match, cssFile) => {
      const cssPath = path.join(distDir, 'assets', cssFile);
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        return `<style>\n${cssContent}\n</style>`;
      }
      return match;
    });

    // Find and inline JS
    const jsRegex = /<script\s+type="module"\s+crossorigin\s+src="\/assets\/([^"]+)"><\/script>/g;
    html = html.replace(jsRegex, (match, jsFile) => {
      const jsPath = path.join(distDir, 'assets', jsFile);
      if (fs.existsSync(jsPath)) {
        let jsContent = fs.readFileSync(jsPath, 'utf-8');
        // Escape closing script tags if any
        jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');
        return `<script type="module">\n${jsContent}\n</script>`;
      }
      return match;
    });

    fs.writeFileSync(path.join(publicDir, 'standalone_index.html'), html, 'utf-8');
    fs.writeFileSync(path.join(distDir, 'standalone_index.html'), html, 'utf-8');
    console.log('Successfully generated public/standalone_index.html and public/source_index.html');
  }
}
