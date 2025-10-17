import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler.js';

// Validation rules for creating a ticket
export const validateCreateTicket = [
  body('tripId')
    .notEmpty()
    .withMessage('Trip ID is required')
    .isString()
    .withMessage('Trip ID must be a string'),
  
  body('tripDate')
    .notEmpty()
    .withMessage('Trip date is required')
    .isISO8601()
    .withMessage('Trip date must be a valid date'),
  
  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isInt({ min: 1 })
    .withMessage('Driver ID must be a positive integer'),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .withMessage('Reason must be a string'),
  
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isString()
    .withMessage('City must be a string'),
  
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isString()
    .withMessage('Service type must be a string'),
  
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .isString()
    .withMessage('Customer phone must be a string'),
  
  body('agentName')
    .notEmpty()
    .withMessage('Agent name is required')
    .isString()
    .withMessage('Agent name must be a string'),
];

// Validation rules for query parameters
export const validateGetTickets = [
  query('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Middleware to check validation results
export const checkValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw createError(`Validation failed: ${errorMessages.join(', ')}`, 400);
  }
  next();
};
