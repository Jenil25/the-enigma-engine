# The Enigma Engine - Final Project Report

**Course:** Database Management Systems  
**Team Members:** Helly Niteshbhai Diyora, Jenil Pankajkumar Mahyavanshi  
**Submission Date:** December 2025

---

## Executive Summary

The Enigma Engine is a comprehensive Escape Room Management System designed to streamline the entire lifecycle of escape room operations. The system handles customer bookings, real-time game session management, puzzle and hint tracking, automated invoicing with payment processing, staff management, and business analytics. Built using modern web technologies with a robust relational database backend, the system serves three distinct user roles: Customers (who book and participate in escape room experiences), Game Masters (who facilitate live sessions), and Administrators (who manage rooms, puzzles, staff, and view performance metrics).

---

## Table of Contents

1. [Installation and Setup Guide](#1-installation-and-setup-guide)
2. [Technical Specifications](#2-technical-specifications)
3. [Conceptual Design (UML Diagram)](#3-conceptual-design-uml-diagram)
4. [Logical Database Schema Design](#4-logical-database-schema-design)
5. [User Flow and Interaction](#5-user-flow-and-interaction)
6. [Lessons Learned](#6-lessons-learned)
7. [Future Work](#7-future-work)

---

## 1. Installation and Setup Guide

### 1.1 Prerequisites

Before setting up The Enigma Engine, ensure your system has the following software installed:

#### Required Software
- **Node.js** (v18.0 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download from python.org](https://www.python.org/downloads/)
- **MySQL Server** (v8.0 or higher) - [Download from mysql.com](https://dev.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js) - Package manager for JavaScript
- **pip** (comes with Python) - Package manager for Python
- **Git** - [Download from git-scm.com](https://git-scm.com/downloads/)

#### Optional (for containerized deployment)
- **Docker** (v20.10 or higher) - [Download from docker.com](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v2.0 or higher) - Usually included with Docker Desktop

### 1.2 Installation Directory Structure

```
/Users/[username]/Projects/the-enigma-engine/
├── backend/                 # Flask API server
│   ├── routes/              # API route handlers
│   ├── venv/                # Python virtual environment (created during setup)
│   ├── app.py               # Main Flask application
│   ├── db.py                # Database connection handler
│   ├── schema.sql           # Database schema definition
│   ├── seed_data.sql        # Sample data for testing
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (created during setup)
├── frontend/                # Next.js web application
│   ├── app/                 # Next.js app router pages
│   ├── utils/               # API utility functions
│   ├── node_modules/        # Node.js dependencies (created during setup)
│   ├── package.json         # Node.js dependencies list
│   └── next.config.js       # Next.js configuration
├── README.md                # Project overview
├── USEME.md                 # Quick start guide
└── docker-compose.yml       # Docker orchestration file
```

### 1.3 Step-by-Step Installation

#### Method 1: Manual Installation (Recommended for Development)

**Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd the-enigma-engine
```

**Step 2: Database Setup**

1. Start MySQL server:
   ```bash
   # On macOS (Homebrew)
   brew services start mysql
   
   # On Linux
   sudo systemctl start mysql
   
   # On Windows
   # Start MySQL from Services or MySQL Workbench
   ```

2. Create the database:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE enigma_engine_db;
   EXIT;
   ```

3. Import the schema:
   ```bash
   mysql -u root -p enigma_engine_db < backend/schema.sql
   ```

4. (Optional) Load sample data:
   ```bash
   mysql -u root -p enigma_engine_db < backend/seed_data.sql
   ```

**Step 3: Backend Setup**

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create Python virtual environment:
   ```bash
   python3 -m venv venv
   
   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   **Python Libraries Required:**
   - `flask==3.1.2` - Web framework
   - `flask-cors==6.0.1` - Cross-Origin Resource Sharing
   - `pymysql` - MySQL database connector
   - `python-dotenv==1.2.1` - Environment variable management
   - `werkzeug==3.1.4` - WSGI utility library (password hashing)
   - `cryptography` - Secure password storage
   - `pydantic==2.12.5` - Data validation

4. Configure environment variables:
   ```bash
   # Create .env file in backend directory
   cat > .env << EOF
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=enigma_engine_db
   DB_PORT=3306
   FLASK_ENV=development
   EOF
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```
   
   The backend API will be available at `http://localhost:5000`
   
   Test with: `curl http://localhost:5000/api/health`

**Step 4: Frontend Setup**

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

   **Key Node.js Libraries:**
   - `next@^14.0.0` - React framework
   - `react@^18.0.0` - UI library
   - `react-dom@^18.0.0` - React DOM renderer
   - `typescript@^5.0.0` - Type safety
   - `tailwindcss@^3.4.0` - CSS framework
   - `eslint` - Code linting

3. Configure API endpoint (if needed):
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

#### Method 2: Docker Deployment (Recommended for Production)

1. Ensure Docker and Docker Compose are installed

2. Build and run containers:
   ```bash
   docker-compose up --build
   ```

3. The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

### 1.4 Verification

After successful installation, verify the setup:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

2. **Frontend Access:**
   - Open browser to `http://localhost:3000`
   - You should see the landing page

3. **Database Connection:**
   ```bash
   mysql -u root -p enigma_engine_db -e "SHOW TABLES;"
   ```
   Should display all the created tables

### 1.5 Troubleshooting

**Issue: Database connection failed**
- Verify MySQL is running
- Check credentials in `backend/.env`
- Ensure database `enigma_engine_db` exists

**Issue: Frontend cannot connect to backend**
- Verify backend is running on port 5000
- Check CORS is enabled in Flask (already configured)
- Verify `NEXT_PUBLIC_API_URL` in frontend

**Issue: Port already in use**
```bash
# Change ports in respective config files
# Backend: app.py line: app.run(port=5001)
# Frontend: package.json - add "dev": "next dev -p 3001"
```

### 1.6 Default Credentials

After loading seed data, use these credentials to test:

- **Admin:**
  - Email: `admin@enigma.com`
  - Password: `password123`

- **Game Master:**
  - Email: `gm@enigma.com`
  - Password: `password123`

- **Customer:**
  - Email: `john@doe.com`
  - Password: `password123`

---

## 2. Technical Specifications

### 2.1 System Architecture

The Enigma Engine follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                  (Next.js Frontend)                      │
│  - User Interface                                        │
│  - Client-side routing                                   │
│  - API integration                                       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────┴───────────────────────────────────┐
│                   Application Layer                      │
│                   (Flask Backend)                        │
│  - Business logic                                        │
│  - Request handling                                      │
│  - Authentication                                        │
│  - API endpoints                                         │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL Queries
┌─────────────────────┴───────────────────────────────────┐
│                     Data Layer                           │
│                   (MySQL Database)                       │
│  - Data persistence                                      │
│  - Stored procedures                                     │
│  - Triggers and views                                    │
│  - Data integrity                                        │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.x | React framework with server-side rendering, routing, and optimization |
| **React** | 18.3.x | Component-based UI library |
| **TypeScript** | 5.6.x | Static typing for JavaScript, improved code quality |
| **Tailwind CSS** | 3.4.x | Utility-first CSS framework for styling |
| **PostCSS** | 8.x | CSS transformation and optimization |

**Key Frontend Features:**
- App Router architecture (Next.js 13+ feature)
- Server-side and client-side rendering
- Automatic code splitting
- TypeScript for type safety
- Responsive design with Tailwind CSS
- API client utilities for backend communication

#### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Flask** | 3.1.2 | Lightweight Python web framework |
| **Python** | 3.8+ | Server-side programming language |
| **PyMySQL** | 1.1.x | MySQL database connector for Python |
| **Flask-CORS** | 6.0.1 | Handle Cross-Origin Resource Sharing |
| **Werkzeug** | 3.1.4 | WSGI utilities, password hashing |
| **python-dotenv** | 1.2.1 | Environment variable management |
| **Pydantic** | 2.12.5 | Data validation and parsing |

**Key Backend Features:**
- RESTful API design
- Blueprint-based route organization
- Secure password hashing (PBKDF2/Scrypt)
- Database connection pooling
- Error handling and logging
- CORS enabled for frontend communication

#### Database Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **MySQL** | 8.0+ | Relational database management system |
| **MySQL Workbench** | 8.0+ | Database design and administration tool |

**Database Features:**
- Relational data model
- Foreign key constraints for referential integrity
- Stored procedures for complex operations
- Functions for calculations
- Triggers for automated actions
- Views for simplified queries
- Indexes for performance optimization

### 2.3 Development Tools

- **Version Control:** Git
- **Package Managers:** npm (Node.js), pip (Python)
- **Code Editor:** Visual Studio Code (recommended)
- **API Testing:** cURL, Postman, Thunder Client
- **Database Tools:** MySQL Workbench, phpMyAdmin (optional)
- **Containerization:** Docker, Docker Compose

### 2.4 Project Architecture and Design Patterns

#### Backend Architecture

**Blueprint Pattern:**
The Flask application uses Blueprints to organize routes by functionality:

```python
# backend/app.py
from flask import Flask
from routes.auth import auth_bp
from routes.rooms import rooms_bp
from routes.bookings import bookings_bp
from routes.sessions import sessions_bp
from routes.analytics import analytics_bp
from routes.staff import staff_bp

app = Flask(__name__)

# Register blueprints with URL prefixes
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(rooms_bp, url_prefix='/api/rooms')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(staff_bp, url_prefix='/api/staff')
```

**Route Modules:**
- `auth.py` - User registration and authentication
- `rooms.py` - Room and puzzle CRUD operations
- `bookings.py` - Booking creation and management
- `sessions.py` - Game session tracking and hint logging
- `analytics.py` - Business intelligence and reporting
- `staff.py` - Staff member management

#### Frontend Architecture

**Next.js App Router Structure:**
```
frontend/app/
├── page.tsx                 # Landing page (/)
├── register/
│   └── page.tsx             # Registration page (/register)
├── login/
│   └── page.tsx             # Login page (/login)
├── rooms/
│   ├── page.tsx             # Room listing (/rooms)
│   └── [id]/
│       └── page.tsx         # Room details (/rooms/[id])
├── dashboard/
│   └── page.tsx             # Customer dashboard (/dashboard)
├── admin/
│   ├── page.tsx             # Admin dashboard (/admin)
│   ├── rooms/
│   ├── staff/
│   └── analytics/
└── gamemaster/
    └── page.tsx             # Game master interface (/gamemaster)
```

**API Client Pattern:**
```typescript
// frontend/utils/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  register: (data) => fetch(`${API_URL}/api/register`, {...}),
  login: (data) => fetch(`${API_URL}/api/login`, {...}),
  getRooms: () => fetch(`${API_URL}/api/rooms`, {...}),
  // ... more API methods
};
```

### 2.5 Security Measures

1. **Password Security:**
   - PBKDF2/Scrypt hashing using Werkzeug
   - Salt added automatically
   - No plaintext passwords stored

2. **SQL Injection Prevention:**
   - Parameterized queries throughout
   - PyMySQL escaped parameters
   - Stored procedures for complex operations

3. **CORS Configuration:**
   - Controlled origin access
   - Credentials support when needed

4. **Environment Variables:**
   - Sensitive data in `.env` files
   - `.gitignore` prevents credential commits

### 2.6 Performance Optimizations

1. **Database:**
   - Indexed foreign keys
   - Efficient JOIN operations
   - Views for frequently-accessed data
   - Connection pooling

2. **Frontend:**
   - Code splitting and lazy loading
   - Image optimization
   - Server-side rendering where beneficial
   - Static generation for public pages

3. **Backend:**
   - Lightweight Flask framework
   - Efficient database queries
   - JSON response caching potential

### 2.7 Deployment Configuration

**Docker Compose Setup:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - DB_NAME=enigma_engine_db
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: enigma_engine_db
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## 3. Conceptual Design (UML Diagram)

### 3.1 Entity-Relationship Model

The Enigma Engine database follows a comprehensive relational model designed to capture all aspects of escape room operations.

#### UML Diagram - Complete Database Schema

![Database UML Diagram](file:///Users/jenilmahyavanshi/.gemini/antigravity/brain/08e045b6-0f3c-4c11-b739-76a0a0320553/uploaded_image_1764892928620.png)

### 3.2 Entity Descriptions

#### Core Entities

**Users (Parent Entity)**
- Central entity for all user types
- Contains authentication credentials
- Uses single-table inheritance pattern
- **Attributes:**
  - `userID` (PK): Unique identifier
  - `email` (AK): Unique email address
  - `hashedPassword`: Secure password hash
  - `firstName`, `lastName`: User name
  - `phone`: Contact number

**Customers (Subtype of Users)**
- Specialization for customer-specific data
- Tracks loyalty program
- **Attributes:**
  - `userID` (PK, FK): References Users
  - `dateOfBirth`: Customer birthday
  - `loyaltyPoints`: Reward points balance

**Staff (Subtype of Users)**
- Specialization for employee data
- Distinguishes between Admin and Game Master roles
- **Attributes:**
  - `userID` (PK, FK): References Users
  - `role`: ENUM('Admin', 'GameMaster')
  - `hireDate`: Employment start date
  - `payRate`: Hourly or salary rate

#### Room and Puzzle Entities

**Rooms**
- Represents escape room experiences
- **Attributes:**
  - `roomID` (PK): Unique identifier
  - `name`: Room name
  - `description`: Detailed description
  - `difficultyLevel`: Scale 1-10
  - `maxPlayers`: Capacity
  - `durationMinutes`: Time limit
  - `pricePerPerson`: Pricing

**Puzzles (Parent Entity)**
- Individual challenges within rooms
- Uses class hierarchy for Physical vs Digital
- **Attributes:**
  - `puzzleID` (PK): Unique identifier
  - `roomID` (FK): Parent room
  - `name`: Puzzle name
  - `description`: Puzzle details
  - `puzzleType`: ENUM('Physical', 'Digital')

**Physical_Puzzles (Subtype)**
- Manual/Mechanical puzzles
- **Attributes:**
  - `puzzleID` (PK, FK): References Puzzles
  - `resetInstructions`: How to reset
  - `requiredPropID`: Physical prop reference

**Digital_Puzzles (Subtype)**
- Computer-based puzzles
- **Attributes:**
  - `puzzleID` (PK, FK): References Puzzles
  - `softwareEndpoint`: Digital interface URL
  - `correctAnswerHash`: Hashed solution

**Puzzle_Hints**
- Progressive hints for puzzles
- Uses composite key after schema update
- **Attributes:**
  - `puzzleID` (PK, FK): Parent puzzle
  - `hintSequence` (PK): Hint order (1, 2, 3, ...)
  - `hintText`: Hint content
  - `timeToTriggerSeconds`: When to offer hint

**Room_Availability**
- Operating hours by day of week
- Composite key prevents duplicates
- **Attributes:**
  - `roomID` (PK, FK): Parent room
  - `dayOfWeek` (PK): ENUM for weekday
  - `openTime` (PK): Starting time
  - `closeTime`: Closing time

#### Booking and Transaction Entities

**Bookings**
- Customer reservations
- Central entity for transactions
- **Attributes:**
  - `bookingID` (PK): Unique identifier
  - `customerID` (FK): Who booked
  - `roomID` (FK): Which room
  - `scheduledTime`: When
  - `numPlayers`: Team size
  - `status`: ENUM('Confirmed', 'Cancelled', 'Completed')

**Invoices**
- Financial billing records
- One per booking
- **Attributes:**
  - `invoiceID` (PK): Unique identifier
  - `bookingID` (FK): Associated booking
  - `amountDue`: Total cost
  - `dateIssued`: Creation timestamp
  - `status`: ENUM('Pending', 'Paid', 'Overdue')

**Payments**
- Payment transactions
- Can have multiple partial payments
- **Attributes:**
  - `paymentID` (PK): Unique identifier
  - `invoiceID` (FK): Which invoice
  - `amountPaid`: Payment amount
  - `paymentMethod`: Credit Card, PayPal, etc.
  - `transactionTimestamp`: When paid

#### Game Session Entities

**Game_Sessions**
- Actual gameplay tracking
- Links bookings to outcomes
- **Attributes:**
  - `sessionID` (PK): Unique identifier
  - `bookingID` (FK): Associated booking
  - `gameMasterID` (FK): Facilitating staff
  - `startTime`: Session start
  - `endTime`: Session end
  - `success`: BOOLEAN - completion status

**Session_Hints_Used**
- Tracks hints given during gameplay
- Updated to use composite key reference
- **Attributes:**
  - `sessionHintID` (PK): Unique identifier
  - `sessionID` (FK): Which session
  - `puzzleID` (FK): Which puzzle
  - `hintSequence` (FK): Which hint (with puzzleID)
  - `timestampHintGiven`: When provided

**Reviews**
- Customer feedback
- One per booking (composite key approach)
- **Attributes:**
  - `bookingID` (PK, FK): Associated booking
  - `rating`: Scale 1-5
  - `commentText`: Written feedback

### 3.3 Relationship Types

| Relationship | Type | Cardinality | Description |
|--------------|------|-------------|-------------|
| Users → Customers | ISA/Subtype | 1:1 | User specialization for customers |
| Users → Staff | ISA/Subtype | 1:1 | User specialization for staff |
| Rooms → Puzzles | 1:N | 1 to many | Room contains multiple puzzles |
| Puzzles → Physical_Puzzles | ISA/Subtype | 1:1 | Puzzle type specialization |
| Puzzles → Digital_Puzzles | ISA/Subtype | 1:1 | Puzzle type specialization |
| Puzzles → Puzzle_Hints | 1:N | 1 to many | Puzzle has multiple hints |
| Rooms → Room_Availability | 1:N | 1 to many | Room has multiple time slots |
| Customers → Bookings | 1:N | 1 to many | Customer makes many bookings |
| Rooms → Bookings | 1:N | 1 to many | Room has many bookings |
| Bookings → Invoices | 1:1 | 1 to 1 | Each booking has one invoice |
| Invoices → Payments | 1:N | 1 to many | Invoice can have multiple payments |
| Bookings → Game_Sessions | 1:1 | 1 to 1 | Booking results in one session |
| Staff → Game_Sessions | 1:N | 1 to many | Game Master runs multiple sessions |
| Game_Sessions → Session_Hints_Used | 1:N | 1 to many | Session logs multiple hints |
| Puzzle_Hints → Session_Hints_Used | 1:N | 1 to many | Hint used in multiple sessions |
| Bookings → Reviews | 1:1 | 1 to 1 | Booking gets one review |

### 3.4 Design Decisions

**Inheritance Strategy:**
- Used table-per-subtype for Users (separate Customer and Staff tables)
- Used table-per-subtype for Puzzles (separate Physical and Digital tables)
- Allows type-specific attributes without NULL values

**Composite Keys:**
- `Puzzle_Hints`: (puzzleID, hintSequence) - Natural ordering
- `Room_Availability`: (roomID, dayOfWeek, openTime) - Prevents scheduling conflicts
- `Reviews`: (bookingID) - One review per booking constraint

**Referential Integrity:**
- All foreign keys with CASCADE DELETE where appropriate
- Deleting a room cascades to puzzles, hints, availability
- Deleting a user cascades to customer/staff records, bookings
- Maintains data consistency automatically

---

## 4. Logical Database Schema Design

### 4.1 Relational Schema

The complete database schema consists of 18 tables organized into logical groups.

#### User Management Schema

```sql
-- Parent table for all users
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashedPassword VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phone VARCHAR(20)
);

-- Customer specialization
CREATE TABLE Customers (
    userID INT PRIMARY KEY,
    dateOfBirth DATE,
    loyaltyPoints INT DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Staff specialization
CREATE TABLE Staff (
    userID INT PRIMARY KEY,
    role ENUM('Admin', 'GameMaster') NOT NULL,
    hireDate DATE,
    payRate DECIMAL(10, 2),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);
```

#### Room and Puzzle Schema

```sql
-- Escape rooms
CREATE TABLE Rooms (
    roomID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficultyLevel INT CHECK (difficultyLevel BETWEEN 1 AND 10),
    maxPlayers INT,
    durationMinutes INT,
    pricePerPerson DECIMAL(10, 2) DEFAULT 25.00
);

-- Room operating hours
CREATE TABLE Room_Availability (
    roomID INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 
                   'Friday', 'Saturday', 'Sunday') NOT NULL,
    openTime TIME NOT NULL,
    closeTime TIME NOT NULL,
    PRIMARY KEY (roomID, dayOfWeek, openTime),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Puzzles (parent for physical/digital)
CREATE TABLE Puzzles (
    puzzleID INT AUTO_INCREMENT PRIMARY KEY,
    roomID INT,
    name VARCHAR(100),
    description TEXT,
    puzzleType ENUM('Physical', 'Digital') NOT NULL,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Physical puzzle specialization
CREATE TABLE Physical_Puzzles (
    puzzleID INT PRIMARY KEY,
    resetInstructions TEXT,
    requiredPropID INT,
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Digital puzzle specialization
CREATE TABLE Digital_Puzzles (
    puzzleID INT PRIMARY KEY,
    softwareEndpoint VARCHAR(255),
    correctAnswerHash VARCHAR(255),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Puzzle hints with composite key
CREATE TABLE Puzzle_Hints (
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    hintText TEXT,
    timeToTriggerSeconds INT,
    PRIMARY KEY (puzzleID, hintSequence),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);
```

#### Booking and Transaction Schema

```sql
-- Customer bookings
CREATE TABLE Bookings (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT,
    roomID INT,
    scheduledTime DATETIME,
    numPlayers INT,
    status ENUM('Confirmed', 'Cancelled', 'Completed') DEFAULT 'Confirmed',
    FOREIGN KEY (customerID) REFERENCES Customers(userID),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID)
);

-- Invoices for bookings
CREATE TABLE Invoices (
    invoiceID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    amountDue DECIMAL(10, 2),
    dateIssued DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);

-- Payment transactions
CREATE TABLE Payments (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    invoiceID INT,
    amountPaid DECIMAL(10, 2),
    paymentMethod VARCHAR(50),
    transactionTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceID) REFERENCES Invoices(invoiceID)
);
```

#### Game Session Schema

```sql
-- Game sessions
CREATE TABLE Game_Sessions (
    sessionID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    gameMasterID INT,
    startTime DATETIME,
    endTime DATETIME,
    success BOOLEAN,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID),
    FOREIGN KEY (gameMasterID) REFERENCES Staff(userID)
);

-- Hints used during sessions
CREATE TABLE Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT NOT NULL,
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    timestampHintGiven DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID) ON DELETE CASCADE,
    FOREIGN KEY (puzzleID, hintSequence) 
        REFERENCES Puzzle_Hints(puzzleID, hintSequence) ON DELETE CASCADE
);

-- Customer reviews (one per booking)
CREATE TABLE Reviews (
    bookingID INT PRIMARY KEY,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID) ON DELETE CASCADE
);
```

### 4.2 Database Stored Procedures

#### User Registration Procedure

```sql
DELIMITER //
CREATE PROCEDURE sp_RegisterUser(
    IN p_email VARCHAR(255),
    IN p_hashedPassword VARCHAR(255),
    IN p_firstName VARCHAR(100),
    IN p_lastName VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_role VARCHAR(20), -- 'Customer', 'Admin', 'GameMaster'
    OUT p_userID INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Insert into Users table
    INSERT INTO Users (email, hashedPassword, firstName, lastName, phone)
    VALUES (p_email, p_hashedPassword, p_firstName, p_lastName, p_phone);
    
    SET p_userID = LAST_INSERT_ID();

    -- Insert into appropriate child table
    IF p_role = 'Customer' THEN
        INSERT INTO Customers (userID, loyaltyPoints) 
        VALUES (p_userID, 0);
    ELSEIF p_role IN ('Admin', 'GameMaster') THEN
        INSERT INTO Staff (userID, role, hireDate, payRate) 
        VALUES (p_userID, p_role, CURDATE(), 0.00);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Role';
    END IF;

    COMMIT;
END //
DELIMITER ;
```

**Purpose:** Handles user registration with role-based record creation, ensuring data integrity across Users and child tables (Customers/Staff).

#### Booking Creation Procedure

```sql
DELIMITER //
CREATE PROCEDURE sp_CreateBooking(
    IN p_customerID INT,
    IN p_roomID INT,
    IN p_scheduledTime DATETIME,
    IN p_numPlayers INT,
    OUT p_bookingID INT,
    OUT p_invoiceID INT
)
BEGIN
    DECLARE v_count INT;
    DECLARE v_totalAmount DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Check if room is available at scheduled time
    SELECT COUNT(*) INTO v_count 
    FROM Bookings 
    WHERE roomID = p_roomID 
      AND scheduledTime = p_scheduledTime 
      AND status != 'Cancelled';
      
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Room not available at this time';
    END IF;

    -- Create booking
    INSERT INTO Bookings (customerID, roomID, scheduledTime, numPlayers, status)
    VALUES (p_customerID, p_roomID, p_scheduledTime, p_numPlayers, 'Confirmed');
    
    SET p_bookingID = LAST_INSERT_ID();

    -- Calculate total amount
    SET v_totalAmount = f_CalculateBookingTotal(p_roomID, p_numPlayers);

    -- Create invoice
    INSERT INTO Invoices (bookingID, amountDue, status)
    VALUES (p_bookingID, v_totalAmount, 'Pending');
    
    SET p_invoiceID = LAST_INSERT_ID();

    COMMIT;
END //
DELIMITER ;
```

**Purpose:** Creates a booking with automatic availability checking and invoice generation, ensuring no double-booking and correct billing.

### 4.3 Database Functions

```sql
DELIMITER //
CREATE FUNCTION f_CalculateBookingTotal(
    p_roomID INT, 
    p_numPlayers INT
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_price DECIMAL(10,2);
    
    SELECT pricePerPerson INTO v_price 
    FROM Rooms 
    WHERE roomID = p_roomID;
    
    IF v_price IS NULL THEN
        SET v_price = 25.00; -- Default price
    END IF;
    
    RETURN v_price * p_numPlayers;
END //
DELIMITER ;
```

**Purpose:** Calculates total booking cost based on room price and number of players.

### 4.4 Database Triggers

```sql
DELIMITER //
CREATE TRIGGER tr_AfterPayment
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    -- Update invoice status to 'Paid'
    UPDATE Invoices 
    SET status = 'Paid' 
    WHERE invoiceID = NEW.invoiceID;

    -- Add loyalty points (10 points per payment)
    UPDATE Customers c
    JOIN Bookings b ON c.userID = b.customerID
    JOIN Invoices i ON b.bookingID = i.bookingID
    SET c.loyaltyPoints = c.loyaltyPoints + 10
    WHERE i.invoiceID = NEW.invoiceID;
END //
DELIMITER ;
```

**Purpose:** Automatically updates invoice status and rewards customer loyalty points when payment is received.

### 4.5 Database Views

```sql
CREATE OR REPLACE VIEW v_CustomerBookings AS
SELECT 
    b.bookingID,
    b.customerID,
    r.name AS roomName,
    b.scheduledTime,
    b.status AS bookingStatus,
    i.invoiceID,
    i.amountDue,
    i.status AS invoiceStatus
FROM Bookings b
JOIN Rooms r ON b.roomID = r.roomID
LEFT JOIN Invoices i ON b.bookingID = i.bookingID
ORDER BY b.scheduledTime DESC;
```

**Purpose:** Simplifies querying customer booking information with related room and invoice details.

### 4.6 Indexes

```sql
-- Primary keys are automatically indexed
-- Additional indexes for performance:

CREATE INDEX idx_bookings_customer ON Bookings(customerID);
CREATE INDEX idx_bookings_room ON Bookings(roomID);
CREATE INDEX idx_bookings_scheduled ON Bookings(scheduledTime);
CREATE INDEX idx_invoices_status ON Invoices(status);
CREATE INDEX idx_sessions_gm ON Game_Sessions(gameMasterID);
```

**Purpose:** Improves query performance for frequently accessed columns and foreign keys.

### 4.7 Schema Normalization

The database is designed to **3rd Normal Form (3NF)**:

**1NF:** All tables have atomic values (no multi-valued attributes)

**2NF:** No partial dependencies (all non-key attributes fully depend on the primary key)

**3NF:** No transitive dependencies (no non-key attribute depends on another non-key attribute)

**Example of normalization:**
- Booking total is calculated via function, not stored
- User type information separated into Customers and Staff tables
- Puzzle type-specific attributes in separate Physical_Puzzles and Digital_Puzzles tables

### 4.8 Referential Integrity Constraints

All foreign keys enforce referential integrity:

- **CASCADE DELETE:** When a parent record is deleted, child records are automatically deleted (e.g., deleting a room deletes its puzzles, hints, and availability)
- **RESTRICT:** Prevents deletion if child records exist (default for some relationships)
- **NOT NULL:** Critical foreign keys marked as required
- **CHECK constraints:** Validate data ranges (e.g., rating 1-5, difficulty 1-10)

---

## 5. User Flow and Interaction

*For complete user flow documentation with flowcharts and sequence diagrams, please refer to the dedicated document:*

**[user_flow.md](file:///Users/jenilmahyavanshi/Documents/Masters/Fall%202025/DBMS/Project/the-enigma-engine/user_flow.md)**

### 5.1 Summary of User Interactions

The Enigma Engine supports three distinct user roles, each with specific interaction patterns:

#### Customer Interactions
1. **Registration/Login** → POST `/api/register`, POST `/api/login`
2. **Browse Rooms** → GET `/api/rooms`
3. **View Room Details** → GET `/api/rooms/:id`
4. **Create Booking** → POST `/api/bookings` (calls `sp_CreateBooking` stored procedure)
5. **View My Bookings** → GET `/api/bookings/customer/:id` (uses `v_CustomerBookings` view)
6. **Pay Invoice** → POST `/api/bookings/invoices/:id/pay` (triggers `tr_AfterPayment`)
7. **Leave Review** → POST `/api/reviews`

#### Game Master Interactions
1. **Login** → POST `/api/login`
2. **View Schedule** → GET `/api/bookings/schedule`
3. **Start Session** → POST `/api/sessions`
4. **Give Hint** → POST `/api/sessions/:id/hint`
5. **End Session** → POST `/api/sessions/:id/end`

#### Admin Interactions
1. **Login** → POST `/api/login`
2. **Manage Rooms** → POST/PUT/DELETE `/api/rooms`
3. **Manage Puzzles** → POST/PUT `/api/rooms/:id/puzzles`
4. **Manage Staff** → GET/PUT/DELETE `/api/staff`
5. **View Analytics** → GET `/api/analytics/revenue`, GET `/api/analytics/performance`

### 5.2 Key API Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/register` | Register new user |
| | POST | `/api/login` | Authenticate user |
| **Rooms** | GET | `/api/rooms` | List all rooms |
| | GET | `/api/rooms/:id` | Get room details |
| | POST | `/api/rooms` | Create room (Admin) |
| | PUT | `/api/rooms/:id` | Update room (Admin) |
| | DELETE | `/api/rooms/:id` | Delete room (Admin) |
| **Bookings** | POST | `/api/bookings` | Create booking |
| | GET | `/api/bookings/customer/:id` | View customer bookings |
| | POST | `/api/bookings/invoices/:id/pay` | Pay invoice |
| **Sessions** | POST | `/api/sessions` | Start game session |
| | POST | `/api/sessions/:id/hint` | Give hint |
| | POST | `/api/sessions/:id/end` | End session |
| **Analytics** | GET | `/api/analytics/revenue` | Revenue report (Admin) |
| | GET | `/api/analytics/performance` | Performance stats (Admin) |

---

## 6. Lessons Learned

### 6.1 Technical Expertise Gained

#### Database Design and Implementation
- **Relational Database Modeling:** Gained deep understanding of entity-relationship modeling, normalization (1NF, 2NF, 3NF), and denormalization trade-offs.
- **SQL Proficiency:** Mastered complex SQL including:
  - Multi-table JOINs (up to 5 tables in analytics queries)
  - Stored procedures for business logic encapsulation
  - Functions for calculations
  - Triggers for automatic data updates
  - Views for query simplification
  - Composite primary keys for natural relationships
- **Database Migrations:** Learned to handle schema evolution safely, including:
  - Migrating from single-column primary keys to composite keys
  - Preserving data during structural changes
  - Creating rollback procedures for safety

#### Backend Development
- **REST API Design:** Learned best practices for RESTful endpoints, including:
  - Resource-based URL structuring
  - Proper HTTP method usage (GET, POST, PUT, DELETE)
  - Status code conventions
  - Error handling and validation
- **Flask Framework:** Gained expertise in:
  - Blueprint organization for modular code
  - Database connection management
  - CORS configuration for frontend communication
  - Environment variable management
- **Security Implementation:** Implemented:
  - Password hashing with Werkzeug (PBKDF2/Scrypt)
  - SQL injection prevention via parameterized queries
  - Input validation and sanitization

#### Frontend Development
- **Next.js App Router:** Learned modern React patterns:
  - Server and client components
  - File-based routing
  - API integration with fetch
  - TypeScript for type safety
- **State Management:** Managed application state across multiple pages without external libraries
- **Responsive Design:** Used Tailwind CSS for mobile-first responsive layouts

#### DevOps and Deployment
- **Docker Containerization:** Created Dockerfiles and docker-compose configurations for:
  - Isolated development environments
  - Consistent deployments
  - Multi-container orchestration
- **Environment Configuration:** Managed different configurations for development, testing, and production
- **Git Version Control:** Practiced collaborative development with branching, merging, and conflict resolution

### 6.2 Project Management Insights

#### Time Management
- **Initial Underestimation:** We initially underestimated the time required for:
  - Designing and implementing stored procedures (took 3x longer than expected)
  - Frontend-backend integration and debugging CORS issues
  - Writing comprehensive seed data for testing
  
- **What Worked:**
  - Breaking the project into clear milestones (database → backend → frontend → integration)
  - Using task tracking (GitHub Projects) to monitor progress
  - Daily standups (even for a 2-person team) to stay aligned
  
- **What Could Improve:**
  - Allocating more buffer time for unforeseen issues (we hit several blocker bugs that cost us days)
  - Starting frontend development earlier in parallel with backend, rather than sequentially

#### Division of Labor
- **Effective Collaboration:**
  - Clear role division: One member focused on database/backend, the other on frontend initially
  - Switched roles mid-project to gain full-stack understanding
  - Pair programming for complex stored procedures helped catch bugs early
  
- **Communication:**
  - Using descriptive Git commit messages saved time when debugging
  - Documenting API contracts prevented integration issues
  - Code reviews (even informally) improved code quality

### 6.3 Data Domain Insights

#### Escape Room Business Logic
- **Booking Challenges:** Real-world business rules are complex:
  - Need to prevent double-booking while allowing cancellations
  - Invoice generation must account for variable pricing (per player, room type)
  - Loyalty points need retroactive application when policy changes
  
- **Operational Realities:**
  - Game Masters need quick access to hint history to avoid repetition
  - Different difficulty levels significantly affect success rates (should inform marketing)
  - Peak times (Friday/Saturday evenings) require dynamic pricing (future feature)

#### Data Integrity Challenges
- **Composite Key Trade-offs:**
  - Switching from auto-increment IDs to composite keys for `Puzzle_Hints` required:
    - Significant schema refactoring
    - Data migration with sequence number generation
    - Updates to all referencing tables (`Session_Hints_Used`)
  - **Benefit:** More natural data model (hints naturally ordered per puzzle)
  - **Cost:** More complex foreign key relationships, harder to reference in code

- **Cascade Deletion Risks:**
  - Aggressive CASCADE DELETE rules can accidentally delete important data
  - Example: Deleting a user deletes all their bookings and reviews
  - **Solution:** Implemented soft delete for users (mark as inactive) rather than hard delete

### 6.4 Alternative Design Approaches Considered

#### 1. NoSQL vs SQL
- **Considered:** Using MongoDB for flexibility
- **Decision:** Stuck with MySQL
- **Reasoning:**
  - Escape room data is highly relational (bookings link to customers, rooms, invoices, sessions)
  - ACID properties critical for financial transactions
  - Referential integrity constraints prevent orphaned records
- **Trade-off:** Less flexibility for rapidly changing schema, but much stronger data guarantees

#### 2. Microservices vs Monolith
- **Considered:** Splitting into separate services (Auth, Bookings, Analytics)
- **Decision:** Kept monolithic backend
- **Reasoning:**
  - Project scale doesn't justify microservice complexity
  - Shared database makes transactions simpler
  - Deployment is easier for small team
- **Trade-off:** Harder to scale individual components, but faster development

#### 3. Session Management
- **Considered:** Using JWT tokens for session state
- **Decision:** Stateless approach with session data in requests
- **Reasoning:**
  - Simpler implementation without token refresh logic
  - Frontend stores user info in localStorage
  - Backend remains stateless
- **Trade-off:** Less secure (no automatic expiration), but acceptable for project scope

#### 4. Real-time Updates
- **Considered:** WebSockets for live game session updates
- **Decision:** Polling for updates
- **Reasoning:**
  - Escape room sessions are ~60 minutes, so polling every 10 seconds is acceptable
  - Simpler implementation without WebSocket infrastructure
- **Trade-off:** Less real-time feel, but much simpler codebase

### 6.5 Challenges Overcome

#### 1. Foreign Key Constraint Violations During Migration
- **Problem:** Migrating `Puzzle_Hints` from single PK to composite PK broke `Session_Hints_Used` references
- **Solution:** 
  - Created migration script that:
    1. Backed up both tables
    2. Dropped foreign key constraints
    3. Restructured tables
    4. Recreated constraints with new composite key
  - Required careful sequencing and transaction management

#### 2. CORS Issues Between Frontend and Backend
- **Problem:** Browser blocking requests from localhost:3000 to localhost:5000
- **Solution:** 
  - Configured Flask-CORS with proper origin settings
  - Added credentials support for cookies
  - Configured Next.js proxy for API calls (alternative approach)

#### 3. Password Hashing Compatibility
- **Problem:** Werkzeug password hashes weren't validating correctly
- **Solution:**
  - Discovered we were using different hashing algorithms in seed data vs registration
  - Standardized on `generate_password_hash()` with default settings
  - Re-generated all seed data passwords

#### 4. Date/Time Handling Across Stack
- **Problem:** JavaScript Date objects, Python datetime, and MySQL DATETIME had timezone mismatches
- **Solution:**
  - Standardized on UTC everywhere
  - Frontend converts to local time only for display
  - Backend stores everything in UTC
  - MySQL configured for UTC timezone

### 6.6 Key Takeaways

1. **Design First, Code Second:** Time spent on database schema design prevented weeks of refactoring later

2. **Documentation Pays Off:** Writing API documentation as we built endpoints made integration much smoother

3. **Test Early, Test Often:** Manual testing after each feature prevented compound bugs

4. **Simple is Better:** Rejected several "cool" features (WebSockets, GraphQL) in favor of proven, simple approaches

5. **Database is the Foundation:** A well-designed database makes everything else easier; a poor database makes everything harder

6. **Migrations Are Risky:** Schema changes on existing data require extreme care—always backup first!

7. **User Experience Matters:** Even with a perfect database, if the UI is confusing, the project fails

---

## 7. Future Work

### 7.1 Planned Database Uses

#### 1. Advanced Analytics and Business Intelligence

**Revenue Optimization:**
- **Dynamic Pricing Model:** Implement surge pricing during peak hours (Friday/Saturday evenings)
  - Track booking patterns by time of day and day of week
  - Automatically adjust `pricePerPerson` based on demand
  - SQL: `SELECT dayOfWeek, HOUR(scheduledTime), COUNT(*) FROM Bookings GROUP BY ...`

- **Room Profitability Analysis:**
  - Calculate profit margins per room accounting for staffing costs
  - Identify underperforming rooms for improvement or retirement
  - SQL: Use `Game_Sessions` success rates + `Invoices` revenue - staff `payRate` * duration

**Customer Lifetime Value (CLV):**
- Track total spending per customer over time
- Calculate average CLV to inform marketing budgets
- SQL: `SELECT customerID, SUM(amountPaid), COUNT(DISTINCT bookingID) FROM ...`

**Predictive Analytics:**
- **Success Prediction Model:** Use historical data to predict escape likelihood
  - Features: team size, difficulty level, hints used, time of day
  - Could warn Game Masters when teams need extra support
  - Requires exporting data to Python/R for machine learning

- **Churn Prediction:** Identify customers unlikely to return
  - Look at booking frequency, last booking date, loyalty points used
  - Trigger re-engagement campaigns

#### 2. Operational Improvements

**Inventory Management:**
- Link puzzles to required props/equipment
- Track prop usage and maintenance schedules
- Alert when props need replacement before game sessions

**Staff Scheduling:**
- Automatically match Game Master availability to bookings
- Optimize schedules to minimize overtime costs
- Track staff performance metrics (sessions run, success rates)

**Maintenance Tracking:**
- Log puzzle malfunctions during sessions
- Schedule preventive maintenance based on usage statistics
- Track downtime and impact on revenue

### 7.2 Potential Added Functionality

#### Short-Term Enhancements (1-3 months)

**1. Advanced Booking Features**
- **Waitlist System:**
  - Allow customers to join waitlist for sold-out slots
  - Automatically notify when slots become available (cancellations)
  - Table: `Waitlist(waitlistID, customerID, roomID, preferredDate)`

- **Group & Corporate Booking:**
  - Handle large groups (>20 people) across multiple rooms
  - Special pricing for corporate team-building events
  - Track group performance across multiple sessions

- **Recurring Bookings:**
  - Allow regular customers to book weekly/monthly slots
  - Automatic loyalty point discounts for recurring bookings

**2. Enhanced Review System**
- **Multi-Attribute Ratings:**
  - Separate ratings for puzzles, atmosphere, Game Master, value
  - Puzzle-specific difficulty feedback
  - Table: `DetailedReviews(reviewID, puzzleDifficulty, atmosphereRating, ...)`

- **Photo Reviews:**
  - Allow customers to upload photos (stored as URLs/file paths)
  - Display best photos on room pages
  - Table: `ReviewPhotos(photoID, reviewID, photoURL, uploadDate)`

**3. Loyalty Program Expansion**
- **Tiered Membership:**
  - Bronze/Silver/Gold tiers based on lifetime bookings
  - Tier-specific perks (priority booking, free hints, merchandise)
  - Table: `LoyaltyTiers(tierID, minPoints, benefits)`

- **Referral System:**
  - Track customer referrals
  - Award bonus points for successful referrals
  - Table: `Referrals(referralID, referrerID, referredID, bonusPoints)`

- **Points Redemption:**
  - Allow points to be redeemed for discounts or free games
  - Table: `PointsRedemptions(redemptionID, customerID, pointsUsed, bookingID)`

#### Medium-Term Enhancements (3-6 months)

**4. Real-Time Session Dashboard**
- **Live Session Monitoring:**
  - WebSocket-based real-time updates for Game Masters
  - Show which puzzles teams are currently on
  - Display time remaining, hints used, team morale indicators

- **Multi-Session Management:**
  - Run multiple rooms simultaneously
  - Dashboard showing all active sessions
  - Cross-room analytics (which room finishing fastest today?)

**5. Mobile Application**
- **React Native App for Customers:**
  - Mobile-optimized booking flow
  - Push notifications for booking reminders
  - In-app payment integration (Apple Pay, Google Pay)
  - QR code check-in at venue

- **Game Master Tablet Interface:**
  - Tablet-optimized session dashboard
  - Quick hint buttons
  - Walkie-talkie integration for communication

**6. Gamification and Social Features**
- **Leaderboards:**
  - Global and room-specific leaderboards
  - Fastest completion times
  - Highest success rates
  - Table: `Leaderboards(entryID, teamName, roomID, completionTime, rank)`

- **Achievements & Badges:**
  - Award achievements for milestones (first escape, fastest time, no hints used)
  - Display badges on profile
  - Table: `Achievements(achievementID, name, description, iconURL)`
  - Table: `CustomerAchievements(customerID, achievementID, dateEarned)`

- **Social Sharing:**
  - Share achievements on social media
  - Integration with Facebook, Twitter, Instagram APIs
  - "I just escaped the Haunted Mansion in 52 minutes!"

**7. Inventory and Prop Management**
- **Prop Tracking:**
  - Database of all physical props
  - Track which props are in which puzzles
  - Maintenance schedules and replacement costs
  - Tables: `Props(propID, name, purchaseDate, cost)`, `PropMaintenance(maintenanceID, propID, date, notes)`

- **Automated Reordering:**
  - Trigger alerts when props need replacement
  - Integration with purchasing workflows

#### Long-Term Enhancements (6-12 months)

**8. AI-Powered Hint System**
- **Adaptive Difficulty:**
  - AI analyzes team progress in real-time
  - Automatically suggests hints to Game Master when team is stuck
  - Learns which puzzles are hardest for which demographics

- **Natural Language Processing:**
  - Allow teams to ask questions verbally or via tablet
  - AI interprets questions and suggests appropriate hints
  - Reduces Game Master workload

**9. Virtual/Hybrid Escape Rooms**
- **Remote Participation:**
  - Live video streaming for remote players
  - On-site players collaborate with remote teammates
  - Requires video conferencing integration

- **Fully Virtual Rooms:**
  - Browser-based digital escape rooms
  - AI Game Masters for scalability
  - Tables: `VirtualRooms`, `VirtualPuzzles`, `VirtualSessions`

**10. Franchise Management System**
- **Multi-Location Support:**
  - Extend database to support multiple locations
  - Table: `Locations(locationID, city, address, phone)`
  - Foreign key `locationID` added to `Rooms`, `Staff`, `Room_Availability`

- **Centralized Analytics:**
  - Cross-location performance comparison
  - Best practices sharing between locations
  - Inventory management across locations

**11. Augmented Reality (AR) Integration**
- **AR Puzzle Elements:**
  - Use tablets/phones to reveal hidden clues
  - Overlay digital elements on physical rooms
  - Track AR interactions in database

- **AR Wayfinding:**
  - Help players navigate larger facilities
  - Point to next puzzle location via AR arrows

**12. Advanced Reporting and Dashboards**
- **Custom Report Builder:**
  - Allow admins to create custom SQL queries via UI
  - Save and schedule automated reports
  - Export to PDF/Excel

- **Interactive Visualizations:**
  - Charts and graphs for revenue, bookings, success rates
  - Heat maps showing popular time slots
  - JavaScript visualization libraries (D3.js, Chart.js)

### 7.3 Technical Debt and Improvements

**Database Optimizations:**
- **Query Optimization:**
  - Identify slow queries with MySQL slow query log
  - Add indexes on frequently filtered columns
  - Consider materialized views for complex analytics

- **Database Replication:**
  - Set up primary-replica configuration for read scalability
  - Replicas handle analytics queries, primary handles writes

- **Archival Strategy:**
  - Move old bookings/sessions to archive tables after 2 years
  - Keeps main tables smaller and faster
  - Table: `Bookings_Archive`, `Game_Sessions_Archive`

**Backend Improvements:**
- **Authentication & Authorization:**
  - Implement JWT tokens for stateless auth
  - Add refresh token mechanism
  - Role-based access control (RBAC) middleware

- **API Versioning:**
  - Version API endpoints (`/api/v1/rooms`, `/api/v2/rooms`)
  - Allows breaking changes without disrupting existing clients

- **Caching Layer:**
  - Redis for caching frequent queries (room list, availability)
  - Reduce database load for read-heavy operations

- **Rate Limiting:**
  - Prevent API abuse
  - Limit requests per user per minute

**Frontend Enhancements:**
- **Progressive Web App (PWA):**
  - Offline support for viewing past bookings
  - Add to home screen capability
  - Push notifications for booking reminders

- **Accessibility (a11y):**
  - WCAG 2.1 AA compliance
  - Screen reader support
  - Keyboard navigation

- **Performance Optimization:**
  - Image lazy loading
  - Code splitting for faster initial load
  - Service worker for caching

**Testing Infrastructure:**
- **Automated Testing:**
  - Unit tests for backend routes (pytest)
  - Integration tests for database procedures
  - End-to-end tests for critical user flows (Playwright)

- **CI/CD Pipeline:**
  - Automated testing on every commit
  - Automated deployment to staging environment
  - GitHub Actions or GitLab CI

### 7.4 Scalability Considerations

As the business grows, the following changes may be necessary:

**Horizontal Scaling:**
- **Load Balancing:**
  - Multiple backend instances behind load balancer
  - Session affinity or stateless architecture

- **Database Sharding:**
  - Shard by `locationID` for multi-location franchise
  - Separate databases per geographic region

**Performance Monitoring:**
- **Application Performance Monitoring (APM):**
  - New Relic, Datadog, or Sentry for error tracking
  - Monitor API response times, database query performance

- **Logging and Analytics:**
  - Centralized logging (ELK stack: Elasticsearch, Logstash, Kibana)
  - Track user behavior for UX improvements

### 7.5 Justification for Future Work

All proposed future work is justified by:

1. **Business Value:** Each feature directly addresses a business need (increased revenue, operational efficiency, customer satisfaction)

2. **Technical Feasibility:** All enhancements can be implemented with existing tech stack or well-established libraries

3. **Scalability:** Features designed to grow with the business without requiring complete rewrites

4. **Data-Driven:** Analytics capabilities enable evidence-based decision making

5. **Competitive Advantage:** Advanced features (AI hints, AR integration) differentiate from competitors

The comprehensive database foundation we've built provides a solid platform for all these future enhancements. The normalized schema, stored procedures, and triggers ensure data integrity while remaining flexible for new features.

---

## Conclusion

The Enigma Engine represents a comprehensive escape room management system built on solid database principles and modern web technologies. Through this project, we gained invaluable experience in full-stack development, database design, and real-world business logic implementation. The system successfully handles the complete escape room lifecycle from booking to analytics, providing value to customers, staff, and administrators.

While we faced challenges (particularly with schema migrations and frontend-backend integration), each obstacle taught us important lessons about software engineering, planning, and problem-solving. The extensive future work roadmap demonstrates both the project's strong foundation and the many exciting directions it could grow.

We are proud of what we've built and grateful for the learning opportunity this project provided.

---

**Appendices:**
- [A] Complete API Documentation: `backend/requests.md`
- [B] Database Schema SQL: `backend/schema.sql`
- [C] Seed Data SQL: `backend/seed_data.sql`
- [D] User Flow Diagrams: `user_flow.md`
- [E] Deployment Guide: `deploy.md`
- [F] Quick Start Guide: `USEME.md`
