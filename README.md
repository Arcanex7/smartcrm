# 🧠 SmartCRM AI — Niche-Personalized AI CRM Platform

![SmartCRM](https://img.shields.io/badge/SmartCRM-Live-8B5CF6?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-Groq%20LLaMA-ff6b35?style=for-the-badge)

> An AI-powered CRM platform that personalizes itself around your industry. Real estate agents, SaaS founders, doctors, coaches — each gets a completely different experience built for their workflow.

---

## 🌐 Live Demo

- **Frontend:** [https://smartcrm-murex.vercel.app](https://smartcrm-murex.vercel.app)
- **Backend API:** [https://smartcrm-h5px.onrender.com](https://smartcrm-h5px.onrender.com)

### Demo Credentials
| Email | Password | Niche |
|-------|----------|-------|
| aryan@smartcrm.com | 123456 | Real Estate |

---

## ✨ What Makes SmartCRM Unique

Most CRMs are generic. SmartCRM says: *"Tell us what you do and we'll give you exactly what you need."*

When you register, you choose your industry. Your entire CRM then personalizes:

| What Changes | Example (Real Estate vs SaaS) |
|-------------|-------------------------------|
| Pipeline stages | Site Visit → Token Paid vs Trial → Demo → Proposal |
| Lead fields | BHK, Location, Loan Required vs MRR, Company Size, Decision Maker |
| Dashboard KPIs | Pipeline Value, Site Visits vs MRR, Trial Conversions |
| Terminology | Prospects, Properties vs Leads, Deals |
| AI prompts | Context-aware for your industry |
| WhatsApp templates | Pre-filled with relevant fields |

---

## 🎯 Supported Industries

| Niche | Pipeline | Key Fields |
|-------|----------|-----------|
| 🏠 Real Estate | New Lead → Site Visit → Token Paid → Closed | Property type, BHK, Budget, Location |
| 💻 SaaS / Tech | Lead → Trial → Demo → Proposal → Won | MRR, Company size, Pain point |
| 🏥 Healthcare | Inquiry → Appointment → Treatment → Follow-up | Condition, Insurance, Age |
| 🎓 Education | Inquiry → Demo Class → Enrolled → Active | Course, Budget, Schedule |
| 💼 Freelance | Inquiry → Scoping → Proposal → Contract | Project type, Timeline, Budget |
| 💰 Finance | Lead → KYC → Proposal → Policy Issued | Policy type, Premium, Income |
| 🛍️ Retail | Prospect → First Purchase → Repeat → VIP | Product, Location, Source |
| 🍽️ Restaurant | Inquiry → Tasting → Advance → Confirmed | Event type, Guest count, Date |

---

## 🤖 AI Features

All AI powered by **Groq (LLaMA 3.1)** — completely free:

- **AI Morning Digest** — Daily brief with hot leads, idle leads, priorities and motivation
- **Follow-up Generator** — Context-aware WhatsApp message, call script or email in seconds
- **Email Drafter** — Professional follow-up email with subject line
- **Meeting Brief** — Full prep notes before any call — background, talking points, objections
- **Lead Scorer** — AI scores every lead 0-100 with reason and recommended next action
- **Ask AI Anything** — Open-ended sales advice specific to your niche

---

## 🚀 Core Features

### 📊 Dashboard
- Revenue-first KPIs — money made, hot leads, conversion rate, pending follow-ups
- Emotional greeting — "You're ₹X away from your monthly target 🔥"
- Rotating AI insights with actionable recommendations
- Pipeline summary with value at each stage
- Monthly target progress bar
- Skeleton loading states

### 👥 Lead Management
- Full CRUD with niche-specific custom fields
- 🔥 Hot lead tagging with glow effect
- 💬 WhatsApp click-to-chat with pre-filled message template
- 🔔 Follow-up reminders with date/time picker
- Activity timeline — log calls, emails, meetings, notes
- Stage change from within detail modal
- Search and filter by stage, hot status
- Overdue follow-up alerts

### 📋 Pipeline (Kanban)
- Drag and drop between stages
- Optimistic UI updates — card moves instantly
- Glassmorphism card design
- Quick add from any column
- Stage value totals
- HOT badge and DUE badge on cards

### 📈 Analytics
- Total pipeline value, closed revenue, conversion rate, avg deal value
- Pipeline breakdown bar chart per stage
- Lead quality donut chart (hot vs normal vs lost)
- Lead source breakdown
- Top leads by value
- Monthly target tracking
- At-risk leads counter

### ⚙️ Settings
- Profile management
- Workspace settings (name, city, currency, monthly target)
- Team invite system
- RBAC permissions table
- Niche configuration viewer
- Password change
- Danger zone (export, clear, delete)

---

## 🔐 Role-Based Access Control (RBAC)

| Permission | Admin | Manager | Rep | Viewer |
|-----------|-------|---------|-----|--------|
| View all leads | ✅ | ✅ | Own only | ✅ |
| Add leads | ✅ | ✅ | ✅ | ❌ |
| Edit leads | ✅ | ✅ | Own only | ❌ |
| Delete leads | ✅ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ❌ | ❌ |
| Manage team | ✅ | ❌ | ❌ | ❌ |
| Use AI features | ✅ | ✅ | ✅ | ❌ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Socket.io-client |
| Backend | Node.js, Express.js, MongoDB (Atlas), Mongoose |
| Auth | JWT with role claims (admin/manager/rep/viewer) |
| Real-time | Socket.io — organization-scoped rooms |
| AI | Groq SDK (LLaMA 3.1 8B Instant) — free tier |
| Fonts | Syne (headings) + Inter (body) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🏗️ Architecture

```
smartcrm/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx   # Marketing landing page
│   │   │   ├── Register.jsx  # 3-step niche onboarding
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx # Niche-personalized dashboard
│   │   │   ├── Leads.jsx     # Full lead management
│   │   │   ├── Pipeline.jsx  # Kanban drag & drop
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── services/
│   │       └── api.js        # Axios with JWT interceptor
└── server/                   # Node.js backend
    ├── config/
    │   └── niches.js         # 🧠 The brain — all niche configs
    ├── controllers/
    │   ├── authController.js
    │   └── leadController.js # Includes AI generation
    ├── models/
    │   ├── User.js
    │   ├── Organization.js   # Multi-tenant with niche
    │   └── Lead.js           # Dynamic customFields Map
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── rbacMiddleware.js # Role hierarchy system
    └── routes/
        ├── authRoutes.js
        └── leadRoutes.js
```

---

## 🔌 API Endpoints

```
POST  /api/auth/register           Create user + organization + pick niche
POST  /api/auth/login
GET   /api/auth/me
GET   /api/auth/niches             All 8 niche configs

GET   /api/leads                   Role-filtered lead list
POST  /api/leads                   Create lead with custom fields
GET   /api/leads/dashboard         Niche-specific KPIs and stats
GET   /api/leads/pipeline          Leads grouped by stage
GET   /api/leads/followups/today   Today's follow-ups
GET   /api/leads/:id
PUT   /api/leads/:id
PATCH /api/leads/:id/stage         Kanban drag & drop
PATCH /api/leads/:id/hot           Toggle hot lead
POST  /api/leads/:id/activity      Log call/email/meeting/note
POST  /api/leads/:id/reminder      Set follow-up reminder
GET   /api/leads/:id/whatsapp      Get pre-filled WhatsApp URL
DELETE /api/leads/:id              Archive lead

POST  /api/leads/ai/generate       AI content generation
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_your_groq_key
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install --legacy-peer-deps
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### Seed Database
```bash
cd server
node seedLeads.js
```

---

## 🚀 Deployment

### Backend (Render)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `GROQ_API_KEY`

### Frontend (Vercel)
- Root Directory: `client`
- Install Command: `npm install --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable: `VITE_API_URL`

Add `client/vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 💡 Key Technical Decisions

- **Niche config system** — One JS object drives the entire UI: stages, fields, KPIs, terminology, AI context. No database migrations needed to add new niches.
- **Dynamic customFields** — MongoDB Map type stores any niche's fields without fixed schema. Same pattern used by Salesforce and HubSpot internally.
- **Role hierarchy** — Numeric role levels (viewer=1, rep=2, manager=3, admin=4) instead of string comparisons. `requireRole('manager')` means "manager or above".
- **Optimistic UI on Kanban** — Card moves instantly in state, API call happens in background. If it fails, state rolls back.
- **Groq for free AI** — LLaMA 3.1 8B Instant via Groq has generous free tier, OpenAI-compatible API, and extremely fast inference.

---

## 📊 Interview Story

*"I built SmartCRM AI — a niche-aware CRM platform where the entire product personalizes itself based on the user's industry. A real estate agent gets different pipeline stages, lead fields, and dashboard metrics than a SaaS founder. On top of that I integrated LLaMA 3.1 via Groq throughout — AI scores every lead, generates personalized follow-up messages with full context of past interactions, detects deals at risk, and gives a morning digest to managers. The hardest part was designing the niche configuration system so one codebase drives infinite personalization, and prompt engineering the AI to have full CRM context when generating communications."*

---

## 👨‍💻 Author

**Aryan Kumar**
- 3rd Year CS, Chandigarh University (2023–2027)
- GitHub: [@Arcanex7](https://github.com/Arcanex7)

---

## 📄 License

MIT License — feel free to use for learning and portfolio purposes.
