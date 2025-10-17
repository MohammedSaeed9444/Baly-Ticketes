import { useState, useEffect, useCallback } from 'react';
import { apiService, GetTicketsParams, CreateTicketRequest } from '@/services/api';
import { Ticket, apiTicketToTicket } from '@/types/ticket';
import { toast } from 'sonner';

export interface UseTicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalTickets: number;
    limit: number;
  };
}

export interface UseTicketsActions {
  loadTickets: (params?: GetTicketsParams) => Promise<void>;
  createTicket: (ticket: CreateTicketRequest) => Promise<boolean>;
  exportTickets: (params?: Omit<GetTicketsParams, 'page' | 'limit'>) => Promise<void>;
  deleteTicket: (ticketId: number) => Promise<boolean>;
  clearError: () => void;
}

export function useTickets(initialParams: GetTicketsParams = {}) {
  const [state, setState] = useState<UseTicketsState>({
    tickets: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 0,
      totalTickets: 0,
      limit: 20,
    },
  });

  const loadTickets = useCallback(async (params: GetTicketsParams = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.getTickets(params);
      
      setState(prev => ({
        ...prev,
        tickets: response.tickets.map(apiTicketToTicket),
        pagination: {
          page: response.page,
          totalPages: response.totalPages,
          totalTickets: response.totalTickets,
          limit: params.limit || prev.pagination.limit,
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tickets';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toast.error(errorMessage);
    }
  }, []);

  const createTicket = useCallback(async (ticketData: CreateTicketRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiService.createTicket(ticketData);
      toast.success('Ticket created successfully!');
      
      // Reload tickets to show the new one
      await loadTickets();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, [loadTickets]);

  const exportTickets = useCallback(async (params: Omit<GetTicketsParams, 'page' | 'limit'> = {}) => {
    try {
      const blob = await apiService.exportTickets(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date and filter info
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const reasonStr = params.reason ? params.reason.toLowerCase().replace(/\s+/g, '-') : 'all-reasons';
      const fromStr = params.start_date || 'all';
      const toStr = params.end_date || 'all';
      
      link.download = `tickets_${reasonStr}_${fromStr}_to_${toStr}_${dateStr}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tickets exported successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export tickets';
      toast.error(errorMessage);
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: number): Promise<boolean> => {
    try {
      await apiService.deleteTicket(ticketId);
      toast.success('Ticket deleted successfully!');
      
      // Reload tickets to reflect the deletion
      await loadTickets();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete ticket';
      toast.error(errorMessage);
      return false;
    }
  }, [loadTickets]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load tickets on mount with initial params
  useEffect(() => {
    loadTickets(initialParams);
  }, []); // Only run on mount

  return {
    ...state,
    loadTickets,
    createTicket,
    exportTickets,
    deleteTicket,
    clearError,
  };
}
