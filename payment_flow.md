# Payment Flow Documentation

This document explains the complete payment flow in the Enigma Engine application, from UI interaction to database updates.

---

## Overview

The payment system allows customers to pay for their escape room bookings directly from the dashboard. The flow demonstrates the integration between the frontend, backend API, and database triggers.

---

## Architecture Diagram

```
User Dashboard → Payment Modal → API Request → Database Trigger → Updated State
```

---

## Step-by-Step Flow

### 1. **User Views Dashboard** (`/dashboard`)
- User logs in and navigates to their dashboard
- Dashboard fetches bookings via `GET /api/bookings/customer/{customerId}`
- Bookings displayed in a table with status and payment information

### 2. **User Initiates Payment**
- User clicks **"Pay Now"** button (only visible for pending invoices)
- `openPaymentModal(booking)` function is called
- **State Changes**:
  - `setSelectedBooking(booking)` - Stores the booking being paid
  - `setShowPaymentModal(true)` - Displays the modal

### 3. **Payment Modal Displays**
The modal shows:
- **Mission Details**: Room name, scheduled time
- **Amount Due**: Total cost from invoice
- **Payment Method Selector**: Credit Card, Debit Card, PayPal, Cash
- **Loyalty Points Notification**: "You'll earn 10 loyalty points"
- **Action Buttons**: Cancel or Pay

**Frontend Code**: `frontend/app/dashboard/page.tsx`
```tsx
const openPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
};
```

### 4. **User Confirms Payment**
- User selects payment method (default: Credit Card)
- User clicks **"Pay $XX.XX"** button
- `handlePayment()` async function is called
- **State Changes**:
  - `setProcessing(true)` - Disables buttons, shows "Processing..."

### 5. **API Request Sent**
**Endpoint**: `POST /api/bookings/invoices/{invoiceId}/pay`

**Request Body**:
```json
{
  "amount": 100.00,
  "paymentMethod": "Credit Card"
}
```

**Frontend Code**:
```tsx
const handlePayment = async () => {
    setProcessing(true);
    await fetchClient(`/bookings/invoices/${invoiceId}/pay`, {
        method: 'POST',
        body: JSON.stringify({
            amount: selectedBooking.amountDue,
            paymentMethod: paymentMethod
        })
    });
    // ... refresh and close modal
};
```

### 6. **Backend Processing** (`backend/routes/bookings.py`)
**Route Handler**: `/api/bookings/invoices/<int:invoice_id>/pay`

**What Happens**:
1. Receives payment data
2. Inserts payment record into `Payments` table
3. Commits transaction

**Backend Code**:
```python
@bookings_bp.route('/invoices/<int:invoice_id>/pay', methods=['POST'])
def pay_invoice(invoice_id):
    data = request.json
    amount = data.get('amount')
    method = data.get('paymentMethod', 'Credit Card')

    db = get_db()
    cursor = db.cursor()
    try:
        # 1. Record Payment (Trigger will handle the rest)
        cursor.execute(
            "INSERT INTO Payments (invoiceID, amountPaid, paymentMethod) VALUES (%s, %s, %s)",
            (invoice_id, amount, method)
        )

        db.commit()
        return jsonify({"message": "Payment successful"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
```

### 7. **Database Trigger Fires** (`tr_AfterPayment`)
**Trigger Type**: `AFTER INSERT ON Payments`

**What the Trigger Does**:
1. **Updates Invoice**: Sets invoice status to 'Paid'
2. **Awards Loyalty Points**: Adds 10 points to customer's account

**Database Code** (from `backend/schema.sql`):
```sql
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
END
```

### 8. **Response Returned**
- Backend returns `200 OK` with success message
- Frontend receives the response

### 9. **UI Updates**
**Frontend Actions**:
1. Refreshes bookings: `fetchBookings(user.id)`
2. Closes modal: `closePaymentModal()`
3. Shows success alert: "Payment successful! Your invoice has been marked as paid and you earned 10 loyalty points!"
4. Table updates automatically to show:
   - Invoice status: "Paid" (green)
   - "Pay Now" button disappears

