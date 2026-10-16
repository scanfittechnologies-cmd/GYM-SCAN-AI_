import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeGymMachine } from './src/services/backend/geminiVisionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('🚀 Testing Gemini Vision Recognition...\n');

  // Check test_image.jpg first, or fallback to an available test image in the workspace
  let sampleImagePath = path.join(__dirname, 'test_image.jpg');

  if (!fs.existsSync(sampleImagePath)) {
    const candidates = [
      path.join(__dirname, 'unseen_test_images', 'lat_pulldown_01.png'),
      path.join(__dirname, 'test_images', 'new_leg_press.png'),
      path.join(__dirname, 'unseen_test_images', 'leg_extension_01.png'),
    ];
    sampleImagePath = candidates.find(p => fs.existsSync(p)) || sampleImagePath;
  }

  if (!fs.existsSync(sampleImagePath)) {
    console.error(`❌ Sample image not found at: ${sampleImagePath}`);
    console.log('Please place a test image named "test_image.jpg" in your root backend folder and try again.');
    return;
  }

  console.log(`📁 Using test image: ${sampleImagePath}`);
  const imageBuffer = fs.readFileSync(sampleImagePath);
  const ext = path.extname(sampleImagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  console.log('📸 Sending image to Gemini API...');
  const startTime = Date.now();
  
  const result = await analyzeGymMachine(imageBuffer, mimeType);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n--- 🎯 BENCHMARK RESULT ---');
  console.log(`⏱️ Response Time: ${duration}s`);
  console.log('📦 Parsed Output:', JSON.stringify(result, null, 2));
}

runTest();
