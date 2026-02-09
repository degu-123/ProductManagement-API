const AppError =require('../utils/AppError');
const logger=require('../utils/logger');
const User = require('../models/userModel');
const {comparePassword,generateAccessToken,generateRefreshToken,
  verifyRefreshToken,
  hashToken,compareToken
}=require('../utils/token');

async function Register_User(req,res,next){
  try{
  const {name,email,password}=req.body;
  const emailexists=await User.findOne({email});
  if(emailexists)return next(new AppError('email already exists',400));

  const user=await User.create({
    name,
    email,
   password
  });
  res.status(201).json({
    message:"you successfully registred",
    name:user.name,
    email:user.email,
    role:user.role
  })
  }
  catch(err){
    logger.error(err);
    next(err)
  }
}

async function Login_User(req,res,next){
  try{
  const {email,password}=req.body
  if(!email||!password)return next(new AppError('Email and password is required',400));
  const user=await User.findOne({email}).select('+password');
  if(!user)return next(new AppError('Invalid password or email',401));
  if (user.isBanned) {
  return next(new AppError('Account is banned', 403));
}
  const isMatch=await comparePassword(password,user.password);
  if(!isMatch)return next(new AppError('Invalid email or password',401));
  const accessToken=generateAccessToken(user);
  const refreshToken=generateRefreshToken(user);
  const hashedToken=await hashToken(refreshToken);
  user.refreshToken=hashedToken;
  await user.save();

  user.password = undefined

  res.status(200).json({
    message:'Well Come your page',
    accessToken:accessToken,
    refreshToken:refreshToken,
    user
  })
  }
  catch(err){
    logger.error(err);
    next(err)
  }
}
 async function refreshAccessToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
 if (!refreshToken) {
      return next(new AppError('Refresh token required', 400)); 
      }
  const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid refresh token', 401));
    }
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    if (!user.refreshToken) {
  return next(new AppError('No refresh token stored. Please login again.', 401));
}
  if (user.isBanned) {
      return next(new AppError('Account is banned', 403));
    }
    // Password changed after token issued?
    if (user.passwordChangedAfter(decoded.iat)) {
      return next(new AppError('Password changed recently, please login again', 401));
    }
    const isMatch=await compareToken(refreshToken,user.refreshToken);
    if(!isMatch)return next(new AppError('Invaid token sent',401));


   const newrefreshToken=generateRefreshToken(user);
  user.refreshToken=await hashToken(newrefreshToken);
  await user.save({validateBeforeSave: false})
  const accessToken = generateAccessToken(user);
 res.status(200).json({
      message: 'Access token refreshed successfully',
      accessToken:accessToken,
      refreshToken:newrefreshToken
    });
 } catch (err) {
   logger.error(err);
    next(err);
  }
}
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
if (!refreshToken) {
      return next(new AppError('Refresh token required', 400));
}
 const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid refresh token', 401));
    }
  const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
 const isMatch = await compareToken(refreshToken, user.refreshToken);
if (!isMatch) {
  return next(new AppError('Invalid refresh token', 401));
}
  // Invalidate refresh token
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      message: 'Logged out successfully'
    });
 } catch (err) {
   logger.error(err);
    next(err);
  }
}
module.exports={Register_User,Login_User,refreshAccessToken,logout};
