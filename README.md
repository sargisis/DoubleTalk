# DoubleTalk

**DoubleTalk** is a modern, interactive web application built to help users learn Polish. It features a gamified experience reminiscent of popular language-learning apps like Duolingo, but built from scratch with a robust Golang backend and a dynamic Next.js frontend.

## 🚀 Key Features

*   **Gamified Learning:** Earn XP points, level up, and maintain streaks by completing daily lessons.
*   **Dynamic Courses:** Navigate through a structured roadmap of units and lessons, tracking progress along the way.
*   **Interactive Exercises:** 
    *   **Vocabulary (Learn Mode):** Introduce new words with visual aids, translations, and audio pronunciation.
    *   **Quiz Mode (Flashcards):** Test your memory with multiple-choice questions.
    *   **Homework:** Fill-in-the-blank style exercises to practice sentence structure and vocabulary in context.
    *   **Grammar Practice:** Dedicated exercises to reinforce grammar rules.
*   **AI-Powered Practice:** Use the "Sentence Corrector" to write sentences in Polish and receive instant AI feedback and grammar corrections.
*   **Personalized Dictionary:** Review the words you've learned to reinforce your vocabulary.
*   **Leaderboard:** Compete with other learners by earning the most XP.
*   **User Profiles & Settings:** Customize your experience, track your statistics, and toggle visual preferences like Dark Mode.

## 🛠️ Technology Stack

**Frontend:**
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS (with custom theming for Light/Dark mode)
*   **State & Data Fetching:** React Hooks (`useState`, `useEffect`), `fetch` API.
*   **Authentication Handling:** `cookies-next` for JWT token management on the client side.

**Backend:**
*   **Language:** Golang
*   **Framework:** Gin Gonic (for routing and HTTP handling)
*   **Database:** SQLite (accessed via GORM - Go Object Relational Mapper)
*   **Authentication:** JWT (JSON Web Tokens) for secure, stateless sessions.
*   **Environment Configuration:** `godotenv`
*   **AI Integration:** Groq API (for sentence correction features)

## 📁 Project Structure

The project is divided into two main directories:

*   `/backend/`: Contains the Golang API server.
    *   `cmd/server/main.go`: The entry point for the backend server.
    *   `internal/database/`: Database connection and auto-migrations.
    *   `internal/handlers/`: API endpoint logic (Authentication, Courses, Homework, User Info).
    *   `internal/models/`: GORM database structs.
    *   `internal/services/`: Reusable business logic (e.g., XP calculation, Streak updates).
*   `/frontend/`: Contains the Next.js frontend application.
    *   `src/app/`: The Next.js App Router structure defining all pages (Dashboard, Courses, Homework, Practice, etc.).
    *   `src/components/`: Reusable React components (like the Top Navigation bar).
    *   `tailwind.config.ts` / `globals.css`: Tailwind styling configuration.

## ⚙️ Getting Started

### Prerequisites
*   Node.js (for frontend)
*   Go (1.20+ for backend)
*   A Groq API Key (for the AI Practice feature)

### Backend Setup
1.  Navigate to the backend directory: `cd backend`
2.  Install Go dependencies: `go mod download`
3.  Create a `.env` file in the root of the backend directory with the following variables:
    ```
    JWT_SECRET=your_super_secret_key_here
    GROQ_API_KEY=your_groq_api_key_here
    ```
4.  Run the server: `go run cmd/server/main.go`
    *   The server will start on `http://localhost:8080`.

### Frontend Setup
1.  Navigate to the frontend directory: `cd frontend`
2.  Install Node dependencies: `npm install`
3.  Run the development server: `npm run dev`
    *   The app will start on `http://localhost:3000`.

## 🧑‍💻 How it works (Core Logic)

*   **Authentication:** Users register/login on the frontend. The backend validates the request and issues a JWT token. The frontend stores this token in a cookie and sends it in the `Authorization` header for all subsequent API requests.
*   **Progress Tracking:** When a user completes a lesson or homework, the frontend sends a POST request to the backend. The backend updates the `LessonProgress`, awards `XP`, calculates new `Levels`, and updates the user's `WordsLearned` count.
*   **Streaks:** The `UpdateStreak` service checks the user's last activity date. If they return on consecutive days, their streak increments. If they miss a day, it resets to 1.
