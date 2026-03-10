# CivicTrack - Civic Issue Reporting & Monitoring System

A full-stack web application that allows citizens to report civic problems (potholes, garbage, water supply, streetlight failures, drainage) and government authorities to monitor and resolve them efficiently.

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Maps:** Leaflet + OpenStreetMap
- **Hosting:** Firebase Hosting / Vercel

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Next.js 14                  │
│              (App Router + SSR)              │
├─────────────┬───────────────────────────────┤
│  Citizen UI │       Admin Dashboard          │
│  - Report   │  - Issue Management            │
│  - Track    │  - Analytics                   │
│  - View     │  - Map Visualization           │
├─────────────┴───────────────────────────────┤
│           Firebase Services                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Auth   │ │Firestore │ │ Storage  │    │
│  │(Users)   │ │ (Data)   │ │(Files)   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

## Folder Structure

```
civic-issue-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── providers.tsx       # Auth + Toast providers
│   │   ├── globals.css         # Global styles
│   │   ├── login/page.tsx      # Login page
│   │   ├── register/page.tsx   # Registration page
│   │   ├── dashboard/page.tsx  # Citizen dashboard
│   │   ├── report/page.tsx     # Report issue form
│   │   ├── my-reports/page.tsx # Citizen's reports list
│   │   ├── issues/[id]/page.tsx# Issue detail (shared)
│   │   └── admin/
│   │       ├── dashboard/page.tsx # Admin dashboard
│   │       ├── issues/page.tsx    # All issues list
│   │       └── map/page.tsx       # Map visualization
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Navigation bar
│   │   │   └── Footer.tsx      # Footer
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── features/           # Feature components
│   │       ├── ImageUpload.tsx
│   │       ├── VoiceRecorder.tsx
│   │       ├── LocationPicker.tsx
│   │       ├── IssueCard.tsx
│   │       └── IssueFiltersBar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── services/
│   │   ├── authService.ts      # Authentication logic
│   │   ├── issueService.ts     # Issue CRUD operations
│   │   ├── commentService.ts   # Comments & status updates
│   │   └── storageService.ts   # File upload logic
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── constants.ts        # App constants
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── firebase.json               # Firebase config
├── .env.local                  # Environment variables
└── .env.example                # Template for env vars
```

## Database Schema (Firestore)

### Collections

#### `users`
| Field        | Type   | Description            |
|-------------|--------|------------------------|
| uid         | string | Firebase Auth UID      |
| email       | string | User email             |
| displayName | string | Full name              |
| role        | string | 'citizen' or 'admin'   |
| createdAt   | string | ISO timestamp          |
| updatedAt   | string | ISO timestamp          |

#### `issues`
| Field           | Type   | Description              |
|----------------|--------|--------------------------|
| userId         | string | Reporter's UID           |
| userName       | string | Reporter's name          |
| userEmail      | string | Reporter's email         |
| imageUrl       | string | Uploaded image URL       |
| voiceUrl       | string | Voice recording URL      |
| description    | string | Issue description        |
| category       | string | Issue category           |
| priority       | string | low/medium/high/emergency|
| locationLat    | number | GPS latitude             |
| locationLng    | number | GPS longitude            |
| locationAddress| string | Reverse geocoded address |
| status         | string | pending/verified/in_progress/resolved |
| createdAt      | string | ISO timestamp            |
| updatedAt      | string | ISO timestamp            |

#### `comments`
| Field     | Type   | Description         |
|----------|--------|---------------------|
| issueId  | string | Parent issue ID     |
| userId   | string | Commenter's UID     |
| userName | string | Commenter's name    |
| userRole | string | citizen/admin       |
| text     | string | Comment text        |
| createdAt| string | ISO timestamp       |

#### `status_updates`
| Field          | Type   | Description           |
|---------------|--------|-----------------------|
| issueId       | string | Parent issue ID       |
| previousStatus| string | Status before change  |
| newStatus     | string | Status after change   |
| updatedBy     | string | Admin's UID           |
| updatedByName | string | Admin's name          |
| note          | string | Update note           |
| createdAt     | string | ISO timestamp         |

---

## Setup & Installation

### 1. Prerequisites
- Node.js 18+
- npm
- Firebase project

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password provider
4. Create a **Firestore Database** (start in test mode, then apply rules)
5. Enable **Storage**
6. Go to Project Settings → General → Your apps → Add web app
7. Copy the Firebase config values

### 3. Environment Configuration

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Admin Account

1. Register a new account choosing "Authority" role
2. Or manually update a user's `role` field to `"admin"` in Firestore

### 6. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## Features

### Citizen Features
- Register/Login with Firebase Auth
- Report civic issues with image, location, description
- Select issue category & priority level
- Record optional voice notes
- View submitted complaints
- Track issue status in real-time
- Comment on issues

### Admin Features
- Dashboard with analytics overview
- View all reported issues
- Filter by category, priority, status
- Map visualization with color-coded markers
- Update issue status (pending → verified → in progress → resolved)
- Add progress notes
- Emergency issue highlighting

---

## Issue Categories
- 🕳️ Pothole
- 🗑️ Garbage Collection
- 💧 Water Supply
- 💡 Streetlight Failure
- 🌊 Drainage Problem
- 📋 Other

## Status Flow
```
Pending → Verified → In Progress → Resolved
```

## Priority Levels
- 🟢 Low
- 🟡 Medium
- 🟠 High
- 🔴 Emergency
