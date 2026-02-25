import { param, validationResult } from 'express-validator';

export const getMenuItemByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isUUID()
    .withMessage('Menu item ID must be a valid UUID')
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
