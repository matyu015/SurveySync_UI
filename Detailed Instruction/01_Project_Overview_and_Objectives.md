# Project Overview & Objectives

## 1. Primary Objective
SurveySync is a modern, serverless web application designed to manage surveys, client requests, document handling, and payments. The primary goal is to provide a seamless interface for both clients (submitting requests and documents) and administrators (managing users, tracking surveys, schedules, and payments).

## 2. Key Capabilities & Processes
- **User Authentication:** Secure email/password login and registration managed by Firebase Authentication.
- **Role-Based Access Control:** Distinguishes between standard users (clients) and administrators via a `role` field in the database.
- **Request & Survey Management:** Clients can submit survey requests which are tracked and managed through various statuses.
- **Document Management:** Secure file upload capabilities via Supabase, allowing clients to attach necessary documents to their requests.
- **Scheduling/Availability:** Administrators can manage their availability, which clients can likely book or reference.
- **Payment Tracking:** Recording and tracking the status of client payments linked to their survey requests.

## 3. Core Components (UI)
Based on the project structure, the primary React components facilitating these processes include:
- `App.tsx`: The main application root and router.
- `AuthContext.tsx`: Manages the global state for user sessions and authentication.
- `RegisterPage.tsx`: Handles new user onboarding.
- `ClientDashboard.tsx`: The portal for clients to view their requests and statuses.
- `AdminDashboard.tsx`: The management console for administrators.
- `MySurvey.tsx`: Interface for interacting with or taking surveys.

## 4. Target Audience
- **Clients/End Users:** Individuals or organizations needing survey services, capable of submitting requests, tracking progress, and uploading files.
- **Administrators/Staff:** Personnel who review requests, manage payments, update survey statuses, and maintain the system.
