# CDS Evaluation System (课程评价系统)

A modern, responsive web application for students to evaluate and review university courses. Built with **Vue 3** and **Cloudflare Workers**, offering a seamless experience for browsing course ratings, submitting reviews, and visualizing data.

## ✨ Features

*   **📚 Course Management**: Browse, search, and filter courses by major/code. Admin support for adding/editing courses.
*   **⭐ Evaluation System**: Rate courses on multiple dimensions (Overall, Teaching, Assignment, Exam Difficulty) and leave detailed comments.
*   **📊 Data Visualization**:
    *   **Course Rankings**: Bar charts showing top-rated courses.
    *   **Word Cloud**: Visual representation of common review terms.
    *   **Dashboard**: Real-time counts of users, courses, and evaluations.
*   **👤 User Center**: Manage your own reviews, track your rating history.
*   **🎨 Modern UI/UX**:
    *   **Responsive Design**: Fully optimized for Mobile and Desktop.
    *   **Dark Mode**: Native support for light and dark themes.
    *   **i18n**: Switch between English and Chinese (简体中文).
    *   **Glassmorphism**: Trendy visual style with blur effects.
*   **☁️ Cloud Native**: Powered by Cloudflare Workers (Serverless) and D1 Database.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Pinia](https://pinia.vuejs.org/)
*   **Routing**: [Vue Router](https://router.vuejs.org/)
*   **HTTP Client**: [Axios](https://axios-http.com/)
*   **Visualization**: [ECharts](https://echarts.apache.org/) & [Vue-ECharts](https://github.com/ecomfe/vue-echarts)

### Backend
*   **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
*   **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
*   **Language**: JavaScript (ES Modules)
*   **Auth**: JWT (JSON Web Tokens) via `jose`

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd backend/cdsbackend
```

Install dependencies:
```bash
npm install
```

**Local Development with D1:**
1.  Create a local D1 database (optional, wrangler dev handles local DB mostly automatically):
    ```bash
    npx wrangler d1 create cdsdb
    ```
2.  Apply the schema:
    ```bash
    npx wrangler d1 execute cdsdb --local --file=./cds.sql
    ```
3.  (Optional) Seed data:
    ```bash
    npx wrangler d1 execute cdsdb --local --file=./courses_batch.sql
    ```
4.  Start the local development server:
    ```bash
    npm run dev
    ```
    The API will be available at `http://127.0.0.1:8787`.

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend/cdsfrondend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

## 📦 Deployment

### Backend (Cloudflare Workers)
1.  Login to Cloudflare:
    ```bash
    npx wrangler login
    ```
2.  Create a remote D1 database:
    ```bash
    npx wrangler d1 create cdsdb
    ```
3.  Update `wrangler.jsonc` with your new `database_id`.
4.  Deploy the schema to production:
    ```bash
    npx wrangler d1 execute cdsdb --remote --file=./cds.sql
    ```
5.  Deploy the Worker:
    ```bash
    npm run deploy
    ```

### Frontend (Cloudflare Pages)
1.  Build the project:
    ```bash
    npm run build
    ```
2.  Deploy to Cloudflare Pages:
    ```bash
    npx wrangler pages deploy dist --project-name cds-frontend
    ```
3.  **Important**: Go to Cloudflare Dashboard > Pages > Settings > Environment variables and set `VITE_API_URL` to your deployed Worker URL (e.g., `https://cdsbackend.your-subdomain.workers.dev`).

## 📂 Project Structure

```
CDSEvaluation/
├── backend/
│   └── cdsbackend/      # Cloudflare Worker source code
│       ├── src/
│       │   ├── index.js # Entry point & Routes
│       │   ├── handlers.js # Route Logic
│       │   └── ...
│       ├── cds.sql      # Database Schema
│       └── wrangler.jsonc # Worker Configuration
│
├── frontend/
│   └── cdsfrondend/     # Vue 3 Application
│       ├── src/
│       │   ├── views/   # Page Components (Home, CourseDetail, etc.)
│       │   ├── stores/  # Pinia Stores (Auth, Theme)
│       │   └── ...
│       └── vite.config.js
│
└── README.md            # Project Documentation
```

## 📄 License

MIT License
