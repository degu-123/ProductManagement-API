const fs=require('fs');
const path=require('path');
const User=require('../models/userModel');
const AppError=require('../utils/AppError');
const {comparePassword}=require('../utils/token');
async function viewUser(req,res,next){
  try{
  const user=req.user;
  if(!user)return next(new AppError('user does not exists',404));
 if(user.isBanned)return next(new AppError('Account is banned',403));
 user.password = undefined;
  res.status(200).json({
    message:'WelCome to your profile page',
    data:user
  })
  }
  catch(err){
    next(err)
  }
}

async function updateProfile(req,res,next){
  try{
const user=req.user
if(!user)return next(new AppError('No usre found',404));
const allowedfields=['name','email','phone'];
allowedfields.forEach(field=>{
  if(req.body[field]!==undefined){
    user[field]=req.body[field]
  }
});
if(allowedfields.every(field=>req.body[field]===undefined))return next(new AppError('No valid fields to update',400));
 await user.save();
  res.status(200).json({
    message:'User updated successfully',
    data:user
  })
  }
  catch(err){
    next(err)
  }
}
async function banUser(req,res,next){
  try{
  const {id}=req.params;
  const user=await User.findByIdAndUpdate(id,{isBanned:true},{new:true});
  if(!user)return next(new AppError('No user is exists',404));
  res.status(200).json({
    message:'User banned temporarely',
  });
  }
  catch(err){
    next(err)
  }
}
async function updatePassword(req,res,next){
  try{
    const user=await User.findById(req.user.id).select('+password')
    if(!user)return next(new AppError('no user exists',404));
    const {currentPassword,newPassword}=req.body;
    if(!currentPassword||!newPassword)return next(new AppError('current password and new password required ',400));
    const isMatch=await comparePassword(currentPassword,user.password);
if(!isMatch)return next(new AppError('current password is incorrect',401));
 user.password=newPassword;
    await user.save();
    res.status(200).json({
      message:'password updated successfully'
    })
  }
  catch(err){
    next(err)
  }
}
async function makeOwner(req, res, next) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'owner' },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    message: 'User promoted to be shareholder',
    user
  });
}

module.exports={viewUser,updateProfile,
banUser,updatePassword,makeOwner};