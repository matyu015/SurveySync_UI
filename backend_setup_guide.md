# Comprehensive Setup Guide: Database, Backend Services, & Server

This document provides the exhaustive, exact step-by-step instructions to set up the entire architecture from zero. 

**Important Architecture Note:** This application is "Serverless." There is **no separate backend server code** (like a Node.js/Express app or Python server). Instead:
1.  **Frontend/Local Server:** A React app served by Vite (`pnpm run dev`).
2.  **Database & Auth (Serverless Backend):** Handled entirely by Firebase (Firestore).
3.  **File Storage:** Handled by Supabase.

---

## Phase 1: Firebase Database & Auth Setup (The "Backend")

Firebase acts as your main backend, handling logins and storing all text data.

### Step 1: Create the Project
1.  Go to [console.firebase.google.com](https://console.firebase.google.com/).
2.  Click the large **"Add Project"** box.
3.  **Project Name:** Enter `SurveySync-Live` (or similar). Check the terms box and click **Continue**.
4.  **Google Analytics:** Toggle this **OFF** for now (you can add it later if needed). Click **Create Project**.
5.  Wait about 1 minute. When it says "Your new project is ready," click **Continue**.

### Step 2: Set Up Authentication (Login System)
1.  On the left sidebar, click the **Build** dropdown, then click **Authentication**.
2.  Click the big **Get Started** button.
3.  Under the **Sign-in method** tab, click **Email/Password**.
4.  Toggle **Email/Password** to **Enable**. (Leave "Email link (passwordless)" disabled).
5.  Click **Save**.

### Step 3: Set Up Firestore (The Database)
1.  On the left sidebar, click **Build > Firestore Database**.
2.  Click the **Create database** button.
3.  **Location:** Choose the region closest to your users (e.g., `asia-southeast1` for Singapore/Philippines) and click **Next**.
4.  **Secure rules:** Select **Start in test mode**. *Note: This allows anyone with your API keys to read/write for 30 days. It's necessary for easy setup.*
5.  Click **Enable**.

### Step 4: Manually Creating the Database Collections (Optional but Recommended)
Normally, Firestore creates collections automatically when the code sends data. If you want to set them up manually to ensure they exist or to seed dummy data:

1.  In Firestore, click **+ Start collection**.
2.  **Collection 1: `users`**
    *   Collection ID: `users`
    *   Document ID: Click **Auto-ID**
    *   Field: `firstName` (Type: string, Value: `Admin`)
    *   Field: `lastName` (Type: string, Value: `User`)
    *   Field: `email` (Type: string, Value: `admin@example.com`)
    *   Field: `role` (Type: string, Value: `admin`) *(Crucial: This makes the user an admin in the UI)*
    *   Field: `createdAt` (Type: string, Value: `2024-01-01T00:00:00.000Z`)
    *   Click **Save**.
3.  **Collection 2: `requests`**
    *   Click **+ Start collection**. Collection ID: `requests`. Auto-ID.
    *   Fields to add (all strings): `clientId`, `clientName`, `surveyType`, `status` (value: `submitted`), `referenceNo`. Save.
4.  **Collection 3: `payments`**
    *   Click **+ Start collection**. Collection ID: `payments`. Auto-ID.
    *   Fields to add: `clientId` (string), `amount` (number), `status` (string, value: `pending`), `referenceNo` (string). Save.
5.  **Collection 4: `availability`**
    *   Click **+ Start collection**. Collection ID: `availability`. Auto-ID.
    *   Fields to add (all strings): `date`, `startTime`, `endTime`, `status` (value: `available`). Save.
6.  **Collection 5: `documents`**
    *   Click **+ Start collection**. Collection ID: `documents`. Auto-ID.
    *   Fields: `name` (string), `fileUrl` (string), `requestId` (string). Save.

### Step 5: Get Firebase Keys & Connect to Code
1.  Click the **Gear Icon** (top left, next to Project Overview) -> **Project settings**.
2.  Scroll to the bottom under **Your apps**.
3.  Click the **`</>` (Web)** icon.
4.  App nickname: `SurveySync App`. Click **Register app**.
5.  You will see a block of code looking like `const firebaseConfig = {...}`.
6.  Copy exactly the values inside the brackets.
7.  Open your project code in VS Code. Go to `src/lib/firebase.ts`.
8.  Replace the `firebaseConfig` block with your new keys. Save the file.

---

## Phase 2: Supabase Setup (File Storage)

### Step 1: Create the Project
1.  Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2.  Click **New Project**.
3.  Name: `SurveySync Storage`. Database Password: Click "Generate a password" and copy it somewhere safe. Region: Pick the closest to you.
4.  Click **Create new project**. Wait 2-3 minutes for it to provision.

### Step 2: Create the Storage Bucket
1.  On the left sidebar, click **Storage** (the folder icon).
2.  Click **New Bucket**.
3.  **Name:** Type exactly `documents` (lowercase).
4.  **Public bucket:** Toggle this to **ON** (Green). This allows the frontend to show download links.
5.  Click **Save**.

### Step 3: Configure Storage Policies (Crucial for Uploads)
If you don't do this, file uploads will fail with a "Permission Denied" error.
1.  In Storage, click **Policies** (on the left menu under Configuration).
2.  Under the `documents` bucket, click **New Policy**.
3.  Click **For full customization**.
4.  **Policy Name:** `Allow all uploads`.
5.  **Allowed Operations:** Check ALL boxes (SELECT, INSERT, UPDATE, DELETE).
6.  **Target Roles:** Leave blank (applies to all).
7.  Click **Review** then **Save policy**.

### Step 4: Get Supabase Keys & Connect to Code
1.  Click the **Gear Icon** (Project Settings) at the bottom left.
2.  Click **API** in the menu.
3.  Under **Project URL**, copy the URL.
4.  Under **Project API Keys**, copy the `anon` `public` key.
5.  Open `src/lib/supabase.ts` in your code.
6.  Replace `supabaseUrl` and `supabaseKey` with your copied values. Save.

---

## Phase 3: The Local Server Setup (Frontend)

To run the application locally on your computer to test the database connections:

1.  Open your terminal (Command Prompt, PowerShell, or VS Code Terminal).
2.  Navigate to the project folder:
    ```bash
    cd c:\Users\rhicj\Downloads\SurveySync_UI
    ```
3.  Install all required node packages (you only need to do this once):
    ```bash
    pnpm install
    ```
4.  Start the development server:
    ```bash
    pnpm run dev
    ```
5.  Look at the terminal output. It will say something like:
    `➜  Local:   http://localhost:5173/`
6.  Hold `Ctrl` and click that link, or paste it into your Chrome browser.
7.  **Test the Backend:** Try clicking "Register" on the website and making a new account. Then go back to your Firebase Console -> Firestore Database -> `users` collection and see if the new account appeared!
