const AppError=require('../utils/AppError');
const {isStrongPassword}=require('../utils/passwordValidate');
const {body,validationResult}=require('express-validator');
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
const RegisterValidation=[
  body('name')
  .trim()
  .notEmpty()
  .withMessage('name is required')
  .isLength({min:3,max:30})
  .withMessage('name must b/n 3-30 charcters'),
  body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .normalizeEmail()
  .isEmail()
  .withMessage('Invalid email address'),
  body('password')
  .notEmpty()
  .withMessage('password is required')
  .isLength({min:8,max:100})
  .withMessage('password must contain at least 8 charcters')
  .custom(value=>{
    if(!isStrongPassword(value))throw new Error('password must contain lower,upper,number and special charcters');
    return true
  }),
  handleValidation
  ]
  const LoginValidation=[
  body('email')
  .trim()
  .notEmpty()
  .normalizeEmail()
  .isEmail(),
  body('password')
  .notEmpty(),
 (req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
    return next(new AppError('You Entered Invalid email or password',400));
    }
    next()
  }
 ] 
 
 module.exports={RegisterValidation,LoginValidation};