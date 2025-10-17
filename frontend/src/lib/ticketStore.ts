import { Ticket } from "@/types/ticket";

const STORAGE_KEY = "crm_tickets";

export const ticketStore = {
  getAll: (): Ticket[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((ticket: any) => ({
      ...ticket,
      tripDate: new Date(ticket.tripDate),
      createdAt: new Date(ticket.createdAt),
    }));
  },

  add: (ticket: Ticket): void => {
    const tickets = ticketStore.getAll();
    tickets.push(ticket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
