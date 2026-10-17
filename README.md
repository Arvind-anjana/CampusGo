# 🚌 CampusGo — Real-Time Campus Bus Tracking System

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**CampusGo** is a full-stack real-time campus bus tracking and fleet management system built with **React Native (Expo)**, **Node.js**, **Express**, and **MongoDB**. It bridges the gap between campus transport management, bus drivers, and students/faculty by enabling live vehicle tracking, dynamic route scheduling, and fleet allocation.

---

## 📌 Table of Contents

- [Features](#-features)
  - [Transport Manager Dashboard](#1-transport-manager-dashboard)
  - [Driver Portal](#2-driver-portal)
  - [Passenger / Student Experience](#3-passenger--student-experience)
- [Tech Stack](#-tech-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started & Installation](#-getting-started--installation)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Mobile App Setup](#2-mobile-app-setup)
- [Environment Configuration](#-environment-configuration)
- [API Overview](#-api-overview)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🚀 Features

### 1. Transport Manager Dashboard
- **Driver Management:** Register new drivers, view active drivers, update contact credentials, and manage license information.
- **Route & Stop Configuration:** Create, edit, and organize campus routes, pick-up points, and arrival milestones.
- **Bus & Fleet Allocation:** Assign buses and routes to designated drivers.
- **Live Fleet View (Bus Board & Map):** Monitor active buses in real-time on an interactive map.

### 2. Driver Portal
- **Secure Driver Authentication:** JWT-based login credentials.
- **Duty & Assignment View:** Instant view of assigned bus, designated route, and scheduled stops.
- **Live Location Broadcasting:** Transmit real-time GPS coordinates directly from the driver device during transit.

### 3. Passenger / Student Experience
- **Interactive Bus Map:** Track bus locations in real-time powered by `react-native-maps`.
- **Route Exploration:** Browse active routes, operational timings, and nearby bus stops.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App (Frontend)** | React Native, Expo (SDK 57), Expo Router, TypeScript, React Native Maps, Reanimated |
| **Backend API** | Node.js (ES Modules), Express.js (v5), CORS |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication & Security** | JSON Web Tokens (JWT), Bcrypt password hashing |
| **Styling & Icons** | Vector Icons, Expo Fonts, Modern Vanilla Responsive Design |

---

## 📂 System Architecture & Folder Structure

```text
CampusGo/
├── App/                       # Mobile application (React Native / Expo)
│   ├── assets/                # App icons, splash screens, and images
│   ├── src/
│   │   ├── app/               # File-based routing (Expo Router)
│   │   │   ├── Driver/        # Driver home & trip tracking screens
│   │   │   ├── Login/         # Auth screens (Driver & Transport Manager)
│   │   │   ├── TransportManager/ # Manager dashboard, route, driver & map screens
│   │   │   ├── _layout.tsx    # Root navigation layout
│   │   │   └── index.tsx      # Welcome / Role Selection landing screen
│   │   ├── components/        # Reusable UI components
│   │   ├── constants/         # App constants & styling tokens
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # API client & helper utilities (api.ts)
│   ├── app.json               # Expo project configuration
│   └── package.json           # Mobile app dependencies
│
└── backend/                   # REST API backend server
    ├── configs/               # Database connection (db.js)
    ├── controllers/           # Route logic (Auth, Driver, Bus, Routes, etc.)
    ├── middlewares/           # Authentication & validation middlewares
    ├── models/                # Mongoose database schemas (User, Bus, Route, Assignment)
    ├── routes/                # Express API endpoints
    ├── .env                   # Environment variables (port, db connection, secret)
    ├── server.js              # Server entry point
    └── package.json           # Backend dependencies
```

---

## 📋 Prerequisites

Before running the project, make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18.x or v20.x recommended)
- **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/)**
- **[MongoDB](https://www.mongodb.com/)** (Local MongoDB Community Server or MongoDB Atlas cloud URI)
- **[Expo Go](https://expo.dev/go)** app on your physical iOS/Android device OR **Android Studio Emulator**

---

## 💻 Getting Started & Installation

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create/verify the `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URL=mongodb://127.0.0.1:27017/BMSAPP
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   > You should see: `Server is listning at 5000` and MongoDB connection confirmation.

---

### 2. Mobile App Setup

1. Open a new terminal and navigate to the `App` folder:
   ```bash
   cd App
   ```

2. Install mobile app dependencies:
   ```bash
   npm install
   ```

3. **⚠️ Critical: Configure Backend IP Address in Mobile App (`App/src/utils/api.ts`)**

   Because mobile devices and emulators cannot reach your computer via `localhost` (since `localhost` refers to the mobile device itself), you **must update the IP address** before running the app.

   #### How to find your computer's IP address:
   - **Windows:** Open Command Prompt / PowerShell and run:
     ```cmd
     ipconfig
     ```
     Look for the **IPv4 Address** under your active Wi-Fi or Ethernet adapter (e.g., `192.168.1.15` or `10.x.x.x`).
   - **macOS / Linux:** Run:
     ```bash
     ifconfig   # or: ip a
     ```

   #### Update `api.ts`:
   Open [`App/src/utils/api.ts`](App/src/utils/api.ts) and edit line 11:

   ```typescript
   // App/src/utils/api.ts

   // 1. For Physical Device testing with Expo Go (Phone and PC on same Wi-Fi):
   export const BASE_URL = 'http://<YOUR_COMPUTER_IPV4_ADDRESS>:5000/api';
   // Example: export const BASE_URL = 'http://192.168.1.50:5000/api';

   // 2. For Android Emulator (maps to your PC's localhost):
   // export const BASE_URL = 'http://10.0.2.2:5000/api';

   // 3. For Web / Desktop browser:
   // export const BASE_URL = 'http://localhost:5000/api';
   ```

   > [!IMPORTANT]
   > - If testing on a physical phone via Expo Go, **both your phone and your PC must be connected to the exact same Wi-Fi network**.
   > - If API requests fail, ensure **Windows Defender Firewall** is allowing inbound traffic on port `5000`.

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. **Run the App:**
   - Scan the displayed QR code with **Expo Go** (Android) or the **Camera app** (iOS).
   - Or press `a` for Android Emulator / `w` for Web.


---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port number for Express server | `5000` |
| `MONGO_URL` | Connection string for MongoDB database | `mongodb://127.0.0.1:27017/BMSAPP` |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | `your_secret_key` |

---

## 📡 API Overview

Base URL: `http://<HOST>:5000/api`

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | User/Driver/Manager login & token generation |
| **Transport Manager**| `GET` / `POST` | `/transport-managers` | Fetch or create manager accounts |
| **Drivers** | `GET` / `POST` | `/drivers` | List all drivers or register a new driver |
| **Drivers** | `PUT` / `DELETE`| `/drivers/:id` | Update driver details or remove driver |
| **Routes** | `GET` / `POST` | `/routes` | Fetch routes & stops or create new route |
| **Routes** | `PUT` / `DELETE`| `/routes/:id` | Update route coordinates or remove route |
| **Buses** | `GET` / `POST` | `/bus` | Fetch bus fleet list or register a new bus |
| **Assignments** | `GET` / `POST` | `/assignments` | View or assign bus & route to driver |

---

## ❓ Troubleshooting

- **App cannot connect to the backend (Network request failed):**
  - Verify your PC and mobile device are connected to the exact same Wi-Fi network.
  - Double check your PC's IP address (`ipconfig` in CMD) matches the one in `App/src/utils/api.ts`.
  - Ensure Windows Defender Firewall allows incoming connections on port `5000`.
- **MongoDB Connection Error:**
  - Make sure the local MongoDB service is running (`net start MongoDB` or via MongoDB Compass).

---

## 📄 License

This project is licensed under the [MIT License](App/LICENSE).
