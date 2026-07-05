# SurveySync UI - Tech Stack & Backend Info

### **Tech Stack**
This project is a modern React application using a variety of robust libraries:
*   **Frontend Framework:** React (v18)
*   **Build Tool:** Vite
*   **Routing:** React Router
*   **Styling & UI:** 
    *   Tailwind CSS (for utility-first styling)
    *   Radix UI (accessible, unstyled primitives often used with `shadcn/ui`)
    *   Material UI (`@mui/material` and `@mui/icons-material`)
    *   Emotion (for CSS-in-JS used by MUI)
*   **Forms:** React Hook Form
*   **Data Visualization:** Recharts
*   **Backend / BaaS (Backend-as-a-Service):** 
    *   **Firebase** (Authentication, Firestore Database, and Storage)
    *   **Supabase** (Alternative Database/API client)

---

### **Backend Links / Configuration**
The application connects to two cloud backends:

**1. Supabase:**
*   **Backend URL:** `https://yizwcblqyhvscpcyengy.supabase.co`
*   **Public Anon Key:** `sb_publishable_13bph7D8n0qWzbNPGqOSGA_nzI6ZxAQ`

**2. Firebase:**
*   **Project ID:** `surveysync-live`
*   **Auth Domain:** `surveysync-live.firebaseapp.com`
*   **Storage Bucket:** `surveysync-live.firebasestorage.app`
*   **API Key:** `AIzaSyDErZDJyft_Ro5qhSGTM7UggAlgVTc51rg`
*   **App ID:** `1:465197588737:web:b9e671b45cfa9d0f93bb00`

---

### **Backend Configuration Files**
The backend setup and initialization are isolated in these two files:
*   `src/lib/firebase.ts` *(Initializes Firebase App, Auth, Firestore, and Storage)*
*   `src/lib/supabase.ts` *(Initializes Supabase Client)*

**Files actively using the backend:**
Based on the project structure, these files are actively importing and using the backend connections (Firebase/Supabase):
*   `src/app/context/AuthContext.tsx` *(Likely handles user login/sessions)*
*   `src/app/App.tsx`
*   `src/app/components/AdminDashboard.tsx`
*   `src/app/components/ClientDashboard.tsx`
*   `src/app/components/MySurvey.tsx`
*   `src/app/components/RegisterPage.tsx`
