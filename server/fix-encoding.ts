
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
console.log(`Fixing encoding for: ${envPath}`);

try {
  const content = fs.readFileSync(envPath);
  // Convert buffer to string assuming it might be mixed or UTF-16
  // But safest is to read as binary/buffer and strip null bytes if it was treated as UTF-16LE by text editors
  // Or just simply read as utf8 and see if it looks right.
  // Often PowerShell appends result in: <UTF-8 Part><UTF-16 BOM><UTF-16 Part>
  
  // Let's try to detect if it has null bytes (indicating double-byte encoding)
  let cleanContent = content.toString('utf8').replace(/\0/g, ''); 
  
  // If there are specific garbage characters from BOM at the append point, try to strip them
  // UTF-16LE BOM is 0xFF 0xFE
  // In utf8 decoding they might show up as replacement chars or similar.
  
  // A simple heuristic: remove non-printable ASCII except newlines, if we assume standard env vars
  // But passwords might have special chars.
  
  // Better approach: Read lines, filter out empty/garbage.
  const lines = cleanContent.split(/[\r\n]+/);
  const cleanLines = lines.map(line => line.trim()).filter(line => line.length > 0);
  
  // Re-join with standard newline
  const newContent = cleanLines.join('\n');
  
  fs.writeFileSync(envPath, newContent, { encoding: 'utf8' });
  console.log('✅ .env file cleaned and saved as UTF-8');
  console.log('--- Content Preview ---');
  console.log(newContent);
  console.log('-----------------------');
  
} catch (err) {
  console.error('Failed to fix .env:', err);
}
