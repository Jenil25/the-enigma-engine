# Database Schema Update Analysis

## Overview
This document analyzes the impact of removing primary keys from three tables in the database schema:
1. **Room_Availability** - Removal of `availabilityID`
2. **Reviews** - Removal of `reviewID`
3. **Puzzle_Hint** - Removal of `hintID`

---

## Current Schema Analysis

### 1. Room_Availability Table
**Current Structure:**
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

**Updated Structure (Per UML):**
```sql
CREATE TABLE IF NOT EXISTS RoomAvailability (
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    open_time TIME,
    close_time TIME
    -- No roomID foreign key visible in UML
);
```

### 2. Reviews Table
**Current Structure:**
```sql
CREATE TABLE IF NOT EXISTS Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);
```

**Updated Structure (Per UML):**
```sql
CREATE TABLE IF NOT EXISTS Review (
    rating INT,
    comment_text TEXT
    -- No bookingID foreign key visible in UML
);
```

### 3. Puzzle_Hints Table
**Current Structure:**
```sql
CREATE TABLE IF NOT EXISTS Puzzle_Hints (
    hintID INT AUTO_INCREMENT PRIMARY KEY,
    puzzleID INT,
    hintText TEXT,
    timeToTriggerSeconds INT,
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);
```

**Updated Structure (Per UML):**
```sql
CREATE TABLE IF NOT EXISTS PuzzleHint (
    hint_text TEXT,
    time_to_trigger_seconds INT
    -- No puzzleID foreign key visible in UML
);
```

---

## Impact Analysis

### 🔴 CRITICAL ISSUE: Session_Hints_Used Table Dependency

**The removal of `hintID` from Puzzle_Hints creates a CRITICAL foreign key constraint violation.**

#### Current Dependency:
```sql
CREATE TABLE IF NOT EXISTS Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT,
    hintID INT,  -- ❌ REFERENCES Puzzle_Hints(hintID) which will no longer exist
    timestampHintGiven DATETIME,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID),
    FOREIGN KEY (hintID) REFERENCES Puzzle_Hints(hintID)  -- ❌ BROKEN REFERENCE
);
```

