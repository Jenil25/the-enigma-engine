# Migration Plan: Composite Key Implementation

## Overview
This document outlines all changes required to migrate from auto-increment primary keys to composite keys for:
- `Room_Availability` (remove `availabilityID`)
- `Reviews` (remove `reviewID`, use `bookingID` as PK)
- `Puzzle_Hints` (remove `hintID`, use composite key)

---

## 📋 Complete Change Checklist

### Database Changes
- [ ] Update `schema.sql` - Room_Availability table
- [ ] Update `schema.sql` - Reviews table
- [ ] Update `schema.sql` - Puzzle_Hints table
- [ ] Update `schema.sql` - Session_Hints_Used table
- [ ] Create migration SQL script
- [ ] Update `seed_data.sql` with new structure

### Backend Changes
- [ ] Update `routes/sessions.py` - log_hint endpoint
- [ ] Test all database operations

### Frontend Changes
- [ ] Update hint logging API calls (if any)
- [ ] Update TypeScript types (if any)

---

## 1. Database Schema Changes

### File: `backend/schema.sql`

#### Change 1: Room_Availability Table
**Location:** Lines 75-82

**Current:**
```sql
CREATE TABLE IF NOT EXISTS Room_Availability (
    availabilityID INT AUTO_INCREMENT PRIMARY KEY,
    roomID INT,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    openTime TIME,
    closeTime TIME,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);
```

**Replace with:**
```sql
CREATE TABLE IF NOT EXISTS Room_Availability (
    roomID INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    openTime TIME NOT NULL,
    closeTime TIME NOT NULL,
    PRIMARY KEY (roomID, dayOfWeek, openTime),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);
```

**Changes:**
- ❌ Removed `availabilityID INT AUTO_INCREMENT PRIMARY KEY`
- ✅ Added `NOT NULL` constraints to composite key columns
- ✅ Added `PRIMARY KEY (roomID, dayOfWeek, openTime)`

---

#### Change 2: Reviews Table
**Location:** Lines 139-145

**Current:**
```sql
CREATE TABLE IF NOT EXISTS Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);
```

**Replace with:**
```sql
CREATE TABLE IF NOT EXISTS Reviews (
    bookingID INT PRIMARY KEY,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID) ON DELETE CASCADE
);
```

**Changes:**
- ❌ Removed `reviewID INT AUTO_INCREMENT PRIMARY KEY`
- ✅ Changed `bookingID INT` to `bookingID INT PRIMARY KEY`
- ✅ Added `ON DELETE CASCADE` to foreign key
- ⚠️ **Constraint:** Only one review per booking is allowed

---

#### Change 3: Puzzle_Hints Table
**Location:** Lines 66-72

**Current:**
```sql
CREATE TABLE IF NOT EXISTS Puzzle_Hints (
    hintID INT AUTO_INCREMENT PRIMARY KEY,
    puzzleID INT,
    hintText TEXT,
    timeToTriggerSeconds INT,
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);
```

**Replace with:**
```sql
CREATE TABLE IF NOT EXISTS Puzzle_Hints (
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    hintText TEXT,
    timeToTriggerSeconds INT,
    PRIMARY KEY (puzzleID, hintSequence),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);
```

**Changes:**
- ❌ Removed `hintID INT AUTO_INCREMENT PRIMARY KEY`
- ✅ Added `hintSequence INT NOT NULL` (hint order: 1, 2, 3, etc.)
- ✅ Added `NOT NULL` constraint to `puzzleID`
- ✅ Added `PRIMARY KEY (puzzleID, hintSequence)`

---

#### Change 4: Session_Hints_Used Table (CRITICAL)
**Location:** Lines 129-136

**Current:**
```sql
CREATE TABLE IF NOT EXISTS Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT,
    hintID INT,
    timestampHintGiven DATETIME,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID),
    FOREIGN KEY (hintID) REFERENCES Puzzle_Hints(hintID)
);
```

**Replace with:**
```sql
CREATE TABLE IF NOT EXISTS Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT NOT NULL,
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    timestampHintGiven DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID) ON DELETE CASCADE,
    FOREIGN KEY (puzzleID, hintSequence) REFERENCES Puzzle_Hints(puzzleID, hintSequence) ON DELETE CASCADE
);
```

