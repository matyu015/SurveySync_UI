# Tech Stack & Dependencies

## 1. Architecture Overview
SurveySync UI utilizes a **Serverless Architecture**, meaning there is no dedicated backend server (like Node.js/Express) running constantly.
- **Frontend:** Handled by a modern React Application.
- **Database & Auth:** Handled by Google Firebase.
- **File Storage:** Handled by Supabase.

## 2. Core Frontend Technologies
- **Framework:** React (v18.3.1)
- **Build Tool:** Vite (v6.3.5) for fast development and bundling.
- **Language:** TypeScript / JavaScript (ES Modules).
- **Routing:** React Router (v7.13.0) for single-page application navigation.

## 3. Styling & UI Components
The application employs a hybrid approach to styling, prioritizing utility-first CSS and accessible component primitives:
- **Tailwind CSS:** (v4.1.12) Core styling engine.
- **Radix UI:** A massive collection of unstyled, accessible UI primitives (Accordion, Dialog, Dropdown Menu, Tabs, Select, etc.). This is the foundation for `shadcn/ui`.
- **Material UI (MUI):** (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) Used for specific components or legacy parts of the application.
- **Lucide React:** Icon library for clean, modern iconography.
- **Class Variance Authority & clsx & tailwind-merge:** Utilities for dynamically managing CSS classes and component variants.
- **Motion:** Used for smooth animations and transitions.

## 4. Forms & Data Management
- **React Hook Form:** For robust, performant form state management and validation.
- **Date Handling:** `date-fns` for parsing and formatting dates, combined with `react-day-picker`.

## 5. Backend-as-a-Service (BaaS) Integrations
- **Firebase:** (`firebase` v12.12.1)
  - Firebase Authentication (Email/Password).
  - Firestore Database (NoSQL data storage).
- **Supabase:** (`@supabase/supabase-js` v2.105.1)
  - Supabase Storage (Object storage for user-uploaded documents).

## 6. Data Visualization & Add-ons
- **Recharts:** Used for building charts and analytics in the Admin Dashboard.
- **Embla Carousel / React Slick:** For slider/carousel components.
- **React DnD:** Drag and drop functionality.
- **Sonner:** For toast notifications.
- **Canvas Confetti:** For visual celebrations upon task completion.