**Frontend Code**:
```tsx
// After successful payment:
if (user) {
    await fetchBookings(user.id); // Refresh booking list
}
closePaymentModal();
alert('Payment successful! Your invoice has been marked as paid and you earned 10 loyalty points!');
```

---

## Database Tables Involved

### Tables Modified:
1. **`Payments`** - New payment record inserted
2. **`Invoices`** - Status updated to 'Paid' (via trigger)
3. **`Customers`** - Loyalty points increased by 10 (via trigger)

### Tables Read:
1. **`Bookings`** - To link invoice to customer
2. **`Rooms`** - For display in dashboard (via view)

---

## Data Flow Summary

```
┌─────────────┐
│   User      │
│  Dashboard  │
└──────┬──────┘
       │ Click "Pay Now"
       ▼
┌─────────────┐
│  Payment    │
│   Modal     │
└──────┬──────┘
       │ Select Method & Confirm
       ▼
┌─────────────┐
│   API Call  │
│ POST /pay   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │
│  Handler    │
└──────┬──────┘
       │ INSERT INTO Payments
       ▼
┌─────────────┐
│  Database   │
│   Trigger   │
└──────┬──────┘
       │ 1. UPDATE Invoices (status='Paid')
       │ 2. UPDATE Customers (loyaltyPoints +10)
       ▼
┌─────────────┐
│  Response   │
│  Success    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Refresh   │
│  Dashboard  │
└─────────────┘
```

---

## Key Features Demonstrated

### 1. **Database Triggers**
- Automatic invoice status update
- Automatic loyalty points award
- No application code needed for these updates

### 2. **Transaction Safety**
- Payment insertion is atomic
- Rollback on errors
- Trigger executes within same transaction

### 3. **User Experience**
- Real-time feedback (Processing state)
- Clear payment details before confirmation
- Success notification with loyalty points info
- Immediate UI refresh

### 4. **Separation of Concerns**
- Frontend: UI & user interaction
- Backend API: Request validation & database operations
- Database: Business logic via triggers

---

## Error Handling

### Frontend Errors:
- Network failures → Shows "Payment failed. Please try again."
- Invalid data → Caught in try-catch block

### Backend Errors:
- Database errors → Automatic rollback
- Missing data → 400 Bad Request
- Returns error message in JSON

### Database Errors:
- Foreign key violations → Payment fails, rollback occurs
- Trigger failures → Entire transaction rolls back

---

## Testing the Flow

### Manual Test Steps:
1. Login to dashboard as a customer
2. Ensure you have a booking with "Pending" invoice status
3. Click "Pay Now" button
4. Verify modal shows correct booking details
5. Select payment method
6. Click "Pay $XX.XX"
7. Verify success message appears
8. Check that:
   - Invoice status changes to "Paid"
   - "Pay Now" button disappears
   - Customer loyalty points increased by 10

### Database Verification:
```sql
-- Check payment was recorded
SELECT * FROM Payments WHERE invoiceID = ?;

-- Check invoice status updated
SELECT * FROM Invoices WHERE invoiceID = ?;

-- Check loyalty points increased
SELECT loyaltyPoints FROM Customers WHERE userID = ?;
```

---

## Future Enhancements

### Potential Improvements:
1. **Real Payment Integration**: Stripe, PayPal API
2. **Payment History**: Separate view for all payments
3. **Partial Payments**: Allow paying less than full amount
4. **Refunds**: Admin ability to refund payments
5. **Email Receipts**: Send confirmation emails
6. **Payment Reminders**: Automatic reminders for pending invoices

---

## Summary

The payment flow showcases:
- ✅ Clean UI/UX with modal interaction
- ✅ RESTful API design
- ✅ Database triggers for business logic
- ✅ Atomic transactions
- ✅ Error handling at all levels
- ✅ Real-time UI updates

This implementation demonstrates proper separation of concerns and showcases advanced database features (triggers) while maintaining a smooth user experience.