**Changes:**
- ❌ Removed `hintID INT` column
- ✅ Added `puzzleID INT NOT NULL` column
- ✅ Added `hintSequence INT NOT NULL` column
- ✅ Updated foreign key to `FOREIGN KEY (puzzleID, hintSequence) REFERENCES Puzzle_Hints(puzzleID, hintSequence)`
- ✅ Added `NOT NULL` constraints
- ✅ Added `ON DELETE CASCADE` to foreign keys
- ✅ Added `DEFAULT CURRENT_TIMESTAMP` to timestamp column

---

## 2. Migration SQL Script

Create a new file: `backend/migration_composite_keys.sql`

```sql
-- =============================================
-- MIGRATION: Composite Keys for Puzzle_Hints, Reviews, Room_Availability
-- WARNING: This will drop and recreate tables with data loss
-- Backup your data before running this script!
-- =============================================

USE enigma_engine_db;

-- Step 1: Drop dependent foreign keys in Session_Hints_Used
ALTER TABLE Session_Hints_Used DROP FOREIGN KEY Session_Hints_Used_ibfk_2;

-- Step 2: Backup existing hint data (optional)
CREATE TABLE Puzzle_Hints_Backup AS SELECT * FROM Puzzle_Hints;
CREATE TABLE Session_Hints_Used_Backup AS SELECT * FROM Session_Hints_Used;
CREATE TABLE Reviews_Backup AS SELECT * FROM Reviews;

-- Step 3: Drop and recreate Puzzle_Hints with composite key
DROP TABLE Puzzle_Hints;
CREATE TABLE Puzzle_Hints (
    puzzleID INT NOT NULL,
    hintSequence INT NOT NULL,
    hintText TEXT,
    timeToTriggerSeconds INT,
    PRIMARY KEY (puzzleID, hintSequence),
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);

-- Step 4: Migrate data from backup (add sequence numbers)
SET @row_num = 0;
SET @current_puzzle = 0;

INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds)
SELECT 
    puzzleID,
    (@row_num := IF(@current_puzzle = puzzleID, @row_num + 1, 1)) AS hintSequence,
    hintText,
    timeToTriggerSeconds,
    (@current_puzzle := puzzleID)
FROM Puzzle_Hints_Backup
ORDER BY puzzleID, hintID;

-- Step 5: Update Session_Hints_Used structure
ALTER TABLE Session_Hints_Used 
    DROP COLUMN hintID,
    ADD COLUMN puzzleID INT NOT NULL AFTER sessionID,
    ADD COLUMN hintSequence INT NOT NULL AFTER puzzleID;

-- Step 6: Re-add foreign key constraint
ALTER TABLE Session_Hints_Used 
    ADD CONSTRAINT Session_Hints_Used_ibfk_2 
    FOREIGN KEY (puzzleID, hintSequence) 
    REFERENCES Puzzle_Hints(puzzleID, hintSequence) 
    ON DELETE CASCADE;

-- Step 7: Update Reviews table
ALTER TABLE Reviews 
    DROP PRIMARY KEY,
    DROP COLUMN reviewID,
    ADD PRIMARY KEY (bookingID);

-- Step 8: Update Room_Availability table
-- Check if table has data
SET @has_data = (SELECT COUNT(*) FROM Room_Availability);

-- If has data, backup first
CREATE TABLE Room_Availability_Backup AS SELECT * FROM Room_Availability;

-- Drop and recreate
DROP TABLE Room_Availability;
CREATE TABLE Room_Availability (
    roomID INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    openTime TIME NOT NULL,
    closeTime TIME NOT NULL,
    PRIMARY KEY (roomID, dayOfWeek, openTime),
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Restore data if exists
INSERT IGNORE INTO Room_Availability (roomID, dayOfWeek, openTime, closeTime)
SELECT roomID, dayOfWeek, openTime, closeTime
FROM Room_Availability_Backup;

-- Step 9: Clean up backup tables (optional - comment out if you want to keep backups)
-- DROP TABLE Puzzle_Hints_Backup;
-- DROP TABLE Session_Hints_Used_Backup;
-- DROP TABLE Reviews_Backup;
-- DROP TABLE Room_Availability_Backup;

SELECT 'Migration completed successfully!' AS Status;
```

