# Setup and Deployment Guide

This document outlines the end-to-end setup process for running SurveySync UI locally. 

## Prerequisites
- Node.js (v18+)
- `pnpm` package manager
- Git

## Step 1: Clone and Install
1. Open your terminal and navigate to the project directory:
   ```bash
   cd c:\Users\rhicj\Downloads\SurveySync_UI
   ```
2. Install the necessary dependencies defined in `package.json`:
   ```bash
   pnpm install
   ```

## Step 2: Configure Environment & Third-Party Services
SurveySync requires active connections to Firebase and Supabase. You must ensure the configuration files have valid API keys.

### Firebase Configuration (`src/lib/firebase.ts`)
1. Create a Firebase project at console.firebase.google.com.
2. Enable **Authentication** (Email/Password provider).
3. Enable **Firestore Database** (Start in Test Mode for local dev).
4. Register a Web App in Project Settings.
5. Copy the `firebaseConfig` object and place it inside `src/lib/firebase.ts`.

### Supabase Configuration (`src/lib/supabase.ts`)
1. Create a Supabase project at supabase.com.
2. Navigate to **Storage** and create a **Public** bucket named exactly `documents`.
3. Create a Storage Policy to allow all operations (SELECT, INSERT, UPDATE, DELETE) for testing.
4. Go to Project Settings -> API and copy the `Project URL` and `anon public` key.
5. Place these values inside `src/lib/supabase.ts`.

## Step 3: Run the Development Server
Once dependencies are installed and API keys are set:

1. Start Vite development server:
   ```bash
   pnpm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173/`.

## Step 4: Initial Data Seeding
To access the Admin Dashboard, you need an admin account.
1. Use the Register page on your local site to create a new account (e.g., `admin@example.com`).
2. Go to your Firebase Console -> Firestore Database.
3. Locate the `users` collection and find the document for the user you just created.
4. Add or modify the `role` field to have the string value `admin`.
5. Refresh the local application to gain admin privileges.

## Step 5: Building for Production
When you are ready to deploy the site to a host (like Vercel, Netlify, or Firebase Hosting):
1. Run the build command:
   ```bash
   pnpm run build
   ```
2. This will generate an optimized, minified bundle in the `dist/` folder, which can be uploaded to your chosen hosting provider.
