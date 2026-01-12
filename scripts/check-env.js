#!/usr/bin/env node

/**
 * Environment Variables Validator
 * Run this before deploying to verify all required env vars are set
 */

// Load .env file if it exists
require('dotenv').config({ path: '.env' });

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const optionalEnvVars = [
  'NODE_ENV',
];

console.log('🔍 Checking environment variables...\n');

let missingVars = [];
let foundVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    foundVars.push(varName);
    console.log(`✅ ${varName} - Set`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName} - Missing`);
  }
});

console.log('\n📋 Optional variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} - ${process.env[varName]}`);
  } else {
    console.log(`⚠️  ${varName} - Not set (will use default)`);
  }
});

// Validate DATABASE_URL format
if (process.env.DATABASE_URL) {
  const isPgBouncer = process.env.DATABASE_URL.includes('pgbouncer=true');
  const hasPort6543 = process.env.DATABASE_URL.includes(':6543');

  if (!isPgBouncer || !hasPort6543) {
    console.log('\n⚠️  Warning: DATABASE_URL should use connection pooler:');
    console.log('   - Port 6543 (pooler)');
    console.log('   - Include pgbouncer=true parameter');
  }
}

// Validate NEXTAUTH_URL
if (process.env.NEXTAUTH_URL) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = process.env.NEXTAUTH_URL.includes('localhost');

  if (isProduction && isLocalhost) {
    console.log('\n⚠️  Warning: NEXTAUTH_URL is set to localhost in production');
    console.log('   Update to your deployment URL');
  }
}

console.log('\n' + '='.repeat(50));

if (missingVars.length > 0) {
  console.log(`\n❌ Missing ${missingVars.length} required environment variable(s):`);
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('\nPlease set these in your .env file or Vercel dashboard.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('\n📚 See VERCEL_DEPLOYMENT.md for deployment instructions.');
  process.exit(0);
}
