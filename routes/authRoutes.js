const express=require('express');
const router=express.Router();
const {Register_User,
Login_User,refreshAccessToken,
logout}=require('../controllers/authController');

const {RegisterValidation,LoginValidation}=require('../middlewares/authValidate');

const {loginLimiter}=require('../middlewares/rateLimiter');
//create api endpoints
router.post('/register',RegisterValidation,
Register_User);

router.post('/login',loginLimiter,LoginValidation,Login_User);

router.post('/refresh-token',refreshAccessToken);
router.post('/logout',logout);

module.exports=router;