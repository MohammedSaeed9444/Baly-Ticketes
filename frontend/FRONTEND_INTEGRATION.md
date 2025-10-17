# Frontend-Backend Integration Guide

This guide explains how the React frontend has been integrated with the Node.js backend API.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm run setup
# Update .env with your PostgreSQL credentials
npm run db:push
npm run dev
```

### 2. Start the Frontend
```bash
# In the root directory
npm install
npm run dev
```

### 3. Configure API URL
Copy `env.example` to `.env.local` and update the API URL if needed:
```bash
cp env.example .env.local
```

## 🔧 Integration Features

### ✅ **Live Filtering & Pagination**
- **Real-time filtering** by reason and date range
- **Server-side pagination** with configurable page size
- **Automatic data refresh** when filters change
- **Loading states** during API calls

### ✅ **CSV Export**
- **Server-side CSV generation** with applied filters
- **Automatic file download** with descriptive filenames
- **Progress indicators** during export

### ✅ **Error Handling**
- **Comprehensive error messages** from API
- **User-friendly error display** with dismiss options
- **Network error handling** with retry capabilities

### ✅ **Loading States**
- **Loading spinners** during data fetching
- **Disabled states** during operations
- **Progress feedback** for all async operations

## 📁 File Structure

```
src/
├── services/
│   └── api.ts                 # API service with all endpoints
├── hooks/
│   └── useTickets.ts          # Custom hook for ticket management
├── types/
│   └── ticket.ts              # Type definitions and utilities
├── pages/
│   ├── Dashboard.tsx          # Updated with API integration
│   └── CreateTicket.tsx       # Updated with API integration
└── env.example                # Environment configuration
```

## 🔌 API Service (`src/services/api.ts`)

The API service provides a clean interface to all backend endpoints:

```typescript
// Create a new ticket
await apiService.createTicket(ticketData);

// Get tickets with filtering and pagination
await apiService.getTickets({
  reason: "Harassment",
  start_date: "2025-10-01",
  end_date: "2025-10-31",
  page: 1,
  limit: 20
});

// Export tickets as CSV
await apiService.exportTickets({
  reason: "Harassment",
  start_date: "2025-10-01"
});
```

## 🎣 Custom Hook (`src/hooks/useTickets.ts`)

The `useTickets` hook manages all ticket-related state and operations:

```typescript
const {
  tickets,           // Array of tickets
  loading,           // Loading state
  error,             // Error message
  pagination,        // Pagination info
  loadTickets,       // Function to load tickets
  createTicket,      // Function to create ticket
  exportTickets,     // Function to export tickets
  clearError,        // Function to clear errors
} = useTickets();
```

## 🎨 Updated Components

### Dashboard Component
- **Live filtering** with real-time API calls
- **Server-side pagination** with proper page management
- **CSV export** with current filter settings
- **Loading and error states** with user feedback

### CreateTicket Component
- **API integration** for ticket creation
- **Loading states** during submission
- **Error handling** with user feedback
- **Automatic navigation** after successful creation

## 🔄 Data Flow

1. **Component mounts** → Hook initializes with default params
2. **Filters change** → Hook triggers API call with new params
3. **API responds** → Hook updates state with new data
4. **UI re-renders** → Component displays new data with loading states

## 🛠️ Configuration

### Environment Variables
```bash
# Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:3001/api

# Backend (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/crm_ticketing
PORT=3001
NODE_ENV=development
```

### CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:3000` (Vite default)
- `http://localhost:5173` (Vite alternative)

## 🧪 Testing the Integration

### 1. Test API Connection
```bash
# Check if backend is running
curl http://localhost:3001/health

# Expected response:
# {"status":"OK","timestamp":"2025-01-XX..."}
```

### 2. Test Frontend
1. Open `http://localhost:5173`
2. Try creating a ticket
3. Test filtering and pagination
4. Test CSV export

### 3. Test Backend API
```bash
cd backend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend

2. **API Connection Failed**
   - Verify backend is running: `curl http://localhost:3001/health`
   - Check API URL in frontend environment

3. **Database Connection**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend .env
   - Run `npm run db:push` to create tables

4. **Type Errors**
   - Ensure all dependencies are installed
   - Check TypeScript configuration

### Debug Mode
Enable debug logging by setting:
```bash
# In frontend .env.local
VITE_DEBUG=true
```

## 📊 Performance Features

- **Debounced API calls** to prevent excessive requests
- **Optimistic updates** for better UX
- **Error boundaries** for graceful error handling
- **Loading states** for all async operations
- **Server-side pagination** for large datasets

## 🔒 Security Features

- **Input validation** on both frontend and backend
- **Rate limiting** on API endpoints
- **CORS protection** with specific origins
- **Error sanitization** to prevent information leakage

## 🚀 Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
npm run build
npm start
# Or use Docker with provided docker-compose.yml
```

## 📝 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets` | Get tickets with filters |
| GET | `/api/tickets/export` | Export tickets as CSV |
| GET | `/health` | Health check |

## 🎯 Next Steps

1. **Add authentication** for user management
2. **Implement real-time updates** with WebSockets
3. **Add advanced filtering** options
4. **Implement ticket status management**
5. **Add data visualization** and analytics
