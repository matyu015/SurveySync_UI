🚀 SurveySync — Full System Prompt (Production-Grade)


You are building SurveySync — a $200M-caliber, production-ready, AI-assisted survey service management platform for C.I. Mamaradlo Surveying Office, Dinalupihan, Bataan, Philippines. This is not a prototype. This is a world-class SaaS web application. Every screen, interaction, and micro-detail must feel polished, intentional, and enterprise-grade.

🏢 SYSTEM OVERVIEW
Application Name: SurveySync
Developer Team: TerraLog Development Team (Baniega, Matt Edward & Gacayan, Rhic John C.) — BSIT-3B, Gordon College
Beneficiary: C.I. Mamaradlo Surveying Office, 4 San Ramon, Dinalupihan, 2110 Bataan
Representative: Engr. Cris I. Mamaradlo, RGE
Tagline: "Mapping the Future, Syncing Your Success."
Brand Colors:

Primary: Deep Navy #0D1B3E
Accent: Teal/Emerald #14B8A6
Danger/Alert: Crimson #DC2626
Warning: Amber #F59E0B
Success: Green #16A34A
Background: #F0F4F8 (light mode), #0A1628 (dark mode)
Card surface: #FFFFFF / #112240

Typography: Clash Display or Syne for headings; DM Sans or Plus Jakarta Sans for body. NO Inter, Roboto, or Arial.
Tech Stack (Frontend): React, Tailwind CSS (core utility classes only — no compiler), lucide-react icons, recharts for data visualization. All data is mock/hardcoded. Full interactivity via useState/useReducer.

👤 USER ROLES & ACCOUNT SYSTEM
Role 1: CLIENT (Landowner / Property Owner)
Registration fields: Full Name, Email, Phone (PH format: 09XX-XXX-XXXX), Password, Confirm Password, Home Address (Street, Barangay, Municipality, Province), Valid ID Type (dropdown: PhilSys, Driver's License, Passport, Voter's ID, PRC), Valid ID Number, Upload Valid ID (front & back — file input UI)
Login: Email + Password. After login, redirect to Client Dashboard.
Client account has a Profile page showing: personal info, uploaded ID status (Verified / Pending Verification badge), account creation date, total requests submitted, active requests.
Role 2: OFFICE STAFF (Internal)
Login only (no public registration). Credentials pre-set. Access to full Admin Panel.
Role 3: SUPER ADMIN / ENGR. MAMARADLO
Full access including staff management, system settings, audit logs, and financial reports.
Auth Flow:

Landing Page → Login / Register
Email verification step (UI only, mock OTP screen: 6-digit code input with resend timer)
Forgot Password flow (email input → mock reset screen)
Role-based redirect after login
Session shown in top navbar: avatar, name, role badge, logout


🗂️ PRE-REQUEST DOCUMENT REQUIREMENTS
Before a client can submit a survey request, the system enforces a Document Checklist gate. This is critical.
Document Vault (Client-side)
Each client has a personal Document Vault — a dedicated section in their dashboard where they upload and manage documents before they can make any request.
Required documents per survey type:
Survey TypeRequired DocumentsLot / Parcel SurveyTCT or OCT copy, Tax Declaration, Lot sketch/vicinity map, Owner's valid IDSubdivision SurveyMother title (TCT/OCT), Approved Subdivision Plan (if existing), Tax Declaration, Barangay clearanceRelocation SurveyTCT or OCT, Tax Declaration, Original survey plan (if available), Adjacent lot owner infoConsolidation SurveyAll TCTs of lots to be consolidated, Tax Declarations for all lots, Deed of ConsolidationTopographic SurveyProject brief or site description, Location map, Authorization letter if representativeAs-Built SurveyApproved building plans, Building permit, Location mapRight-of-Way SurveyProject description, Location map, Land ownership documentsLand Titling AssistancePSA Birth Certificate, Tax Declaration, Deed of Sale or Extrajudicial Settlement, Barangay certification
Document Vault UI:

Grid of document slots, each labeled with document name
Each slot has: Upload button, file preview thumbnail (PDF icon or image), upload date, status badge (Uploaded / Missing / Under Review / Verified / Rejected with reason)
A global vault completion progress bar (e.g., "4 of 6 documents uploaded")
"Verify My Documents" CTA that submits vault to staff for review

