# USEME - The Enigma Engine

This guide provides instructions for developers to set up, run, and test "The Enigma Engine" application.

## Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.8+**
- **Node.js 18+** & **npm**
- **MySQL Server** (Running locally or remotely)
- **Git**

## 1. Clone the Repository

```bash
git clone <repository-url>
cd the-enigma-engine
```

## 2. Database Setup

1.  **Start MySQL Server**: Ensure your MySQL server is running.
2.  **Create Database**:
    ```sql
    CREATE DATABASE enigma_db;
    ```
3.  **Configure Environment**:
    - Navigate to `backend/`.
    - Copy `.env.example` to `.env`.
    - Update `.env` with your database credentials:
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=yourpassword
      DB_NAME=enigma_db
      DB_PORT=3306
      ```
4.  **Import Schema**:
    - The application automatically initializes the schema if tables don't exist, but you can manually import it:
      ```bash
      mysql -u root -p enigma_engine_db < backend/schema.sql
      ```

## 3. Backend Setup (Flask)

1.  **Navigate to Backend**:
    ```bash
    cd backend
    ```
2.  **Create Virtual Environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the Server**:
    ```bash
    python app.py
    ```
    - The backend will start at `http://localhost:5000`.
    - Health Check: `http://localhost:5000/api/health`

## 4. Frontend Setup (Next.js)

1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    - The frontend will start at `http://localhost:3000`.

## 5. Testing the Application

### Using the UI
1.  Open `http://localhost:3000` in your browser.
2.  **Register**: Create a new account (`/register`).
3.  **Login**: Sign in with your credentials (`/login`).
4.  **Browse Rooms**: View available escape rooms (`/rooms`).
5.  **Book a Room**: Select a room and book a slot (`/book/[id]`).
6.  **Dashboard**: View your bookings and pay invoices (`/dashboard`).
7.  **Admin**: Log in as an Admin (role='Admin') to view analytics (`/admin`).

### Using API (cURL / Postman)
- Refer to `backend/requests.md` for a comprehensive list of cURL commands to test all API endpoints directly.

## Project Structure

```
the-enigma-engine/
├── backend/                # Flask Backend
│   ├── app.py              # Entry point
│   ├── db.py               # Database connection
│   ├── schema.sql          # Database schema
│   ├── routes/             # API Blueprints (Auth, Rooms, etc.)
│   └── ...
├── frontend/               # Next.js Frontend
│   ├── app/                # App Router Pages
│   ├── utils/              # API Client
│   └── ...
├── database.md             # Database concepts documentation
├── db_queries.md           # List of SQL queries used
├── requests.md             # API testing commands
└── ...
```

## Troubleshooting

- **Database Connection Error**: Double-check your `.env` file in `backend/` and ensure MySQL is running.
- **CORS Error**: The backend is configured to allow CORS. Ensure you are accessing the frontend via `localhost:3000` and backend via `localhost:5000`.
