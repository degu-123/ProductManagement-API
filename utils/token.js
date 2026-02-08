const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('../config/env');
async function hashToken(token){
  return await bcrypt.hash(token,10);
}
async function compareToken(token,hashedToken){
  return await bcrypt.compare(token,hashedToken);
}
function generateAccessToken(user){
  return jwt.sign({id:user._id},config.ACCESS_SECRET,{expiresIn:'1h'});
}
function generateRefreshToken(user){
  return jwt.sign({id:user._id,jti: crypto.randomUUID()},config.REFRESH_SECRET,{expiresIn:'7d'});
}
const verifyAccessToken=(accessToken)=>{
  const decoded=jwt.verify(accessToken,config.ACCESS_SECRET);
  return decoded
}
const verifyRefreshToken=(refreshToken)=>{
  const decoded=jwt.verify(refreshToken,config.REFRESH_SECRET);
  return decoded;
}
async function comparePassword(password,savedPassword){
  return await bcrypt.compare(password,savedPassword);
}
module.exports={generateAccessToken,generateRefreshToken,verifyAccessToken,
verifyRefreshToken,
comparePassword,
compareToken,
hashToken
}