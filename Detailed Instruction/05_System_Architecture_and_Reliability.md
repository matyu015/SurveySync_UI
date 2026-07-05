# System Architecture & Reliability

## 1. System Architecture Diagram Concepts
SurveySync uses a **BaaS (Backend-as-a-Service) driven Client-Server Architecture**.

- **Client Layer:** A Single Page Application (SPA) built with React. It handles routing, UI state, rendering, and making API calls directly to BaaS providers.
- **Service Layer (BaaS):**
  - **Firebase Auth:** Issues JWTs (JSON Web Tokens) and handles user sessions.
  - **Firebase Firestore:** A scalable NoSQL cloud database providing real-time data sync.
  - **Supabase Storage:** S3-compatible object storage for handling binary data (images/PDFs) independent of the database.

## 2. Risk Analysis

### Security Risks
- **Client-Side Keys:** API keys for Firebase and Supabase are stored in the client bundle. While normal for these services, security relies entirely on **Backend Security Rules**. If Firestore Rules or Supabase Policies are left "Open to public" (as done during initial testing), anyone can read, write, or delete all data.
- **Role Exploitation:** The `role` field determines admin access. If a standard user finds a way to write to their own profile in the `users` collection and changes their role to `admin`, they compromise the system.

### Operational Risks
- **Vendor Lock-in:** The application relies heavily on Google Firebase and Supabase SDKs. Migrating away from them to a custom backend would require a complete rewrite of the data access layer.
- **NoSQL Schema Migration:** Because Firestore has no strict schema enforcement, if data structures change in the future (e.g., adding a new required field to `requests`), old documents will lack this field, potentially causing frontend rendering errors if not handled gracefully.

## 3. Reliability and Scalability
- **High Availability:** Firebase and Supabase are cloud-managed services that guarantee high uptime (usually 99.9%+) and scale automatically. The lack of a custom Node.js server means there is no single server to crash or maintain.
- **Real-time Capabilities:** Firestore excels at pushing data updates instantly to connected clients. This means admin dashboards can update automatically when a client submits a new request.
- **Frontend Hosting:** Since the frontend is static HTML/JS/CSS, it can be deployed on reliable edge CDNs (Content Delivery Networks) like Vercel or Cloudflare Pages, ensuring fast global load times.

## 4. Resource Dependencies
- **Development:** Requires an active internet connection to interact with the cloud databases.
- **Production:** Relies entirely on the uptime of Google Cloud (Firebase) and AWS/Cloudflare (where Supabase runs).
- **Financial:** Both Firebase and Supabase offer generous free tiers suitable for MVPs, but heavy document reads/writes or large file storage will incur costs based on usage.
