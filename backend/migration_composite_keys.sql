-- =============================================
-- MIGRATION SCRIPT: Composite Keys for Puzzle_Hints, Reviews, Room_Availability
-- WARNING: This will modify existing tables and may cause data loss
-- IMPORTANT: Backup your data before running this script!
-- =============================================
-- Usage: mysql -u root -p enigma_engine_db < backend/migration_composite_keys.sql
-- =============================================

USE enigma_engine_db;

-- =============================================
-- STEP 1: Create backup tables
-- =============================================

CREATE TABLE IF NOT EXISTS Puzzle_Hints_Backup AS SELECT * FROM Puzzle_Hints;
CREATE TABLE IF NOT EXISTS Session_Hints_Used_Backup AS SELECT * FROM Session_Hints_Used;
CREATE TABLE IF NOT EXISTS Reviews_Backup AS SELECT * FROM Reviews;
CREATE TABLE IF NOT EXISTS Room_Availability_Backup AS SELECT * FROM Room_Availability;

SELECT 'Backup tables created successfully' AS Status;

-- =============================================
-- STEP 2: Drop foreign key constraints
-- =============================================

-- Drop Session_Hints_Used foreign key to Puzzle_Hints
ALTER TABLE Session_Hints_Used DROP FOREIGN KEY Session_Hints_Used_ibfk_2;

SELECT 'Foreign key constraints dropped' AS Status;

-- =============================================
-- STEP 3: Modify Puzzle_Hints table structure
-- =============================================

-- Drop and recreate Puzzle_Hints with composite key
DROP TABLE Puzzle_Hints;

CREATE TABLE Puzzle_Hints (
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    hintText TEXT,
    timeToTriggerSeconds INT,
    PRIMARY KEY (puzzleID, hintSequence),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Migrate data from backup with automatic sequence numbering
SET @row_num = 0;
SET @current_puzzle = 0;

INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds)
SELECT 
    puzzleID,
    (@row_num := IF(@current_puzzle = puzzleID, @row_num + 1, 1)) AS hintSequence,
    hintText,
    timeToTriggerSeconds
FROM (
    SELECT * FROM Puzzle_Hints_Backup ORDER BY puzzleID, hintID
) AS sorted_hints,
(SELECT @row_num := 0, @current_puzzle := 0) AS vars
ORDER BY puzzleID, hintID;

SELECT 'Puzzle_Hints table migrated successfully' AS Status;

-- =============================================
-- STEP 4: Modify Session_Hints_Used table structure
-- =============================================

-- Drop and recreate Session_Hints_Used
DROP TABLE Session_Hints_Used;

CREATE TABLE Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT NOT NULL,
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    timestampHintGiven DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID) ON DELETE CASCADE,
    FOREIGN KEY (puzzleID, hintSequence) REFERENCES Puzzle_Hints(puzzleID, hintSequence) ON DELETE CASCADE
);

-- Note: Cannot migrate old Session_Hints_Used data because we don't know which puzzle each hint belonged to
-- If you need to preserve this data, you must manually map hintID to (puzzleID, hintSequence)

SELECT 'Session_Hints_Used table recreated successfully' AS Status;

-- =============================================
-- STEP 5: Modify Reviews table structure
-- =============================================

-- Drop and recreate Reviews with bookingID as primary key
DROP TABLE Reviews;

CREATE TABLE Reviews (
    bookingID INT PRIMARY KEY,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID) ON DELETE CASCADE
);

-- Migrate data from backup (keep only first review per booking if duplicates exist)
INSERT IGNORE INTO Reviews (bookingID, rating, commentText)
SELECT bookingID, rating, commentText
FROM Reviews_Backup;

SELECT 'Reviews table migrated successfully' AS Status;

-- =============================================
-- STEP 6: Modify Room_Availability table structure
-- =============================================

-- Drop and recreate Room_Availability with composite key
DROP TABLE Room_Availability;

CREATE TABLE Room_Availability (
    roomID INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    openTime TIME NOT NULL,
    closeTime TIME NOT NULL,
    PRIMARY KEY (roomID, dayOfWeek, openTime),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Migrate data from backup (automatically handles duplicate elimination via composite key)
INSERT IGNORE INTO Room_Availability (roomID, dayOfWeek, openTime, closeTime)
SELECT roomID, dayOfWeek, openTime, closeTime
FROM Room_Availability_Backup;

SELECT 'Room_Availability table migrated successfully' AS Status;

-- =============================================
-- STEP 7: Verify migrations
-- =============================================

SELECT 'Verifying data migration...' AS Status;

SELECT 
    (SELECT COUNT(*) FROM Puzzle_Hints) AS puzzle_hints_count,
    (SELECT COUNT(*) FROM Reviews) AS reviews_count,
    (SELECT COUNT(*) FROM Room_Availability) AS room_availability_count,
    (SELECT COUNT(*) FROM Session_Hints_Used) AS session_hints_used_count;

-- =============================================
-- STEP 8: Clean up (OPTIONAL - commented out for safety)
-- =============================================

-- Uncomment the following lines to drop backup tables after verifying migration
-- WARNING: This will permanently delete backup data!

-- DROP TABLE IF EXISTS Puzzle_Hints_Backup;
-- DROP TABLE IF EXISTS Session_Hints_Used_Backup;
-- DROP TABLE IF EXISTS Reviews_Backup;
-- DROP TABLE IF EXISTS Room_Availability_Backup;

-- SELECT 'Backup tables dropped' AS Status;

-- =============================================
-- MIGRATION COMPLETED
-- =============================================

SELECT 'Migration completed successfully!' AS Status;
SELECT 'IMPORTANT: Backup tables have been preserved. Review data carefully before dropping them.' AS Warning;

-- =============================================
-- ROLLBACK INSTRUCTIONS
-- =============================================
-- If you need to rollback this migration, run the following:
--
-- DROP TABLE Puzzle_Hints;
-- DROP TABLE Session_Hints_Used;
-- DROP TABLE Reviews;
-- DROP TABLE Room_Availability;
--
-- RENAME TABLE Puzzle_Hints_Backup TO Puzzle_Hints;
-- RENAME TABLE Session_Hints_Used_Backup TO Session_Hints_Used;
-- RENAME TABLE Reviews_Backup TO Reviews;
-- RENAME TABLE Room_Availability_Backup TO Room_Availability;
-- =============================================
