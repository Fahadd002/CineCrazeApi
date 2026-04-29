import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  outDir: 'api',
  external: [
    'pg-native',
    'cloudinary',
    'better-auth',
    'stripe',
    'nodemailer',
    'multer-storage-cloudinary',
    'pg',
  ],
});
