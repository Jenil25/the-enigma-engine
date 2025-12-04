-- Users Table (Parent)
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashedPassword VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phone VARCHAR(20)
);

-- Customers Table (Child of Users)
CREATE TABLE IF NOT EXISTS Customers (
    userID INT PRIMARY KEY,
    dateOfBirth DATE,
    loyaltyPoints INT DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Staff Table (Child of Users)
CREATE TABLE IF NOT EXISTS Staff (
    userID INT PRIMARY KEY,
    role ENUM('Admin', 'GameMaster') NOT NULL,
    hireDate DATE,
    payRate DECIMAL(10, 2),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS Rooms (
    roomID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficultyLevel INT CHECK (difficultyLevel BETWEEN 1 AND 10),
    maxPlayers INT,
    durationMinutes INT,
    pricePerPerson DECIMAL(10, 2) DEFAULT 25.00
);

-- Puzzles Table (Parent)
CREATE TABLE IF NOT EXISTS Puzzles (
    puzzleID INT AUTO_INCREMENT PRIMARY KEY,
    roomID INT,
    name VARCHAR(100),
    description TEXT,
    puzzleType ENUM('Physical', 'Digital') NOT NULL,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Physical Puzzles (Child of Puzzles)
CREATE TABLE IF NOT EXISTS Physical_Puzzles (
    puzzleID INT PRIMARY KEY,
    resetInstructions TEXT,
    requiredPropID INT, -- Placeholder for prop ID if we had a props table
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Digital Puzzles (Child of Puzzles)
CREATE TABLE IF NOT EXISTS Digital_Puzzles (
    puzzleID INT PRIMARY KEY,
    softwareEndpoint VARCHAR(255),
    correctAnswerHash VARCHAR(255),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Puzzle Hints
CREATE TABLE IF NOT EXISTS Puzzle_Hints (
    hintID INT AUTO_INCREMENT PRIMARY KEY,
    puzzleID INT,
    hintText TEXT,
    timeToTriggerSeconds INT,
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Room Availability
CREATE TABLE IF NOT EXISTS Room_Availability (
    availabilityID INT AUTO_INCREMENT PRIMARY KEY,
    roomID INT,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    openTime TIME,
    closeTime TIME,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE IF NOT EXISTS Bookings (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT,
    roomID INT,
    scheduledTime DATETIME,
    numPlayers INT,
    status ENUM('Confirmed', 'Cancelled', 'Completed') DEFAULT 'Confirmed',
    FOREIGN KEY (customerID) REFERENCES Customers(userID),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID)
);

-- Invoices
CREATE TABLE IF NOT EXISTS Invoices (
    invoiceID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    amountDue DECIMAL(10, 2),
    dateIssued DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);

-- Payments
CREATE TABLE IF NOT EXISTS Payments (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    invoiceID INT,
    amountPaid DECIMAL(10, 2),
    paymentMethod VARCHAR(50),
    transactionTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceID) REFERENCES Invoices(invoiceID)
);

-- Game Sessions
CREATE TABLE IF NOT EXISTS Game_Sessions (
    sessionID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    gameMasterID INT,
    startTime DATETIME,
    endTime DATETIME,
    success BOOLEAN,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID),
    FOREIGN KEY (gameMasterID) REFERENCES Staff(userID)
);

-- Session Hints Used
CREATE TABLE IF NOT EXISTS Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT,
    hintID INT,
    timestampHintGiven DATETIME,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID),
    FOREIGN KEY (hintID) REFERENCES Puzzle_Hints(hintID)
);

-- Reviews
CREATE TABLE IF NOT EXISTS Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);

-- =============================================
-- 1. STORED PROCEDURES
-- =============================================

-- Register User (Handles Users + Customers/Staff tables)
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

    -- Insert into Users
    INSERT INTO Users (email, hashedPassword, firstName, lastName, phone)
    VALUES (p_email, p_hashedPassword, p_firstName, p_lastName, p_phone);
    
    SET p_userID = LAST_INSERT_ID();

    -- Insert into Child Table
    IF p_role = 'Customer' THEN
        INSERT INTO Customers (userID, loyaltyPoints) VALUES (p_userID, 0);
    ELSEIF p_role IN ('Admin', 'GameMaster') THEN
        INSERT INTO Staff (userID, role, hireDate, payRate) 
        VALUES (p_userID, p_role, CURDATE(), 0.00);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Role';
    END IF;

    COMMIT;
END //
DELIMITER ;

-- Create Booking (Handles Availability, Booking, Invoice)
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

    -- 1. Check Availability
    SELECT COUNT(*) INTO v_count 
    FROM Bookings 
    WHERE roomID = p_roomID 
      AND scheduledTime = p_scheduledTime 
      AND status != 'Cancelled';
      
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not available';
    END IF;

    -- 2. Create Booking
    INSERT INTO Bookings (customerID, roomID, scheduledTime, numPlayers, status)
    VALUES (p_customerID, p_roomID, p_scheduledTime, p_numPlayers, 'Confirmed');
    
    SET p_bookingID = LAST_INSERT_ID();

    -- 3. Calculate Total Amount using Function
    SET v_totalAmount = f_CalculateBookingTotal(p_roomID, p_numPlayers);

    -- 4. Create Invoice
    INSERT INTO Invoices (bookingID, amountDue, status)
    VALUES (p_bookingID, v_totalAmount, 'Pending');
    
    SET p_invoiceID = LAST_INSERT_ID();

    COMMIT;
END //
DELIMITER ;

DELIMITER //
CREATE FUNCTION f_CalculateBookingTotal(p_roomID INT, p_numPlayers INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_price DECIMAL(10,2);
    
    SELECT pricePerPerson INTO v_price FROM Rooms WHERE roomID = p_roomID;
    
    IF v_price IS NULL THEN
        SET v_price = 25.00;
    END IF;
    
    RETURN v_price * p_numPlayers;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_AfterPayment
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    -- 1. Update Invoice Status to 'Paid'
    UPDATE Invoices 
    SET status = 'Paid' 
    WHERE invoiceID = NEW.invoiceID;

    -- 2. Add Loyalty Points (10 points per payment)
    UPDATE Customers c
    JOIN Bookings b ON c.userID = b.customerID
    JOIN Invoices i ON b.bookingID = i.bookingID
    SET c.loyaltyPoints = c.loyaltyPoints + 10
    WHERE i.invoiceID = NEW.invoiceID;
END //
DELIMITER ;


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

