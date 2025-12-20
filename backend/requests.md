# API Requests - The Enigma Engine

Copy and paste these cURL commands into your terminal or import them into Postman to test the API endpoints.

## Base URL
`http://localhost:5000`

## Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

## Authentication

### Register Customer
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-0199",
    "role": "Customer"
  }'
```

### Register Admin (Staff)
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@enigma.com",
    "password": "adminpassword",
    "firstName": "Alice",
    "lastName": "Admin",
    "phone": "555-9999",
    "role": "Admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

## Room Management

### Create Room
```bash
curl -X POST http://localhost:5000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Haunted Mansion",
    "description": "Spooky escape room with ghosts.",
    "difficultyLevel": 7,
    "maxPlayers": 6,
    "durationMinutes": 60
  }'
```

### Get All Rooms
```bash
curl -X GET http://localhost:5000/api/rooms/
```

### Get Single Room (Replace :id)
```bash
curl -X GET http://localhost:5000/api/rooms/1
```

### Update Room (Replace :id)
```bash
curl -X PUT http://localhost:5000/api/rooms/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Haunted Mansion (Revamped)",
    "description": "Even spookier now!",
    "difficultyLevel": 8,
    "maxPlayers": 6,
    "durationMinutes": 60
  }'
```

### Delete Room (Replace :id)
```bash
curl -X DELETE http://localhost:5000/api/rooms/1
```

## Puzzle Management

### Create Physical Puzzle (Replace :roomId)
```bash
curl -X POST http://localhost:5000/api/rooms/1/puzzles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Locked Chest",
    "description": "Find the key to open the chest.",
    "puzzleType": "Physical",
    "resetInstructions": "Place key back under the mat.",
    "requiredPropID": 101
  }'
```

### Create Digital Puzzle (Replace :roomId)
```bash
curl -X POST http://localhost:5000/api/rooms/1/puzzles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Computer Terminal",
    "description": "Hack the mainframe.",
    "puzzleType": "Digital",
    "softwareEndpoint": "/game/terminal",
    "correctAnswerHash": "5f4dcc3b5aa765d61d8327deb882cf99"
  }'
```

## Bookings & Invoices

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings/ \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "roomId": 1,
    "scheduledTime": "2025-12-01 18:00:00",
    "numPlayers": 4
  }'
```

### Get Customer Bookings (Replace :customerId)
```bash
curl -X GET http://localhost:5000/api/bookings/customer/1
```

### Pay Invoice (Replace :invoiceId)
```bash
curl -X POST http://localhost:5000/api/bookings/invoices/1/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "paymentMethod": "Credit Card"
  }'
```

## Game Sessions

### Start Session
```bash
curl -X POST http://localhost:5000/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "gameMasterId": 2
  }'
```

### Log Hint (Replace :sessionId)
```bash
curl -X POST http://localhost:5000/api/sessions/1/hint \
  -H "Content-Type: application/json" \
  -d '{
    "hintId": 1
  }'
```

### End Session (Replace :sessionId)
```bash
curl -X POST http://localhost:5000/api/sessions/1/end \
  -H "Content-Type: application/json" \
  -d '{
    "success": true
  }'
```

## Analytics

### Revenue Report
```bash
curl -X GET http://localhost:5000/api/analytics/revenue
```

### Performance Stats
```bash
curl -X GET http://localhost:5000/api/analytics/performance
```