---

## 3. Backend Code Changes

### File: `backend/routes/sessions.py`

#### Change: `log_hint()` function
**Location:** Lines 47-65

**Current:**
```python
@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    hint_id = data.get('hintId')

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Session_Hints_Used (sessionID, hintID, timestampHintGiven) VALUES (%s, %s, NOW())",
            (session_id, hint_id)
        )
        db.commit()
        return jsonify({"message": "Hint logged"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
```

**Replace with:**
```python
@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    puzzle_id = data.get('puzzleId')  # NEW: Changed from hintId
    hint_sequence = data.get('hintSequence')  # NEW: Added hint sequence

    if not puzzle_id or not hint_sequence:
        return jsonify({"error": "puzzleId and hintSequence are required"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        # NEW: Updated query to use puzzleID and hintSequence
        cursor.execute(
            "INSERT INTO Session_Hints_Used (sessionID, puzzleID, hintSequence, timestampHintGiven) VALUES (%s, %s, %s, NOW())",
            (session_id, puzzle_id, hint_sequence)
        )
        db.commit()
        return jsonify({"message": "Hint logged"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
```

**Changes:**
- Changed `hint_id = data.get('hintId')` → `puzzle_id = data.get('puzzleId')`
- Added `hint_sequence = data.get('hintSequence')`
- Added input validation
- Updated SQL query to use `puzzleID, hintSequence` instead of `hintID`

---

### Optional: Add helper endpoint to get hints for a puzzle

Add this to `backend/routes/rooms.py`:

```python
@rooms_bp.route('/<int:room_id>/puzzles/<int:puzzle_id>/hints', methods=['GET'])
def get_puzzle_hints(room_id, puzzle_id):
    """Get all hints for a specific puzzle in sequence order"""
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            """SELECT puzzleID, hintSequence, hintText, timeToTriggerSeconds 
               FROM Puzzle_Hints 
               WHERE puzzleID = %s 
               ORDER BY hintSequence ASC""",
            (puzzle_id,)
        )
        hints = cursor.fetchall()
        return jsonify(hints), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
```

---

## 4. Seed Data Changes

### File: `backend/seed_data.sql`

#### Add Room_Availability seed data
**Location:** After line 74 (after rooms are inserted)

```sql
-- Insert Room Availability schedules
INSERT INTO Room_Availability (roomID, dayOfWeek, openTime, closeTime) VALUES
-- Haunted Mansion - Weekdays
(@room1_id, 'Monday', '10:00:00', '22:00:00'),
(@room1_id, 'Tuesday', '10:00:00', '22:00:00'),
(@room1_id, 'Wednesday', '10:00:00', '22:00:00'),
(@room1_id, 'Thursday', '10:00:00', '22:00:00'),
(@room1_id, 'Friday', '10:00:00', '23:00:00'),
(@room1_id, 'Saturday', '09:00:00', '23:00:00'),
(@room1_id, 'Sunday', '09:00:00', '22:00:00'),

-- Cyberpunk Heist - Limited hours
(@room2_id, 'Wednesday', '14:00:00', '22:00:00'),
(@room2_id, 'Thursday', '14:00:00', '22:00:00'),
(@room2_id, 'Friday', '14:00:00', '23:00:00'),
(@room2_id, 'Saturday', '10:00:00', '23:00:00'),
(@room2_id, 'Sunday', '10:00:00', '22:00:00'),

-- Pirate's Cove - Weekends and evening slots
(@room3_id, 'Friday', '17:00:00', '23:00:00'),
(@room3_id, 'Saturday', '09:00:00', '23:00:00'),
(@room3_id, 'Sunday', '09:00:00', '22:00:00');
```

#### Add Puzzle_Hints seed data with hintSequence
**Location:** After line 85 (after puzzles are inserted)

