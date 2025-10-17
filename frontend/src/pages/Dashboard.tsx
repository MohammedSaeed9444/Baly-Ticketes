import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTickets } from "@/hooks/useTickets";
import { Ticket, TicketReason } from "@/types/ticket";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFilterFrom, setDateFilterFrom] = useState<Date | undefined>(undefined);
  const [dateFilterTo, setDateFilterTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Use the tickets hook with API integration
  const {
    tickets,
    loading,
    error,
    pagination,
    loadTickets,
    exportTickets,
    deleteTicket,
    clearError,
  } = useTickets({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const getPriorityOrder = (reason: TicketReason): number => {
    const order: Record<TicketReason, number> = {
      "Harassment": 1,
      "Took extra money": 2,
      "Bad behavior": 3,
      "Drop": 4,
    };
    return order[reason];
  };

  const getPriorityVariant = (reason: TicketReason) => {
    switch (reason) {
      case "Harassment":
        return "destructive";
      case "Took extra money":
        return "default";
      case "Bad behavior":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Load tickets when filters change
  useEffect(() => {
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (reasonFilter !== "all") {
      params.reason = reasonFilter;
    }

    if (dateFilterFrom) {
      params.start_date = format(dateFilterFrom, "yyyy-MM-dd");
    }

    if (dateFilterTo) {
      params.end_date = format(dateFilterTo, "yyyy-MM-dd");
    }

    loadTickets(params);
  }, [reasonFilter, dateFilterFrom, dateFilterTo, currentPage, loadTickets]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReasonFilterChange = (value: string) => {
    setReasonFilter(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFilterFrom(date);
    setCurrentPage(1);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateFilterTo(date);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setDateFilterFrom(undefined);
    setDateFilterTo(undefined);
    setCurrentPage(1);
  };

  const handleExportToCSV = () => {
    const params: any = {};

    if (reasonFilter !== "all") {
      params.reason = reasonFilter;
    }

    if (dateFilterFrom) {
      params.start_date = format(dateFilterFrom, "yyyy-MM-dd");
    }

    if (dateFilterTo) {
      params.end_date = format(dateFilterTo, "yyyy-MM-dd");
    }

    exportTickets(params);
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      await deleteTicket(ticketId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ticket Dashboard</h2>
          <p className="text-muted-foreground mt-1">View and manage all support tickets</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {pagination.totalTickets} {pagination.totalTickets === 1 ? 'Ticket' : 'Tickets'}
        </Badge>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Sorted by creation date (newest first)</CardDescription>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="w-64">
                <Select value={reasonFilter} onValueChange={handleReasonFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Took extra money">Took extra money</SelectItem>
                    <SelectItem value="Bad behavior">Bad behavior</SelectItem>
                    <SelectItem value="Drop">Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-48 justify-start text-left font-normal",
                      !dateFilterFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilterFrom ? format(dateFilterFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilterFrom}
                    onSelect={handleDateFromChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-48 justify-start text-left font-normal",
                      !dateFilterTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilterTo ? format(dateFilterTo, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilterTo}
                    onSelect={handleDateToChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {(dateFilterFrom || dateFilterTo) && (
                <Button
                  variant="ghost"
                  onClick={clearDateFilters}
                >
                  Clear Dates
                </Button>
              )}
              <Button
                onClick={handleExportToCSV}
                disabled={loading || pagination.totalTickets === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button variant="outline" size="sm" className="ml-2" onClick={clearError}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No tickets found</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first ticket to get started</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Trip Date</TableHead>
                    <TableHead className="font-semibold">Driver ID</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">City</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Agent</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{ticket.id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{ticket.tripId}</TableCell>
                      <TableCell>{format(ticket.tripDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{ticket.driverId}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.reason)}>
                          {ticket.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.serviceType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{ticket.customerPhone}</TableCell>
                      <TableCell>{ticket.agentName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(ticket.createdAt, "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {tickets.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalTickets)} of {pagination.totalTickets} tickets
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      className={cn(
                        pagination.page === 1 && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm px-4">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      className={cn(
                        pagination.page === pagination.totalPages && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
