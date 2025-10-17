# CRM Ticketing System - Backend API

A RESTful API for managing customer complaint tickets built with Node.js, Express.js, and PostgreSQL.

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API Format**: RESTful JSON endpoints
- **Language**: TypeScript

## Features

- ✅ Create new tickets
- ✅ Get tickets with filtering and pagination
- ✅ Export tickets to CSV
- ✅ Input validation and error handling
- ✅ Rate limiting and security middleware

## API Endpoints

### 1. Create Ticket
```
POST /api/tickets
```

**Request Body:**
```json
{
  "tripId": "BLY-251011-08622-5442",
  "tripDate": "2025-10-12",
  "driverId": 12345,
  "reason": "Harassment",
  "city": "Baghdad",
  "serviceType": "Eco",
  "customerPhone": "7700123456",
  "agentName": "Ahmed"
}
```

**Response:**
```json
{
  "message": "Ticket created successfully",
  "ticketId": 1
}
```

### 2. Get Tickets (With Filters + Pagination)
```
GET /api/tickets
```

**Query Parameters:**
- `reason` (string, optional): Filter by reason
- `start_date` (date, optional): Filter start date
- `end_date` (date, optional): Filter end date
- `page` (integer, optional, default=1): Page number
- `limit` (integer, optional, default=20): Tickets per page

**Example:**
```
GET /api/tickets?reason=Harassment&start_date=2025-10-02&end_date=2025-10-11&page=1&limit=20
```

**Response:**
```json
{
  "page": 1,
  "totalPages": 3,
  "totalTickets": 45,
  "tickets": [...]
}
```

### 3. Export Tickets (CSV)
```
GET /api/tickets/export
```

**Query Parameters:**
- `reason` (string, optional): Filter by reason
- `start_date` (date, optional): Filter start date
- `end_date` (date, optional): Filter end date

**Response:** CSV file download

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` file with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/crm_ticketing?schema=public"
PORT=3001
NODE_ENV=development
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Health Check
```
GET http://localhost:3001/health
```

## Database Schema

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR NOT NULL,
  trip_date TIMESTAMP NOT NULL,
  driver_id INTEGER NOT NULL,
  reason VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  service_type VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  agent_name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

| Error | Status Code | Message |
|-------|-------------|---------|
| Missing field | 400 | "All required fields must be filled" |
| Invalid input | 400 | "Invalid data format" |
| No results | 404 | "No tickets found for given filters" |
| Server error | 500 | "Internal server error" |

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/
│   │   └── tickets.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── README.md
```
