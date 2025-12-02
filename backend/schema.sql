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
    durationMinutes INT
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
