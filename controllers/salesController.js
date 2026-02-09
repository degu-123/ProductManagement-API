const Product=require('../models/productModel');
const Sale=require('../models/saleModel');
const AppError=require('../utils/AppError');
const logger=require('../utils/logger');
const {startOfDay,endOfDay}=require('../utils/date');

async function salesProduct(req,res,next){
  try{
  const quantity=Number(req.body.quantity);
  const price=req.body.sellingPrice;
  const {sku}=req.params;
  if(!sku)return next(new AppError('Please choose product',400));
  if(!Number.isInteger(quantity) || quantity <= 0)return next(new AppError('Quantity must be posetive integer',400));
  const product=await Product.findOne({sku});
  if(!product)return next(new AppError('product is not exists',404));
  if(!product.isActive)return next(new AppError('product not permitted to be sold',403));
  if(product.stock < quantity)return next(new AppError(' Insufficient stock',400));
  product.stock -= quantity;
  
  const sellingPrice =
  price !== undefined ? Number(price) : product.sellingPrice;

if (sellingPrice <= 0)
  return next(new AppError('Invalid selling price', 400));
  const profit=(sellingPrice-product.costPrice)*quantity;
  await product.save();
  const sales=await Sale.create({
    product:product._id,
    quantity,
    sellingPrice,
    costPrice:product.costPrice,
    profit,
    soldBy:req.user.id
  });
  res.status(201).json({
    status:"success",
    message:"you sold successfully"
  });
  }catch(err){
    logger.error(err)
    next(err)
  }
}

async function getSalesRecords(req,res,next){
  try{
    const page=Math.max(parseInt(req.query.page)||1,1);
    const limit=Math.min(parseInt(req.query.limit)||5,50);
    const skip=(page-1)*limit;
    let filter={};
  if (req.query.from && isNaN(new Date(req.query.from))) {
  return next(new AppError('Invalid from date', 400));
}
if (req.query.to && isNaN(new Date(req.query.to))) {
  return next(new AppError('Invalid to date', 400));
}
    // 📅 Date range filter
    if (req.query.from || req.query.to) {
      filter.soldAt = {};
      if (req.query.from) {
        filter.soldAt.$gte = startOfDay(req.query.from);
      }
      if (req.query.to){
        filter.soldAt.$lte=endOfDay(req.query.to)
      }else if(req.query.from){
        filter.soldAt.$lte=endOfDay(new Date());
      }
      
    }
    
    const [sales,totalSales]=await Promise.all([
      Sale.find(filter)
      .populate('product','name category stock sku tags')
      .populate('soldBy','name email')
      .sort({soldAt:-1})
      .skip(skip)
      .limit(limit),
      Sale.countDocuments(filter)
      ]);
      
  const totalPages=Math.ceil(totalSales/limit);
  res.status(200).json({
      status: 'success',
      results: sales.length,
      pagination: {
        totalSales,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      sales
      })
  }catch(err){
    logger.error(err)
    next(err)
  }
}

module.exports={salesProduct,
  getSalesRecords
};