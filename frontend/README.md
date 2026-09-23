# MediStock — Frontend 1

**Member 1 Contribution**: Authentication UI, React Setup, Form Validation & Axios API Integration.

---

## 🎯 Purpose & Scope

This project represents the complete **Frontend 1** deliverable for the **MediStock** Medical Inventory Management System. It provides a standalone, robust React application focused on user authentication and routing.

### ✅ Features Included (Frontend 1 Scope)
- **React + Vite Project Setup**: Modern, lightning-fast development build.
- **Login Page (`/login`)**:
  - Medical inventory themed two-panel layout (branding & showcase + responsive login card).
  - Client-side email and password validation with real-time feedback.
  - Show/hide password toggle.
  - Loading spinner states and submit lock to prevent double submissions.
  - User-friendly error/success alert banners.
- **Register Page (`/register`)**:
  - Matching healthcare design system.
  - Registration fields: Full Name, Email, Role (`ADMIN`, `PHARMACIST`, `STAFF`), Password, Confirm Password.
  - Client-side validation (email format, 8+ char password, matching passwords, required role).
  - Dual password visibility toggles.
  - Automatic redirect to `/login` with success banner upon completion.
- **Axios Setup**:
  - Reusable Axios client configured with environment variables (`VITE_API_BASE_URL`).
  - Standard headers and connection timeout handling.
- **Authentication Service (`authService.js`)**:
  - `login({ email, password })` -> `POST /api/auth/login`
  - `register({ name, email, password, role })` -> `POST /api/auth/register`
  - Graceful error mapping for HTTP 400, 401, 409, 500, and Network connectivity failures.
- **Routing**: Client-side navigation powered by `react-router-dom`.

### 🚫 Intentionally Excluded (Belongs to Other Team Members)
- Inventory Management & Medicine CRUD
- Supplier & Purchase Management
- Expiry Tracking & Notifications
- Dashboards (Admin / Pharmacist / Staff) & Charts
- Backend / Database / Spring Boot APIs
- Frontend 2 features

---

## 🛠️ Technologies Used

- **React 18**: UI component library
- **Vite 6**: Fast build tool and dev server
- **React Router DOM 6**: Client-side routing
- **Axios**: HTTP client for API integration
- **Lucide React**: Clean medical and UI icons
- **Vanilla CSS**: Curated medical design tokens, glassmorphism, responsive grid

---

## 📁 Project Structure

```
medistock-frontend/
├── index.html               # Main HTML entry with Google Fonts
├── package.json             # Scripts & dependencies
├── vite.config.js           # Vite configuration
├── .gitignore               # Ignored files (node_modules, .env, dist)
├── .env.example             # Environment variable template
├── README.md                # Documentation
└── src/
    ├── components/
    │   └── Loading.jsx      # Reusable loading indicator
    ├── pages/
    │   ├── Login.jsx        # Login page with validation & API connection
    │   └── Register.jsx     # Registration page with validation & API connection
    ├── services/
    │   ├── api.js           # Configured Axios instance
    │   └── authService.js   # Auth API calls & error normalization
    ├── App.jsx              # Routing configuration
    ├── main.jsx             # React entry point
    └── index.css            # Medical theme & styling
```

---

## 🔌 API Endpoints Contract

The authentication service connects to the following REST API endpoints:

| Action | HTTP Method | Endpoint | Request Body Payload |
|---|---|---|---|
| **User Login** | `POST` | `/api/auth/login` | `{ "email": "user@hospital.com", "password": "password123" }` |
| **User Register** | `POST` | `/api/auth/register` | `{ "name": "Jane Doe", "email": "jane@hospital.com", "password": "password123", "role": "PHARMACIST" }` |

### Expected / Assumed Response Format
- **Success (200 / 201)**:
  ```json
  {
    "token": "jwt-token-string",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@hospital.com",
      "role": "PHARMACIST"
    },
    "message": "Authentication successful"
  }
  ```
- **Error (400 / 401 / 409 / 500)**:
  ```json
  {
    "message": "Invalid email or password."
  }
  ```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Installation
Navigate into the frontend folder and install all required dependencies:

```bash
cd medistock-frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure your backend server URL in `.env` if different:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Running Development Server
Start the local Vite dev server:

```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000` (or the port specified by Vite).

### 5. Building for Production
Create an optimized production build:

```bash
npm run build
```
The output will be placed in the `dist/` directory.

---

## 🔒 Security Best Practices
- No credentials or API keys are hardcoded.
- `.env` and `node_modules` are excluded in `.gitignore`.
- Password fields are masked by default with user-triggered visibility toggles.