#### Backend Code Impact:
**File:** [`routes/sessions.py`](file:///Users/jenilmahyavanshi/Documents/Masters/Fall%202025/DBMS/Project/the-enigma-engine/backend/routes/sessions.py#L56)
```python
@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    hint_id = data.get('hintId')  # ❌ Expects hintId which won't exist
    
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Session_Hints_Used (sessionID, hintID, timestampHintGiven) VALUES (%s, %s, NOW())",
            (session_id, hint_id)  # ❌ Cannot insert hintID
        )
```

---

## Required Changes

### 1. Schema Changes Required

#### Option A: Add Composite Primary Keys (RECOMMENDED)
Without standalone primary keys, you need composite keys to uniquely identify rows:

```sql
-- Room_Availability with composite key
CREATE TABLE IF NOT EXISTS Room_Availability (
    roomID INT,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    openTime TIME,
    closeTime TIME,
    PRIMARY KEY (roomID, dayOfWeek, openTime),  -- Composite key
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE
);

-- Reviews with bookingID as primary key
CREATE TABLE IF NOT EXISTS Reviews (
    bookingID INT PRIMARY KEY,  -- One review per booking
    rating INT CHECK (rating BETWEEN 1 AND 5),
    commentText TEXT,
    FOREIGN KEY (bookingID) REFERENCES Bookings(bookingID)
);

-- Puzzle_Hints: MUST keep hintID or use composite key
CREATE TABLE IF NOT EXISTS Puzzle_Hints (
    puzzleID INT,
    hintText TEXT,
    timeToTriggerSeconds INT,
    hintSequence INT,  -- Order of hints
    PRIMARY KEY (puzzleID, hintSequence),  -- Composite key
    FOREIGN KEY (puzzleID) REFERENCES Puzzles(puzzleID) ON DELETE CASCADE
);
```

#### Option B: Keep hintID for Session_Hints_Used (SIMPLEST)
If you want to maintain the current functionality:
- **Room_Availability**: Can remove `availabilityID` if you add composite key
- **Reviews**: Can remove `reviewID` if one review per booking is acceptable
- **Puzzle_Hints**: **MUST keep `hintID`** because `Session_Hints_Used` depends on it

### 2. Session_Hints_Used Table Redesign

**If removing hintID from Puzzle_Hints, you must redesign Session_Hints_Used:**

```sql
-- New approach: Store hint sequence number instead of hintID
CREATE TABLE IF NOT EXISTS Session_Hints_Used (
    sessionHintID INT AUTO_INCREMENT PRIMARY KEY,
    sessionID INT,
    puzzleID INT,
    hintSequence INT,  -- Which hint was given (1st, 2nd, 3rd, etc.)
    timestampHintGiven DATETIME,
    FOREIGN KEY (sessionID) REFERENCES Game_Sessions(sessionID),
    FOREIGN KEY (puzzleID, hintSequence) REFERENCES Puzzle_Hints(puzzleID, hintSequence)
);
```

### 3. Backend Code Changes

#### File: [`backend/routes/sessions.py`](file:///Users/jenilmahyavanshi/Documents/Masters/Fall%202025/DBMS/Project/the-enigma-engine/backend/routes/sessions.py)

**Current Code:**
```python
@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    hint_id = data.get('hintId')  # OLD
    
    cursor.execute(
        "INSERT INTO Session_Hints_Used (sessionID, hintID, timestampHintGiven) VALUES (%s, %s, NOW())",
        (session_id, hint_id)  # OLD
    )
```

**Updated Code (if using composite key approach):**
```python
@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    puzzle_id = data.get('puzzleId')  # NEW
    hint_sequence = data.get('hintSequence')  # NEW
    
    cursor.execute(
        "INSERT INTO Session_Hints_Used (sessionID, puzzleID, hintSequence, timestampHintGiven) VALUES (%s, %s, %s, NOW())",
        (session_id, puzzle_id, hint_sequence)  # NEW
    )
```

### 4. Seed Data Changes

#### File: [`backend/seed_data.sql`](file:///Users/jenilmahyavanshi/Documents/Masters/Fall%202025/DBMS/Project/the-enigma-engine/backend/seed_data.sql)

**Current approach:**
```sql
INSERT INTO Reviews (bookingID, rating, commentText) VALUES 
(@book1_id, 5, 'Amazing experience! The actors were great.'),
(@book2_id, 4, 'Very hard puzzles, but fun atmosphere.');
```

**No changes needed** - INSERT statements don't reference the removed primary keys.

However, **you need to add Room_Availability and Puzzle_Hints seed data** to match the new composite keys.

### 5. Frontend Changes

#### File: [`frontend/utils/api.ts`](file:///Users/jenilmahyavanshi/Documents/Masters/Fall%202025/DBMS/Project/the-enigma-engine/frontend/utils/api.ts)

**If the frontend calls the hint logging endpoint:**
- Update API calls to send `puzzleId` and `hintSequence` instead of `hintId`
- Update TypeScript interfaces/types to reflect the schema changes

---

## Breaking Changes Summary

| Component | Change Required | Severity | Description |
|-----------|----------------|----------|-------------|
| `Session_Hints_Used` table | **Schema redesign** | 🔴 **CRITICAL** | Foreign key constraint on `hintID` will break |
| `backend/routes/sessions.py` | **Code change** | 🔴 **CRITICAL** | `log_hint()` endpoint needs refactor |
| `backend/schema.sql` | **Schema update** | 🟡 **MODERATE** | Add composite keys to maintain data integrity |
| `frontend/utils/api.ts` | **API contract change** | 🟡 **MODERATE** | Update hint logging API calls |
| `backend/seed_data.sql` | **Add seed data** | 🟢 **LOW** | Add Room_Availability and Puzzle_Hints data |

---

## Recommendation

> [!CAUTION]
> **DO NOT remove `hintID` from Puzzle_Hints** without redesigning `Session_Hints_Used` table and updating all dependent code. This is a breaking change that will cause the application to fail.

### Recommended Approach:

1. **For Room_Availability:**
   - ✅ Safe to remove `availabilityID`
   - Add composite primary key: `PRIMARY KEY (roomID, dayOfWeek, openTime)`
   - **No backend code uses `availabilityID`**

2. **For Reviews:**
   - ✅ Safe to remove `reviewID`
   - Make `bookingID` the primary key (one review per booking)
   - **No backend code uses `reviewID`**

3. **For Puzzle_Hints:**
   - ⚠️ **KEEP `hintID`** OR redesign Session_Hints_Used
   - If removing: Add composite key `PRIMARY KEY (puzzleID, hintSequence)`
   - **Update `sessions.py` log_hint() function**
   - **Update frontend hint logging calls**

---

## Migration Steps

If you proceed with removing all primary keys:

### Step 1: Update Schema
```sql
-- Drop dependent foreign key first
ALTER TABLE Session_Hints_Used DROP FOREIGN KEY Session_Hints_Used_ibfk_2;

-- Modify Puzzle_Hints
ALTER TABLE Puzzle_Hints 
    DROP PRIMARY KEY,
    ADD COLUMN hintSequence INT,
    ADD PRIMARY KEY (puzzleID, hintSequence);

-- Update Session_Hints_Used
ALTER TABLE Session_Hints_Used 
    DROP COLUMN hintID,
    ADD COLUMN puzzleID INT,
    ADD COLUMN hintSequence INT,
    ADD FOREIGN KEY (puzzleID, hintSequence) 
        REFERENCES Puzzle_Hints(puzzleID, hintSequence);

-- Update Room_Availability
ALTER TABLE Room_Availability 
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (roomID, dayOfWeek, openTime);

-- Update Reviews
ALTER TABLE Reviews 
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (bookingID);
```

### Step 2: Update Backend Code
- Modify `routes/sessions.py` log_hint() endpoint
- Update any queries that reference the removed IDs

### Step 3: Update Frontend
- Modify hint logging API calls
- Update TypeScript types

### Step 4: Update Seed Data
- Add sample Room_Availability data
- Add sample Puzzle_Hints with sequence numbers

### Step 5: Test
- Run application and verify all CRUD operations
- Test hint logging functionality
- Test bookings and reviews

---

## Alternative: Minimal Changes Approach

If you want to keep the application working with minimal changes:

1. **Keep hintID in Puzzle_Hints** (just don't mark it as PRIMARY KEY in UML)
2. **Remove availabilityID** from Room_Availability (no dependencies)
3. **Remove reviewID** from Reviews (no dependencies)

This requires only schema changes, no code changes needed.

---

## Conclusion

The removal of primary keys from these three tables has **varying levels of impact**:

- **Room_Availability**: ✅ Low impact, safe to remove
- **Reviews**: ✅ Low impact, safe to remove  
- **Puzzle_Hint**: 🔴 **High impact**, requires significant refactoring

**Without additional context on why the UML shows these tables without foreign key relationships to their parent entities (Rooms, Bookings, Puzzles), the current implementation appears incomplete.** The UML diagram shows these as standalone entities, but logically they should maintain relationships to their parent tables.
