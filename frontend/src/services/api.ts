const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiTicket {
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
  tickets: ApiTicket[];
}

export interface GetTicketsParams {
  reason?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle CSV response
      if (response.headers.get('content-type')?.includes('text/csv')) {
        return response.blob() as unknown as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async createTicket(ticket: CreateTicketRequest): Promise<{ message: string; ticketId: number }> {
    return this.request<{ message: string; ticketId: number }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async getTickets(params: GetTicketsParams = {}): Promise<GetTicketsResponse> {
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

  async exportTickets(params: Omit<GetTicketsParams, 'page' | 'limit'> = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tickets/export?${queryString}` : '/tickets/export';
    
    return this.request<Blob>(endpoint);
  }

  async deleteTicket(ticketId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
