# Frontend Integration Example

This document shows how to integrate the React frontend with the backend API.

## API Service

Create `src/services/api.ts` in your React project:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export interface Ticket {
  id: number;
  tripId: string;
  tripDate: string;
  driverId: number;
  reason: string;
  city: string;
  serviceType: string;
  customerPhone: string;
  agentName: string;
  createdAt: string;
}

export interface CreateTicketRequest {
  tripId: string;
  tripDate: string;
  driverId: number;
  reason: string;
  city: string;
  serviceType: string;
  customerPhone: string;
  agentName: string;
}

export interface GetTicketsResponse {
  page: number;
  totalPages: number;
  totalTickets: number;
  tickets: Ticket[];
}

export interface GetTicketsParams {
  reason?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async createTicket(ticket: CreateTicketRequest) {
    return this.request<{ message: string; ticketId: number }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async getTickets(params: GetTicketsParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tickets?${queryString}` : '/tickets';
    
    return this.request<GetTicketsResponse>(endpoint);
  }

  async exportTickets(params: Omit<GetTicketsParams, 'page' | 'limit'> = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tickets/export?${queryString}` : '/tickets/export';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Export failed');
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
```

## Usage in React Components

### Create Ticket Component

```typescript
import React, { useState } from 'react';
import { apiService, CreateTicketRequest } from '../services/api';

export const CreateTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    tripId: '',
    tripDate: '',
    driverId: 0,
    reason: '',
    city: '',
    serviceType: '',
    customerPhone: '',
    agentName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiService.createTicket(formData);
      console.log('Ticket created:', result);
      // Reset form or show success message
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Show error message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Dashboard Component

```typescript
import React, { useState, useEffect } from 'react';
import { apiService, Ticket, GetTicketsParams } from '../services/api';

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<GetTicketsParams>({
    page: 1,
    limit: 20,
  });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTickets(filters);
      setTickets(response.tickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const handleExport = async () => {
    try {
      const blob = await apiService.exportTickets({
        reason: filters.reason,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tickets.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting tickets:', error);
    }
  };

  return (
    <div>
      {/* Filter controls */}
      {/* Tickets table */}
      {/* Export button */}
    </div>
  );
};
```

## Environment Configuration

Create `.env.local` in your React project:

```
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

Then update the API service:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
```

## CORS Configuration

The backend is already configured with CORS to allow requests from your React frontend. If you need to restrict it to specific origins, update the CORS configuration in `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true
}));
```
