# Database Queries - The Enigma Engine

This document lists all the SQL queries used in the application backend, categorized by feature.

## Authentication

### Register User
- **Insert Base User**:
  ```sql
  INSERT INTO Users (email, hashedPassword, firstName, lastName, phone) VALUES (%s, %s, %s, %s, %s)
  ```
- **Insert Customer Role**:
  ```sql
  INSERT INTO Customers (userID, dateOfBirth, loyaltyPoints) VALUES (%s, NULL, 0)
  ```
- **Insert Staff Role**:
  ```sql
  INSERT INTO Staff (userID, role, hireDate, payRate) VALUES (%s, %s, CURDATE(), 0.00)
  ```

### Login
- **Get User by Email**:
  ```sql
  SELECT userID, hashedPassword, firstName, lastName FROM Users WHERE email = %s
  ```
- **Get Staff Role**:
  ```sql
  SELECT role FROM Staff WHERE userID = %s
  ```

## Room Management

- **Get All Rooms**:
  ```sql
  SELECT * FROM Rooms
  ```
- **Get Single Room**:
  ```sql
  SELECT * FROM Rooms WHERE roomID = %s
  ```
- **Get Puzzles for Room**:
  ```sql
  SELECT * FROM Puzzles WHERE roomID = %s
  ```
- **Create Room**:
  ```sql
  INSERT INTO Rooms (name, description, difficultyLevel, maxPlayers, durationMinutes) VALUES (%s, %s, %s, %s, %s)
  ```
- **Update Room**:
  ```sql
  UPDATE Rooms 
  SET name=%s, description=%s, difficultyLevel=%s, maxPlayers=%s, durationMinutes=%s 
  WHERE roomID=%s
  ```
- **Delete Room**:
  ```sql
  DELETE FROM Rooms WHERE roomID = %s
  ```

## Puzzle Management

- **Create Puzzle (Parent)**:
  ```sql
  INSERT INTO Puzzles (roomID, name, description, puzzleType) VALUES (%s, %s, %s, %s)
  ```
- **Create Physical Puzzle**:
  ```sql
  INSERT INTO Physical_Puzzles (puzzleID, resetInstructions, requiredPropID) VALUES (%s, %s, %s)
  ```
- **Create Digital Puzzle**:
  ```sql
  INSERT INTO Digital_Puzzles (puzzleID, softwareEndpoint, correctAnswerHash) VALUES (%s, %s, %s)
  ```

## Booking System

- **Check Availability**:
  ```sql
  SELECT * FROM Bookings WHERE roomID = %s AND scheduledTime = %s AND status != 'Cancelled'
  ```
- **Create Booking**:
  ```sql
  INSERT INTO Bookings (customerID, roomID, scheduledTime, numPlayers, status) VALUES (%s, %s, %s, %s, 'Confirmed')
  ```
- **Create Invoice**:
  ```sql
  INSERT INTO Invoices (bookingID, amountDue, status) VALUES (%s, %s, 'Pending')
  ```
- **Get Customer Bookings** (Complex Join):
  ```sql
  SELECT b.bookingID, r.name as roomName, b.scheduledTime, b.status, i.amountDue, i.status as invoiceStatus
  FROM Bookings b
  JOIN Rooms r ON b.roomID = r.roomID
  LEFT JOIN Invoices i ON b.bookingID = i.bookingID
  WHERE b.customerID = %s
  ORDER BY b.scheduledTime DESC
  ```

## Financials

- **Record Payment**:
  ```sql
  INSERT INTO Payments (invoiceID, amountPaid, paymentMethod) VALUES (%s, %s, %s)
  ```
- **Update Invoice Status**:
  ```sql
  UPDATE Invoices SET status = 'Paid' WHERE invoiceID = %s
  ```
- **Update Loyalty Points** (Trigger-like logic):
  ```sql
  UPDATE Customers c
  JOIN Bookings b ON c.userID = b.customerID
  JOIN Invoices i ON b.bookingID = i.bookingID
  SET c.loyaltyPoints = c.loyaltyPoints + 10
  WHERE i.invoiceID = %s
  ```

## Game Sessions

- **Start Session**:
  ```sql
  INSERT INTO Game_Sessions (bookingID, gameMasterID, startTime, success) VALUES (%s, %s, NOW(), NULL)
  ```
- **End Session**:
  ```sql
  UPDATE Game_Sessions SET endTime = NOW(), success = %s WHERE sessionID = %s
  ```
- **Log Hint**:
  ```sql
  INSERT INTO Session_Hints_Used (sessionID, hintID, timestampHintGiven) VALUES (%s, %s, NOW())
  ```

## Analytics

- **Monthly Revenue Report** (Aggregation):
  ```sql
  SELECT r.name as roomName, DATE_FORMAT(p.transactionTimestamp, '%Y-%m') as month, SUM(p.amountPaid) as totalRevenue
  FROM Payments p
  JOIN Invoices i ON p.invoiceID = i.invoiceID
  JOIN Bookings b ON i.bookingID = b.bookingID
  JOIN Rooms r ON b.roomID = r.roomID
  GROUP BY r.name, month
  ORDER BY month DESC, totalRevenue DESC
  ```
- **Performance Stats** (Success Rate vs Team Size):
  ```sql
  SELECT b.numPlayers, COUNT(*) as totalSessions, SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) as successfulSessions,
         (SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as successRate
  FROM Game_Sessions gs
  JOIN Bookings b ON gs.bookingID = b.bookingID
  GROUP BY b.numPlayers
  ORDER BY b.numPlayers
  ```
