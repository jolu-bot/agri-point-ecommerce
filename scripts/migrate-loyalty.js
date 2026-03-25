#!/usr/bin/env node
// scripts/migrate-loyalty.js
// Adds loyaltyPoints=0, loyaltyTier='bronze' to users that don't have these fields yet.
// Run: node -r dotenv/config scripts/migrate-loyalty.js

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB');

  const db   = client.db();
  const coll = db.collection('users');

  const result = await coll.updateMany(
    { loyaltyPoints: { $exists: false } },
    { $set: { loyaltyPoints: 0, loyaltyTier: 'bronze' } }
  );

  console.log(`Updated ${result.modifiedCount} users`);
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