Request Gate Logic:

Client cannot proceed to Submit Request unless their vault has all required documents for the selected survey type AND at least their Valid ID is verified
If documents are missing, clicking "New Request" shows a modal: "Complete Your Document Vault First" with a checklist of what's missing and a direct link to the vault


📋 SURVEY REQUEST FLOW (CLIENT)
Step 1 — Survey Type Selection
Full-screen step with illustrated cards for each of the 8 survey types. Each card shows: icon, name, short description, estimated duration, estimated base price range (PHP). Selecting one highlights it and shows the document requirements checklist on the right panel.
Step 2 — Property Details

Property Address: Region (auto-filled: Region III), Province (auto-filled: Bataan), Municipality/City (dropdown), Barangay (dropdown dependent on municipality), Street/Purok
Lot Number, Block Number, Survey Number (optional)
Total Lot Area (sqm, optional estimate)
Purpose of Survey (dropdown: For Sale, Titling, Inheritance/Estate, Development, Boundary Dispute, Government Requirement, Other)
Additional Description (textarea)
Upload vicinity map or sketch (optional, file input)

Step 3 — Appointment Scheduling

Calendar component showing the next 60 days
Dates with existing bookings show count (e.g., "2 booked") but may still be available
Fully booked dates are grayed out and unclickable
Weekends highlighted differently
Philippine public holidays marked with a flag icon and tooltip
Select preferred date → select preferred time slot (Morning 8AM–12PM / Afternoon 1PM–5PM)
Option: "Field survey required" toggle (yes/no). If yes, a note appears: "Our geodetic team will visit your property. Ensure access is available."
Alternative date (optional backup date picker)

Step 4 — Contact & Representative Info

Is the requestor the property owner? (Yes/No toggle)
If No: Representative Name, Relationship to Owner, Representative Contact, Authorization Letter upload (required)
Best time to contact (Morning / Afternoon / Evening)
Preferred contact method (SMS / Call / Email)
Emergency contact name and number

Step 5 — Payment Setup

Display estimated fee based on survey type (e.g., Lot Survey: ₱3,500–₱8,000 depending on area)
Note: "Final fee will be assessed after document review and site evaluation."
Downpayment required: 30% of minimum estimate (shown in PHP)
Payment method selection: GCash (via PayMongo), Over-the-Counter (7-Eleven / Bayad Center barcode), Bank Transfer (details shown), Cash at Office
If GCash: Show mock payment QR code UI with timer (15:00 countdown), reference number, amount
If OTC: Show mock barcode with instructions
Payment slip upload option ("Already paid? Upload your receipt")

Step 6 — Review & Confirm

Full summary of all entered data in a clean card layout
Document checklist summary (all uploaded docs listed with green checkmarks)
Appointment summary box
Payment method summary
Terms & Conditions checkbox (expandable modal with actual terms text)
Privacy Policy checkbox
"Submit Request" button → loading state → success screen

Success Screen

