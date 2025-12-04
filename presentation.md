# The Enigma Engine: Project Presentation Flow

**Time Limit**: 5-7 Minutes
**Goal**: Demonstrate the system's architecture, utility, and 3 distinct CRUD operations with database verification.

---

## 1. Introduction & Architecture (1.5 Minutes)

**Speaker Script**:
"Good [Morning/Afternoon], we are presenting **The Enigma Engine**, a comprehensive management system for Escape Room businesses.

**The Problem**: Escape rooms have complex scheduling, staff management, and game state tracking needs that generic booking software can't handle.

**Our Solution**: A dedicated full-stack application that handles everything from customer bookings to live game session tracking.

**Architecture**:
*   **Frontend**: Built with **Next.js (React)** and **Tailwind CSS** for a responsive, modern UI.
*   **Backend**: Powered by **Flask (Python)**, serving RESTful APIs.
*   **Database**: **MySQL** relational database, utilizing Stored Procedures for complex logic (like booking creation) and Triggers for automated actions (like loyalty points).
*   **Security**: Role-Based Access Control (RBAC) for Customers, Game Masters, and Admins."

---

## 2. Schema Overview (30 Seconds)

**Visual Aid**: *Show the ER Diagram or Schema Slide (Optional)*

**Speaker Script**:
"Our database schema is designed for data integrity and efficiency. Key entities include:
*   **Users**: The base table for all actors, extended by **Customers** and **Staff**.
*   **Rooms & Puzzles**: Defining the inventory.
*   **Bookings & Invoices**: Managing the core business transactions.
*   **Game_Sessions**: Tracking the actual gameplay, hints used, and outcomes."

---

## 3. Live Demonstration (CRUD Operations) (4 Minutes)

"Now, we will demonstrate three core CRUD operations, verifying each step in the database."

### Operation 1: CREATE (Customer Booking)
*Demonstrates the 'Booking' flow.*

1.  **Database Prep**:
    *   Open MySQL Workbench.
    *   Run: `SELECT * FROM Bookings ORDER BY bookingID DESC LIMIT 5;`
    *   **Say**: "Notice the last booking ID."
2.  **Frontend Action**:
    *   Log in as a **Customer** (e.g., `john@doe.com`).
    *   Go to **Rooms**, select a room (e.g., "Cyberpunk Heist").
    *   Select a Date/Time and confirm booking.
    *   **Say**: "We are creating a new booking record."
3.  **Database Verification**:
    *   Re-run: `SELECT * FROM Bookings ORDER BY bookingID DESC LIMIT 5;`
    *   **Highlight**: The new row with the `Confirmed` status.

### Operation 2: UPDATE (Staff Management)
*Demonstrates Admin updating a record.*

1.  **Database Prep**:
    *   Run: `SELECT * FROM Staff JOIN Users ON Staff.userID = Users.userID;`
    *   **Pick a target**: Note the `payRate` or `role` of a specific staff member (e.g., "Gary Master").
2.  **Frontend Action**:
    *   Log in as **Admin** (e.g., `admin@enigma.com`).
    *   Navigate to **Manage Staff**.
    *   Click **Edit** on "Gary Master".
    *   Change Pay Rate (e.g., from `20.00` to `25.50`) or Role.
    *   Click **Save**.
3.  **Database Verification**:
    *   Re-run the query.
    *   **Highlight**: The `payRate` column has updated for that user.

### Operation 3: DELETE (Staff Management)
*Demonstrates Admin removing a record.*

1.  **Database Prep**:
    *   Identify the staff member you just updated or a dummy one.
    *   **Say**: "We will now remove this staff member from the system."
2.  **Frontend Action**:
    *   On the **Manage Staff** page.
    *   Click **Delete** on the target staff member.
    *   Confirm the alert.
3.  **Database Verification**:
    *   Re-run the query.
    *   **Highlight**: The row is gone.
    *   *Note*: Mention that `ON DELETE CASCADE` handles the cleanup in the `Users` table as well.

---

## 4. Conclusion (30 Seconds)

**Speaker Script**:
"In summary, The Enigma Engine provides a robust, end-to-end solution for escape room owners. By integrating booking, staff management, and game tracking into one cohesive database, we streamline operations and provide valuable data insights. Thank you."

---

## Cheat Sheet: SQL Queries for Demo

```sql
-- 1. Check Bookings
SELECT bookingID, customerID, roomID, scheduledTime, status FROM Bookings ORDER BY bookingID DESC;

-- 2. Check Staff
SELECT s.userID, u.firstName, s.role, s.payRate 
FROM Staff s 
JOIN Users u ON s.userID = u.userID;
```
