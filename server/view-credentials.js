/**
 * Helper Script: View Provider Credentials from Logs
 * 
 * This script monitors the server logs and displays provider credentials
 * when they are created via the Admin Panel.
 * 
 * Usage:
 *   node view-credentials.js
 * 
 * Or run alongside your dev server:
 *   npm run dev | node view-credentials.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('\n📋 Provider Credentials Viewer');
console.log('================================\n');
console.log('Monitoring server logs for provider creation...');
console.log('Press Ctrl+C to exit\n');

// Store found credentials
const credentials = [];

// Create readline interface for stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Pattern to match provider credential emails
const emailPattern = /Provider credentials for (.+): Password: (.+)/;
const businessPattern = /Provider "(.+)" created/;

let lastBusiness = null;

// Process each line from stdin
rl.on('line', (line) => {
  // Check for business name
  const businessMatch = line.match(businessPattern);
  if (businessMatch) {
    lastBusiness = businessMatch[1];
  }

  // Check for credentials
  const emailMatch = line.match(emailPattern);
  if (emailMatch) {
    const email = emailMatch[1];
    const password = emailMatch[2];
    
    const credential = {
      timestamp: new Date().toLocaleString(),
      business: lastBusiness || 'Unknown',
      email: email,
      password: password
    };
    
    credentials.push(credential);
    
    // Display the credential
    console.log('\n🔑 NEW PROVIDER CREDENTIALS DETECTED!');
    console.log('─────────────────────────────────────');
    console.log(`📅 Time:     ${credential.timestamp}`);
    console.log(`🏢 Business: ${credential.business}`);
    console.log(`📧 Email:    ${credential.email}`);
    console.log(`🔐 Password: ${credential.password}`);
    console.log('─────────────────────────────────────\n');
    
    // Save to file
    saveCredentials();
  }
});

// Save credentials to a file
function saveCredentials() {
  const outputFile = path.join(__dirname, 'provider-credentials.txt');
  const content = credentials.map(c => 
    `[${c.timestamp}] ${c.business}\nEmail: ${c.email}\nPassword: ${c.password}\n`
  ).join('\n---\n\n');
  
  fs.writeFileSync(outputFile, content);
}

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n📊 Summary');
  console.log('================================');
  console.log(`Total providers created: ${credentials.length}`);
  
  if (credentials.length > 0) {
    console.log('\n📝 All credentials saved to: provider-credentials.txt');
    console.log('\nCredentials List:');
    credentials.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.business}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Password: ${c.password}`);
    });
  }
  
  console.log('\n👋 Goodbye!\n');
  process.exit(0);
});