Animated checkmark
Reference number (e.g., SS-2026-04-0042)
What happens next: 3-step timeline (1. Office reviews documents within 24–48 hours → 2. You'll receive SMS/email confirmation → 3. Field survey on your scheduled date)
Buttons: "Track My Request" | "Go to Dashboard" | "Download Confirmation PDF" (mock)


🏠 CLIENT DASHBOARD
Top: Welcome banner with client name, verification status badge, quick stats (Total Requests, Active, Completed, Pending Payment)
My Requests Tab

Table/card list of all requests with: Reference No., Survey Type, Property Location, Date Submitted, Scheduled Date, Status, Payment Status, Actions
Status pipeline visualization per request: Submitted → Under Review → Documents Verified → Scheduled → Field Survey → Processing → Completed
Click any request → Request Detail Page (full timeline, notes from staff, document list, payment history, downloadable outputs)

Document Vault Tab

Full document vault UI described above

Appointments Tab

Upcoming appointments in calendar + list view
Past appointments with outcome notes
Reschedule request button (opens modal with new date picker + reason field)

Payments Tab

All payment transactions: Date, Reference No., Survey Request, Amount, Method, Status (Paid / Pending / Failed / Refunded)
Outstanding balance alerts
"Pay Now" button for pending payments
Downloadable official receipts (mock PDF button)

Notifications Tab

Bell icon in navbar with unread count badge
List of notifications: Document verified, Appointment confirmed, Payment received, Staff message, Survey completed
Mark all as read button

Messages Tab

Simple chat-style interface between client and office staff
Message thread per request
Staff can send updates, request additional documents, or send instructions
Timestamps, read receipts (mock)


🖥️ ADMIN PANEL (OFFICE STAFF & SUPER ADMIN)
Sidebar Navigation (collapsible):
Dashboard, Requests, Appointments/Calendar, Clients, Document Review, Payments & Ledger, AI Document Repository, Reports & Analytics, Staff Management (Super Admin only), System Settings (Super Admin only), Audit Log (Super Admin only)
Admin Dashboard (Home)
Top KPI cards (large, colorful):

Total Requests This Month
Pending Review
Scheduled Field Surveys
Completed This Month
Total Revenue (PHP) This Month
Overdue / Delayed Requests (red alert card)

Charts (using recharts):

Bar chart: Requests per month (last 12 months)
Donut chart: Distribution by survey type
Line chart: Revenue trend (last 6 months)
Bar chart: Requests by municipality (Dinalupihan, Hermosa, Orani, Balanga, Mariveles, etc.)

Recent activity feed (right panel): timestamped log of latest actions (new request submitted, document uploaded, payment received, appointment rescheduled)
Alerts panel: Overdue requests, unverified documents pending >48hrs, upcoming field surveys tomorrow
Request Management

Filterable, sortable table: all columns, search bar, filters by status/type/date range/municipality
Bulk actions: Assign staff, change status, export to CSV
Click a request → full Request Detail View:

All client info and property details
Document review panel (view each doc, approve/reject with comment)
Status pipeline stepper (admin can advance or revert stages)
Assign geodetic surveyor (staff dropdown)
Internal notes section (staff-only)
Client communication thread
Payment record for this request
Output files section (upload completed survey outputs: PDF lot plan, technical description, etc.)



Calendar / Appointments

Full month/week/day calendar view toggle
Color-coded by survey type
Click a day → see all appointments for that day with client name, survey type, location, assigned staff
Add/edit appointment modal
"Field Survey" appointments show property address and assigned team
Conflict detection: overlapping appointments highlighted in red
Export calendar to PDF or print view

Client Management

Table of all registered clients with: Name, Contact, Location, Verified ID (yes/no badge), Total Requests, Join Date, Status (Active/Inactive/Blacklisted)
Click client → full client profile: personal info, ID verification status, all their requests, payment history, documents in vault, communication log
Manual ID verification: view uploaded ID images, click Verify or Reject (with reason)
Add client manually (walk-in registration form)

Document Review Panel

Queue of documents awaiting staff verification
Each item: Client name, document type, upload date, time in queue
Click to open: document preview (image viewer / PDF viewer mock), approve/reject/request resubmission buttons
Rejection requires a reason (dropdown + optional note): "Blurry/Unreadable", "Wrong Document", "Expired ID", "Missing Page", "Other"
Bulk approve option for clean batches

Payments & Ledger

Master payment table: all transactions across all clients
Filters: date range, method, status, survey type
Summary totals: Total Collected, Pending, Overdue
Manual payment recording (walk-in cash payments)
Payment status update (mark as verified after confirming GCash/OTC receipt)
Monthly revenue report generation (mock PDF export button)
Outstanding balances list with "Send Reminder" button per client (mock SMS trigger)

AI Document Repository

Hero search bar (full-width, prominent): "Search by lot number, barangay, client name, survey type, date..."
Simulated AI search: typing triggers a short loading animation then filtered results appear
Results as document cards: Survey Type badge, Lot No., Barangay, Municipality, Client Name (anonymized option toggle), Survey Date, File Size, Tags (auto-generated mock tags: "boundary", "residential", "2024", "Dinalupihan")
Sidebar filters: Survey Type, Year, Municipality, Barangay, Status (Active/Archived)
Click document card → Document Detail Modal: full metadata, preview panel, download button, related documents section ("Other surveys in this barangay"), edit metadata button
Upload new document button → form: select survey type, enter metadata, upload file, system auto-generates tags (mock)
Bulk upload mode
Storage usage bar (e.g., "2.3 GB of 10 GB used")

Reports & Analytics

Date range picker (preset: This Week / This Month / Last Quarter / This Year / Custom)
Report types (tabs): Operations Report, Financial Report, Geographic Distribution, Survey Type Analysis, Staff Performance
Each report: data table + corresponding chart
Geographic Distribution: table showing requests by municipality and barangay, with a placeholder map outline of Bataan province
Staff Performance: requests handled, avg resolution time, client satisfaction (mock stars)
Export buttons: PDF Report, Excel/CSV Data

Staff Management (Super Admin only)

Staff list: Name, Role, Email, Phone, Active Requests Assigned, Status
Add/edit/deactivate staff accounts
Role assignment: Geodetic Surveyor, Document Reviewer, Finance Officer, Admin Staff
Activity log per staff member

System Settings (Super Admin only)

Office Information: name, address, contact, logo upload
Survey Types: enable/disable types, edit base pricing, edit estimated duration
Document Requirements: configure which documents are required per survey type
Appointment Settings: working days, working hours, max bookings per day, buffer time between appointments, blackout dates (holidays)
Notification Templates: SMS and email templates for each trigger event (editable textarea)
Payment Settings: downpayment percentage, accepted methods toggle, PayMongo API key field (masked)
Branding: upload logo, set primary color (color picker), update tagline

Audit Log (Super Admin only)

Timestamped log of every system action: who did what, when, on which record
Filterable by user, action type, date
Cannot be deleted or modified


🔔 NOTIFICATIONS & ALERTS SYSTEM

In-app notification bell (navbar) with unread count
Notification types: success (green), warning (amber), error (red), info (blue)
Toast notifications for real-time actions (appear bottom-right, auto-dismiss after 4s)
Notification preferences page: toggle on/off per event type for SMS and email


🎨 UI/UX DESIGN REQUIREMENTS

Theme: Deep navy + teal. Professional, geospatial, authoritative. Feels like a ₱200M government-commissioned SaaS platform.
Layout: Fixed sidebar (admin), top navbar with breadcrumbs, main content area with max-width container
Dark/Light mode toggle (persists in state)
Responsive: Works on desktop (priority), tablet, and mobile
Empty states: Every table/list has a designed empty state (illustration placeholder + helpful message + CTA)
Loading states: Skeleton loaders for tables and cards, spinner for actions
Micro-interactions: Buttons have hover/active states, form fields have focus rings, status badges animate on change
Step forms: Multi-step forms have a progress bar at top with step labels, back/next buttons, step validation before advancing
Modals: Centered, backdrop blur, smooth open/close animation
Tables: Alternating row colors, hover highlight, sticky header on scroll, pagination (10/25/50 per page selector)
Status badges: Color-coded pill badges for all statuses
Confirmation dialogs: Destructive actions (delete, reject, blacklist) always require a confirmation modal
Tooltips: On hover for icons and truncated text
Breadcrumbs: On all inner pages (e.g., Admin > Requests > SS-2026-04-0042)


📊 MOCK DATA
Pre-populate the app with realistic Philippine mock data:

15 registered clients with Filipino names, Bataan addresses, various request statuses
20 survey requests across all types and statuses
8 document vault entries (mix of verified, pending, rejected)
12 payment records (mix of methods and statuses)
30 documents in the AI repository (various survey types, barangays in Dinalupihan, Hermosa, Orani, Balanga)
4 staff members with assigned requests
Realistic PHP amounts (₱3,500 – ₱45,000 range)
Realistic Bataan barangay names (San Ramon, Pagalanggang, Daan Bilolo, Layac, Pinulot, etc.)


🧭 NAVIGATION STRUCTURE
Public (unauthenticated): Landing → Login → Register → Forgot Password → OTP Verification
Client (authenticated): Dashboard → My Requests → New Request (6-step wizard) → Document Vault → Appointments → Payments → Messages → Notifications → Profile & Settings
Admin (authenticated): Dashboard → Requests → Calendar → Clients → Document Review → Payments & Ledger → AI Repository → Reports → Staff Management → Settings → Audit Log
Use React useState to manage a global currentView and currentUser (with role). Navigation between all views must work without page reload. All views must be fully built — no placeholder "coming soon" screens.