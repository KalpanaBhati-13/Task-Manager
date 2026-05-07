# Team Task Manager

A full-stack task management application built with Next.js, React, and MongoDB.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/)
*   **ODM:** [Mongoose](https://mongoosejs.com/)
*   **Authentication & Security:** `bcryptjs` for password hashing, custom JWT/Session logic (via `jose` or similar depending on implementation).

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskmanager
```

*(Note: See `.env.example` for reference. Do not commit your actual `.env.local` file!)*

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

*   `/app`: Contains the Next.js App Router pages (e.g., `/login`, `/register`, `/dashboard`) and API routes (`/api/...`).
*   `/models`: Mongoose database schemas (e.g., `User.js`, `Task.js`, `Project.js`).
*   `/lib`: Utility functions and database connection logic (`db.js`).
*   `/components`: Reusable React UI components.

## Features

*   User registration with strong password & email validation.
*   Secure user authentication (hashed passwords).
*   Role-based access (Admin / Member).
