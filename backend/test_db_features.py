import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_register_user():
    print("\n--- Testing sp_RegisterUser ---")
    email = f"testuser_{int(time.time())}@example.com"
    payload = {
        "email": email,
        "password": "password123",
        "firstName": "Test",
        "lastName": "User",
        "phone": "1234567890",
        "role": "Customer"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 201:
        return response.json()['userId']
    return None

def test_create_booking(user_id):
    print("\n--- Testing sp_CreateBooking & f_CalculateBookingTotal ---")
    # Assuming roomID 1 exists and is available
    payload = {
        "customerId": user_id,
        "roomId": 1,
        "scheduledTime": "2025-12-25 14:00:00",
        "numPlayers": 4
    }
    response = requests.post(f"{BASE_URL}/bookings/", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 201:
        return response.json()['invoiceId']
    return None

def test_payment_trigger(invoice_id):
    print("\n--- Testing tr_AfterPayment ---")
    payload = {
        "amount": 100.00,
        "paymentMethod": "Credit Card"
    }
    response = requests.post(f"{BASE_URL}/bookings/invoices/{invoice_id}/pay", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_view_customer_bookings(user_id):
    print("\n--- Testing v_CustomerBookings ---")
    response = requests.get(f"{BASE_URL}/bookings/customer/{user_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    print("Starting Verification...")
    user_id = test_register_user()
    if user_id:
        invoice_id = test_create_booking(user_id)
        if invoice_id:
            test_payment_trigger(invoice_id)
            test_view_customer_bookings(user_id)
    print("\nVerification Complete.")