```sql
-- Insert Puzzle Hints with sequence numbers
-- Haunted Mansion - Ghostly Piano hints
INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds) VALUES
((SELECT puzzleID FROM Puzzles WHERE name = 'Ghostly Piano'), 1, 'Look at the sheet music on the piano stand.', 300),
((SELECT puzzleID FROM Puzzles WHERE name = 'Ghostly Piano'), 2, 'The notes spell out a word when read backwards.', 600),
((SELECT puzzleID FROM Puzzles WHERE name = 'Ghostly Piano'), 3, 'Play only the black keys in the highlighted pattern.', 900);

-- Haunted Mansion - Portrait Puzzle hints
INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds) VALUES
((SELECT puzzleID FROM Puzzles WHERE name = 'Portrait Puzzle'), 1, 'Check the dates on the portraits carefully.', 300),
((SELECT puzzleID FROM Puzzles WHERE name = 'Portrait Puzzle'), 2, 'Arrange them from oldest to newest, left to right.', 600);

-- Cyberpunk Heist - Firewall Breach hints
INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds) VALUES
((SELECT puzzleID FROM Puzzles WHERE name = 'Firewall Breach'), 1, 'Binary sequences can be converted to letters.', 240),
((SELECT puzzleID FROM Puzzles WHERE name = 'Firewall Breach'), 2, 'The ASCII table is your friend.', 480),
((SELECT puzzleID FROM Puzzles WHERE name = 'Firewall Breach'), 3, 'The password is a 4-letter word.', 720);

-- Cyberpunk Heist - Laser Grid hints
INSERT INTO Puzzle_Hints (puzzleID, hintSequence, hintText, timeToTriggerSeconds) VALUES
((SELECT puzzleID FROM Puzzles WHERE name = 'Laser Grid'), 1, 'Use the mirrors to redirect the beams.', 300),
((SELECT puzzleID FROM Puzzles WHERE name = 'Laser Grid'), 2, 'The safe path follows the floor tiles lighting pattern.', 600);
```

---

## 5. API Contract Changes

### POST `/sessions/<session_id>/hint`

**Old Request Body:**
```json
{
  "hintId": 123
}
```

**New Request Body:**
```json
{
  "puzzleId": 5,
  "hintSequence": 2
}
```

**Response:** (unchanged)
```json
{
  "message": "Hint logged"
}
```

---

## 6. Testing Checklist

After migration, test the following:

### Database Tests
- [ ] Verify all tables created successfully
- [ ] Verify composite primary keys work
- [ ] Verify foreign key constraints work
- [ ] Test inserting duplicate composite keys (should fail)
- [ ] Test CASCADE deletes work properly

### Backend Tests
- [ ] Test creating room availability schedules
- [ ] Test creating reviews (one per booking)
- [ ] Test creating puzzle hints with sequences
- [ ] Test logging hints during game sessions
- [ ] Test that you cannot insert duplicate reviews for same booking

### API Tests
```bash
# Test hint logging with new structure
curl -X POST http://localhost:5000/sessions/1/hint \
  -H "Content-Type: application/json" \
  -d '{"puzzleId": 1, "hintSequence": 2}'

# Test getting puzzle hints
curl http://localhost:5000/rooms/1/puzzles/1/hints
```

---

## 7. Rollback Plan

If migration fails, restore from backups:

```sql
-- Restore original tables
DROP TABLE Puzzle_Hints;
DROP TABLE Session_Hints_Used;
DROP TABLE Reviews;
DROP TABLE Room_Availability;

-- Rename backups to original
RENAME TABLE Puzzle_Hints_Backup TO Puzzle_Hints;
RENAME TABLE Session_Hints_Used_Backup TO Session_Hints_Used;
RENAME TABLE Reviews_Backup TO Reviews;
RENAME TABLE Room_Availability_Backup TO Room_Availability;
```

---

## Summary of Changes

| Change Type | Files Affected | Lines Changed |
|-------------|---------------|---------------|
| **Schema Changes** | `backend/schema.sql` | 4 tables modified |
| **Migration Script** | `backend/migration_composite_keys.sql` | New file (~100 lines) |
| **Backend Logic** | `backend/routes/sessions.py` | 1 function modified (~15 lines) |
| **Seed Data** | `backend/seed_data.sql` | Add ~30 lines |
| **API Contract** | Request/Response format | 1 endpoint affected |

**Total Estimated Changes:** ~150-200 lines across 5 files

**Risk Level:** 🟡 **MODERATE** - Requires data migration and API changes

**Recommended Approach:** 
1. ✅ Test migration on development database first
2. ✅ Backup production data before migration
3. ✅ Update backend code and deploy together with schema changes
4. ✅ Update frontend if hint logging is used
