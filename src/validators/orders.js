import { body, param, validationResult } from 'express-validator';

export const createOrderValidation = [
  body('customerName')
    .notEmpty()
    .withMessage('customerName is required')
    .isString()
    .withMessage('customerName must be a string')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('customerName must be between 1 and 120 characters'),
  
  body('address')
    .notEmpty()
    .withMessage('address is required')
    .isString()
    .withMessage('address must be a string')
    .trim(),
  
  body('phone')
    .notEmpty()
    .withMessage('phone is required')
    .isString()
    .withMessage('phone must be a string')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('phone must be between 1 and 20 characters'),
  
  body('totalAmount')
    .notEmpty()
    .withMessage('totalAmount is required')
    .isNumeric()
    .withMessage('totalAmount must be a number')
    .custom((value) => value >= 0)
    .withMessage('totalAmount must be greater than or equal to 0'),
  
  body('orderItems')
    .notEmpty()
    .withMessage('orderItems is required')
    .isArray({ min: 1 })
    .withMessage('orderItems must be a non-empty array'),
  
  body('orderItems.*.menuItemId')
    .notEmpty()
    .withMessage('menuItemId is required for each order item')
    .isUUID()
    .withMessage('menuItemId must be a valid UUID'),
  
  body('orderItems.*.quantity')
    .notEmpty()
    .withMessage('quantity is required for each order item')
    .isInt({ min: 1 })
    .withMessage('quantity must be an integer greater than 0'),
  
  body('orderItems.*.priceAtOrder')
    .notEmpty()
    .withMessage('priceAtOrder is required for each order item')
    .isNumeric()
    .withMessage('priceAtOrder must be a number')
    .custom((value) => value >= 0)
    .withMessage('priceAtOrder must be greater than or equal to 0'),
  
  body('status')
    .optional()
    .isString()
    .withMessage('status must be a string')
];

export const getOrderByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Order ID must be a valid UUID')
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};


export const updateOrderStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isString()
    .withMessage('status must be a string')
    .isIn(['Pending', 'Order Received', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'])
    .withMessage('status must be one of: Pending, Order Received, Preparing, Out for Delivery, Delivered, Cancelled')
];
