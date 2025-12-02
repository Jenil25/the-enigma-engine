# Database Concepts - The Enigma Engine

This document outlines the key database management concepts applied in "The Enigma Engine" project.

## 1. Relational Model & Normalization
- **3rd Normal Form (3NF)**: The schema is designed to minimize redundancy and dependency.
    - *Example*: `Customers` and `Staff` are separated from `Users` to avoid null columns for role-specific attributes. `Room_Availability` is separate from `Rooms` to handle multi-day schedules without repeating room data.
- **Entity-Relationship Modeling**:
    - **One-to-One**: `Bookings` -> `Invoices` (Each booking has exactly one invoice).
    - **One-to-Many**: `Rooms` -> `Puzzles`, `Customers` -> `Bookings`.
    - **Many-to-Many**: `Game_Sessions` <-> `Puzzle_Hints` (Implemented via the junction table `Session_Hints_Used`).

## 2. Inheritance / Specialization
- **Table-per-Type Strategy**: We use a parent `Users` table for shared attributes (email, password) and child tables `Customers` and `Staff` for specific attributes.
    - *Concept*: IS-A Relationship.
- **Puzzle Types**: `Puzzles` is the parent, with `Physical_Puzzles` and `Digital_Puzzles` as children containing type-specific fields.

## 3. Integrity Constraints
- **Primary Keys**: Every table has a unique identifier (e.g., `userID`, `roomID`).
- **Foreign Keys**: Enforce referential integrity (e.g., a `Booking` cannot exist without a valid `customerID`).
- **Cascading Actions**: `ON DELETE CASCADE` is used for parent-child relationships (e.g., deleting a `Room` automatically deletes its `Puzzles`).
- **Domain Constraints**: `ENUM` types for Status (`Pending`, `Paid`) and Roles (`Admin`, `GameMaster`). `CHECK` constraints for Rating (1-5) and Difficulty (1-10).

## 4. Indexing (Planned)
- **Performance**: Indexes will be added on frequently queried columns like `email` (for login), `scheduledTime` (for availability checks), and foreign keys to speed up joins.

## 5. Transactions (ACID)
- **Atomicity**: Critical operations like "Booking a Room" will be wrapped in transactions.
    - *Scenario*: Creating a Booking AND an Invoice must happen together. If one fails, both roll back.
- **Consistency**: The database moves from one valid state to another.
- **Isolation**: Ensuring concurrent bookings don't double-book the same slot.

## 6. Stored Procedures & Triggers (Planned)
- **Triggers**: To automatically update `loyaltyPoints` for a Customer when an Invoice is paid.
- **Stored Procedures**: For complex operations like `CreateBooking` that involves availability checking and inserting into multiple tables.

## 7. Complex Queries (OLAP)
- **Joins**: Extensive use of `INNER JOIN` and `LEFT JOIN` to reconstruct data for views (e.g., Game Session details with Room and Customer info).
- **Aggregation**: `GROUP BY` and `HAVING` for analytical reports (e.g., "Average Time to Hint per Puzzle").
