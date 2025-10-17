import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateCreateTicket, validateGetTickets, checkValidationErrors } from '../middleware/validation.js';
import { createError } from '../middleware/errorHandler.js';
import { Parser } from 'json2csv';

interface CreateTicketBody {
  tripId: string;
  tripDate: string;
  driverId: number;
  reason: string;
  city: string;
  serviceType: string;
  customerPhone: string;
  agentName: string;
}

interface GetTicketsQuery {
  reason?: string;
  start_date?: string;
  end_date?: string;
  page?: string;
  limit?: string;
}

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/tickets - Create a new ticket
router.post('/', validateCreateTicket, checkValidationErrors, async (req: Request<{}, {}, CreateTicketBody>, res: Response, next: NextFunction) => {
  try {
    const {
      tripId,
      tripDate,
      driverId,
      reason,
      city,
      serviceType,
      customerPhone,
      agentName
    } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        tripId,
        tripDate: new Date(tripDate),
        driverId,
        reason,
        city,
        serviceType,
        customerPhone,
        agentName
      }
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: ticket.id
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets - Get tickets with filtering and pagination
router.get('/', validateGetTickets, checkValidationErrors, async (req: Request<{}, {}, {}, GetTicketsQuery>, res: Response, next: NextFunction) => {
  try {
    const {
      reason,
      start_date,
      end_date,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {};

    if (reason) {
      where.reason = reason;
    }

    if (start_date && end_date) {
      where.tripDate = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string)
      };
    } else if (start_date) {
      const startDate = new Date(start_date as string);
      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.tripDate = {
        gte: startDate,
        lte: endOfDay
      };
    } else if (end_date) {
      const endDate = new Date(end_date as string);
      const startOfDay = new Date(endDate);
      startOfDay.setHours(0, 0, 0, 0);
      where.tripDate = {
        gte: startOfDay,
        lte: endDate
      };
    }

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({ where });

    // Get tickets with pagination
    const tickets = await prisma.ticket.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    });

    const totalPages = Math.ceil(totalTickets / limitNum);

    if (tickets.length === 0) {
      throw createError('No tickets found for given filters', 404);
    }

    res.json({
      page: pageNum,
      totalPages,
      totalTickets,
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        tripId: ticket.tripId,
        tripDate: ticket.tripDate.toISOString().split('T')[0],
        driverId: ticket.driverId,
        reason: ticket.reason,
        city: ticket.city,
        serviceType: ticket.serviceType,
        customerPhone: ticket.customerPhone,
        agentName: ticket.agentName,
        createdAt: ticket.createdAt.toISOString()
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/export - Export tickets as CSV
router.get('/export', validateGetTickets, checkValidationErrors, async (req: Request<{}, {}, {}, GetTicketsQuery>, res: Response, next: NextFunction) => {
  try {
    const { reason, start_date, end_date } = req.query;

    // Build where clause for filtering (same as GET /api/tickets)
    const where: any = {};

    if (reason) {
      where.reason = reason;
    }

    if (start_date && end_date) {
      where.tripDate = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string)
      };
    } else if (start_date) {
      const startDate = new Date(start_date as string);
      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.tripDate = {
        gte: startDate,
        lte: endOfDay
      };
    } else if (end_date) {
      const endDate = new Date(end_date as string);
      const startOfDay = new Date(endDate);
      startOfDay.setHours(0, 0, 0, 0);
      where.tripDate = {
        gte: startOfDay,
        lte: endDate
      };
    }

    // Get all tickets matching the filters (no pagination)
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (tickets.length === 0) {
      throw createError('No tickets found for given filters', 404);
    }

    // Prepare data for CSV export
    const csvData = tickets.map(ticket => ({
      id: ticket.id,
      tripId: ticket.tripId,
      tripDate: ticket.tripDate.toISOString().split('T')[0],
      driverId: ticket.driverId,
      reason: ticket.reason,
      city: ticket.city,
      serviceType: ticket.serviceType,
      customerPhone: ticket.customerPhone,
      agentName: ticket.agentName,
      createdAt: ticket.createdAt.toISOString()
    }));

    // Convert to CSV
    const fields = [
      'id',
      'tripId',
      'tripDate',
      'driverId',
      'reason',
      'city',
      'serviceType',
      'customerPhone',
      'agentName',
      'createdAt'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tickets.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tickets/:id - Delete a ticket
router.delete('/:id', async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id);

    if (isNaN(ticketId)) {
      throw createError('Invalid ticket ID', 400);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw createError('Ticket not found', 404);
    }

    await prisma.ticket.delete({
      where: { id: ticketId }
    });

    res.json({
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
