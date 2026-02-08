const AppError=require('../utils/AppError');
const {body,param,validationResult}=require('express-validator');
const handleValidation = (req, res, next) => {
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(
      errors.array().map(err => err.msg),
      400
    ));
  }
  next();
};
const uploadProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Product name must be 3–20 characters'),

  body('costPrice')
    .notEmpty()
    .withMessage('Cost price is required')
    .isFloat({ gt: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ gt: 0 })
    .withMessage('Selling price must be a positive number'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('category can not be empty'),
    
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
    handleValidation
];
const updateProductValidation = [
  body('param')
  .optional()
  .trim()
  .notEmpty()
  .withMessage('sku is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('name must not be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('name cotain atleast 3 characters'),
    
 body('costPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('costPrice must be greater than zero'),
    
 body('sellingPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('sellingPrice must be greater than zero'),
    
 body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('stock must be 0 or posetive integer'),
    
 body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('category not be empty'),
 handleValidation
];
module.exports={uploadProductValidation,updateProductValidation};