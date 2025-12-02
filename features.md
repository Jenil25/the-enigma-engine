# Features - The Enigma Engine

## User Roles
- **Customer**: Can browse rooms, book rooms, pay invoices, and leave reviews.
- **Game Master**: Can view bookings, manage live game sessions, log hints, and mark session success/failure.
- **Admin**: Full CRUD on Rooms, Puzzles, Staff. View financial data and performance statistics.

## Core Features

### 1. User Management
- **Registration/Login**: Secure authentication for Customers and Staff.
- **Profile Management**: Update personal details.
- **Staff Roles**: Admin and Game Master distinctions.

### 2. Room & Puzzle Management (Admin)
- **Room CRUD**: Create, read, update, delete escape rooms (name, difficulty, duration, max players).
- **Puzzle CRUD**: Manage puzzles within rooms (Physical vs Digital).
- **Hint Management**: Add hints to puzzles with trigger times.
- **Availability**: Set open/close times for rooms.

### 3. Booking System (Customer)
- **Browse Rooms**: View available rooms with descriptions and difficulty.
- **Check Availability**: View open slots.
- **Book Room**: Reserve a slot for a specific number of players.
- **Invoicing**: Automatic invoice generation upon booking.

### 4. Financials
- **Payments**: Record payments for invoices (method, timestamp).
- **Invoice Status**: Track Pending vs Paid invoices.
- **Revenue Reports**: Admin view of monthly revenue by room.

### 5. Live Game Management (Game Master)
- **Session Tracking**: Start/End game sessions.
- **Hint Logging**: Record which hints were used and when.
- **Outcome**: Mark session as Success or Failure.

### 6. Reviews & Analytics
- **Customer Reviews**: Ratings and comments after a game.
- **Performance Stats**:
    - Average time-to-hint (identifying hard puzzles).
    - Success rate vs Team size.
    - Room popularity and profitability.

## Advanced Features (Bonus)
- **Complex SQL Queries**: Multi-table joins for deep analysis.
- **Data Modeling**: Predictive models (e.g., predicting success based on team size and difficulty).
- **Visualizations**: Charts for revenue and game stats.
