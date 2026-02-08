const logger=require('../utils/logger');
 function globalErrorMiddleware(err,req,res,next){
   const status=err.status||'error'
   const statusCode=err.statusCode||500
   if(err.isOperational){
     //custom error message
    res.status(statusCode).json({
       status,
       message:err.message,
       error:err.errors
     });
   }
   else{
     //program error
     logger.error(err);
      res.status(500).json({
       msg:"something went wrong!",
       status:"error"
     })
   }
 }
 module.exports=globalErrorMiddleware;