# Database Operations Explained

This document provides a comprehensive overview of all database operations in the Enigma Engine application, including standard CRUD operations, stored procedures, functions, triggers, and views.

---

## Table of Contents
1. [Stored Procedures](#stored-procedures)
2. [Functions](#functions)
3. [Triggers](#triggers)
4. [Views](#views)
5. [CRUD Operations by Entity](#crud-operations-by-entity)
6. [Analytics Queries](#analytics-queries)

---

## Stored Procedures

### 1. `sp_RegisterUser`
**Purpose**: Handles user registration with automatic role-based table insertion.

**Parameters**:
- `IN p_email` - User's email address
- `IN p_hashedPassword` - Hashed password
- `IN p_firstName` - First name
- `IN p_lastName` - Last name
- `IN p_phone` - Phone number (optional)
- `IN p_role` - Role type ('Customer', 'Admin', 'GameMaster')
- `OUT p_userID` - Returns the newly created user ID

**What it does**:
1. Starts a transaction
2. Inserts user into `Users` table
3. Based on role, inserts into either `Customers` or `Staff` table
4. Returns the new user ID
5. Rolls back if any error occurs

**When called**: When a new user registers via `/api/auth/register`

**Error Handling**: 
- Validates role (must be 'Customer', 'Admin', or 'GameMaster')
- Signals custom error for invalid roles
- Automatic rollback on any database error

---

### 2. `sp_CreateBooking`
**Purpose**: Creates a booking with automatic availability checking and invoice generation.

**Parameters**:
- `IN p_customerID` - Customer making the booking
- `IN p_roomID` - Room being booked
- `IN p_scheduledTime` - DateTime of the booking
- `IN p_numPlayers` - Number of players
- `OUT p_bookingID` - Returns the booking ID
- `OUT p_invoiceID` - Returns the invoice ID

**What it does**:
1. Checks room availability at the specified time
2. If available, creates a booking record
3. Calculates total price using `f_CalculateBookingTotal` function
4. Creates an invoice with the calculated amount
5. Returns both booking and invoice IDs

**When called**: When a customer creates a booking via `/api/bookings/`

**Error Handling**:
- Signals error if room is already booked
- Automatic rollback on any failure
- Atomic transaction ensures booking and invoice are created together

---

## Functions

### 1. `f_CalculateBookingTotal`
**Purpose**: Calculates the total cost of a booking based on room pricing and player count.

**Parameters**:
- `p_roomID` - Room ID
- `p_numPlayers` - Number of players

**Returns**: `DECIMAL(10,2)` - Total booking amount

**What it does**:
1. Fetches `pricePerPerson` from the `Rooms` table for the specified room
2. Multiplies price by number of players
3. Returns $25.00 per player as default if room price not found

**When called**: Automatically called by `sp_CreateBooking` during booking creation

**Properties**:
- `DETERMINISTIC` - Always returns same result for same inputs
- `READS SQL DATA` - Only reads, doesn't modify data

---

## Triggers

### 1. `tr_AfterPayment`
**Type**: `AFTER INSERT` on `Payments` table

**Purpose**: Automatically updates invoice status and awards loyalty points when payment is received.

**When triggered**: After a new payment record is inserted into the `Payments` table

**What it does**:
1. Updates the associated `Invoice` status to 'Paid'
2. Awards 10 loyalty points to the customer who made the booking
3. Uses JOIN operations to link Payment → Invoice → Booking → Customer

**Called by**: Payment insertion via `/api/bookings/invoices/{invoice_id}/pay`

**Benefits**:
- Ensures data consistency
- Eliminates need for manual updates in application code
- Automatically handles loyalty program logic

---

## Views

### 1. `v_CustomerBookings`
**Purpose**: Simplifies retrieval of customer booking history with all relevant details.

**Columns**:
- `bookingID` - Unique booking identifier
- `customerID` - Customer who made the booking
- `roomName` - Name of the escape room
- `scheduledTime` - When the booking is scheduled
- `bookingStatus` - Status ('Confirmed', 'Cancelled', 'Completed')
- `amountDue` - Invoice amount
- `invoiceStatus` - Payment status ('Pending', 'Paid', 'Overdue')

**What it does**:
- Joins `Bookings`, `Rooms`, and `Invoices` tables
- Orders by scheduled time (most recent first)
- Provides a unified view of booking information

**When queried**: When fetching customer booking history via `/api/bookings/customer/{customer_id}`

**Benefits**:
- Simplifies complex JOIN queries
- Consistent data format across application
- Better performance for repeated queries

---

## CRUD Operations by Entity

### Users & Authentication

#### Create (C)
- **Operation**: User Registration
- **Endpoint**: `POST /api/auth/register`
- **Procedure**: `sp_RegisterUser`
- **Tables**: `Users`, `Customers` or `Staff`
- **Details**: Creates user record and role-specific record in single transaction

#### Read (R)
- **Operation**: User Login
- **Endpoint**: `POST /api/auth/login`
- **Query**: 
  ```sql
  SELECT userID, hashedPassword, firstName, lastName FROM Users WHERE email = ?
  SELECT role FROM Staff WHERE userID = ?
  ```
- **Details**: Fetches user and determines role

---

### Rooms

#### Create (C)
- **Endpoint**: `POST /api/rooms/`
- **Query**: `INSERT INTO Rooms (...) VALUES (...)`
- **Access**: Admin only

#### Read (R)
- **All Rooms**: `GET /api/rooms/`
  - Query: `SELECT * FROM Rooms`
- **Single Room**: `GET /api/rooms/{room_id}`
  - Query: `SELECT * FROM Rooms WHERE roomID = ?`
  - Also fetches: `SELECT * FROM Puzzles WHERE roomID = ?`

#### Update (U)
- **Endpoint**: `PUT /api/rooms/{room_id}`
- **Query**: `UPDATE Rooms SET ... WHERE roomID = ?`
- **Access**: Admin only

#### Delete (D)
- **Endpoint**: `DELETE /api/rooms/{room_id}`
- **Query**: `DELETE FROM Rooms WHERE roomID = ?`
- **Cascade**: Automatically deletes related puzzles due to `ON DELETE CASCADE`

---

### Puzzles

#### Create (C)
- **Endpoint**: `POST /api/rooms/{room_id}/puzzles`
- **Tables**: `Puzzles` + `Physical_Puzzles` or `Digital_Puzzles`
- **Queries**:
  1. `INSERT INTO Puzzles (...)`
  2. `INSERT INTO Physical_Puzzles (...)` OR `INSERT INTO Digital_Puzzles (...)`
- **Details**: Handles parent-child table insertion based on puzzle type

---

### Bookings

#### Create (C)
- **Endpoint**: `POST /api/bookings/`
- **Procedure**: `sp_CreateBooking`
- **Tables**: `Bookings`, `Invoices`
- **Details**: Creates booking and invoice atomically with availability check

#### Read (R)
- **Endpoint**: `GET /api/bookings/customer/{customer_id}`
- **View**: `v_CustomerBookings`
- **Query**: `SELECT * FROM v_CustomerBookings WHERE customerID = ?`

---

### Payments & Invoices

#### Create (C) - Payment
- **Endpoint**: `POST /api/bookings/invoices/{invoice_id}/pay`
- **Query**: `INSERT INTO Payments (invoiceID, amountPaid, paymentMethod) VALUES (...)`
- **Trigger**: `tr_AfterPayment` automatically fires
- **Side Effects**: 
  - Invoice status updated to 'Paid'
  - Customer receives 10 loyalty points

---

### Game Sessions

#### Create (C) - Start Session
- **Endpoint**: `POST /api/sessions/`
- **Query**: `INSERT INTO Game_Sessions (bookingID, gameMasterID, startTime, success) VALUES (...)`

#### Update (U) - End Session
- **Endpoint**: `POST /api/sessions/{session_id}/end`
- **Query**: `UPDATE Game_Sessions SET endTime = NOW(), success = ? WHERE sessionID = ?`

#### Create (C) - Log Hint Usage
- **Endpoint**: `POST /api/sessions/{session_id}/hint`
- **Query**: `INSERT INTO Session_Hints_Used (sessionID, hintID, timestampHintGiven) VALUES (...)`

---

## Analytics Queries

### 1. Revenue Report
- **Endpoint**: `GET /api/analytics/revenue`
- **Query**:
  ```sql
  SELECT r.name as roomName, 
         DATE_FORMAT(p.transactionTimestamp, '%Y-%m') as month, 
         SUM(p.amountPaid) as totalRevenue
  FROM Payments p
  JOIN Invoices i ON p.invoiceID = i.invoiceID
  JOIN Bookings b ON i.bookingID = b.bookingID
  JOIN Rooms r ON b.roomID = r.roomID
  GROUP BY r.name, month
  ORDER BY month DESC, totalRevenue DESC
  ```
- **Purpose**: Monthly revenue breakdown by room

### 2. Performance Statistics
- **Endpoint**: `GET /api/analytics/performance`
- **Query**:
  ```sql
  SELECT b.numPlayers, 
         COUNT(*) as totalSessions, 
         SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) as successfulSessions,
         (SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as successRate
  FROM Game_Sessions gs
  JOIN Bookings b ON gs.bookingID = b.bookingID
  GROUP BY b.numPlayers
  ORDER BY b.numPlayers
  ```
- **Purpose**: Success rate analysis by team size

---

## Transaction Flow Examples

### Example 1: User Registration Flow
1. User submits registration form
2. Backend calls `sp_RegisterUser`
3. Procedure inserts into `Users` table
4. Procedure inserts into `Customers` or `Staff` table based on role
5. Returns userID
6. Transaction commits (or rolls back on error)

### Example 2: Booking & Payment Flow
1. Customer creates booking → `sp_CreateBooking` executes
   - Checks availability
   - Creates `Bookings` record
   - Calls `f_CalculateBookingTotal` for pricing
   - Creates `Invoices` record
   - Returns bookingID and invoiceID
2. Customer makes payment → `INSERT INTO Payments`
3. `tr_AfterPayment` trigger fires automatically
   - Updates invoice status to 'Paid'
   - Awards loyalty points to customer
4. All changes committed

---

## Error Handling Patterns

### Application-Level
- Try-catch blocks in all route handlers
- Automatic rollback on database errors
- Cursor cleanup in `finally` blocks

### Database-Level
- Stored procedures use `DECLARE EXIT HANDLER FOR SQLEXCEPTION`
- Custom error signals (e.g., `SIGNAL SQLSTATE '45000'`)
- Foreign key constraints prevent orphaned records
- CHECK constraints validate data ranges

---

## Summary

The Enigma Engine uses a hybrid approach:
- **Complex business logic**: Handled by stored procedures and triggers at the database level
- **Simple CRUD operations**: Handled by direct SQL queries in application code
- **Data aggregation**: Simplified with views for frequently accessed combinations
- **Data consistency**: Ensured through transactions, constraints, and triggers

This architecture provides:
- ✅ **Modularization**: Logic distributed between app and database layers
- ✅ **Data Integrity**: Automatic validation and cascade operations
- ✅ **Performance**: Reduced network roundtrips with procedures
- ✅ **Maintainability**: Clear separation of concerns
