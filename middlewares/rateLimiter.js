const rateLimit=require('express-rate-limit');
const globalLimiter=rateLimit({
  windowMs:15*60*1000,
  max:100,
  message:'Too many requests try again later'
});
const loginLimiter=rateLimit({
  windowMs:15*60*1000,
  max:5,
  message:'Too many login attempts try again later'
});
module.exports={globalLimiter,loginLimiter};