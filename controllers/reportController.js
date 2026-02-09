const Product = require('../models/productModel');
const Sale = require('../models/saleModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const {startOfWeek, startOfMonth, endOfMonth } = require('../utils/date');
const {getMaxBy,getMinBy}= require('../utils/math');

const startWeek=startOfWeek()
const startMonth=startOfMonth()
const endMonth=endOfMonth()

async function dailySalesReport(req,res,next){
  try{
function getLocalDate(offsetHours = 3) {
  const now = new Date();
  now.setHours(now.getHours() + offsetHours);
  return now;
}
const now = getLocalDate();
const startOfDay = new Date(now);
startOfDay.setHours(0,0,0,0);
  const productsReport=await Sale.aggregate([
    {
      $match:{
        soldAt:{ $gte:startOfDay,
        $lte:now }
      }
    },
    {
      $group:{
        _id:'$product',
        totalQuantity:{$sum:'$quantity'},
        totalProfit:{$sum:'$profit'}
      }
    },
    {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productName: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          totalProfit: 1
        }
      }
    ]);
    const totalProfit = productsReport.reduce(
      (sum, p) => sum + (p.totalProfit||0),
      0
    );
    if (productsReport.length === 0) {
  return res.status(200).json({
    status: 'success',
    date: startOfDay.toISOString().split('T')[0],
    products: [],
    highestSoldProduct: null,
    leastSoldProduct:null,
    highestProfitProduct: null,
    leastProfitProduct:null,
    totalProfit: 0
  });
}

const highestSoldProduct = getMaxBy(productsReport, 'totalQuantity');
const highestProfitProduct = getMaxBy(productsReport, 'totalProfit');
const leastSoldProduct=getMinBy(productsReport,'totalQuantity');
const leastProfitProduct=getMinBy(productsReport,'totalProfit');
   
    res.status(200).json({
      status: 'success',
      startDate: startOfDay.toISOString().split('T')[0],
      products: productsReport,
      highestSoldProduct,
      leastSoldProduct,
      highestProfitProduct,
      leastProfitProduct,
      totalProfit
    });
  }catch(err){
    logger.error(err)
    next(err)
  }
}

async function weeklySalesReport(req, res, next) {
  try {
    const now = new Date();

    const report = await Sale.aggregate([
      {
        $match: {
          soldAt: { $gte: startWeek, $lte: now }
        }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalProfit: { $sum: '$profit' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productName: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          totalProfit: 1
        }
      },

      // ⭐ THE MAGIC
      {
        $facet: {
          products: [],

          topSold: [
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
          ],

          leastSold: [
            { $sort: { totalQuantity: 1 } },
            { $limit: 3 }
          ],

          topProfit: [
            { $sort: { totalProfit: -1 } },
            { $limit: 3 }
          ],

          leastProfit: [
            { $sort: { totalProfit: 1 } },
            { $limit: 3 }
          ],

          totalProfit: [
            {
              $group: {
                _id: null,
                value: { $sum: '$totalProfit' }
              }
            }
          ]
        }
      }
    ]);

    const data = report[0];

    res.status(200).json({
      status: 'success',
      startDate: startWeek.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      products: data.products,
      topSoldProducts: data.topSold,
      leastSoldProducts: data.leastSold,
      topProfitProducts: data.topProfit,
      leastProfitProducts: data.leastProfit,
      totalProfit: data.totalProfit[0]?.value || 0
    });

  } catch (err) {
    logger.error(err);
    next(err);
  }
}
async function monthlyProductReport(req, res, next) {
  try {
    const { sku } = req.params;
    if (!sku) return next(new AppError('Please provide product SKU', 400));

    const product = await Product.findOne({ sku });
    if (!product) return next(new AppError('Product not found', 404));
    
    const salesReport = await Sale.aggregate([
      {
        $match: {
          product: product._id,
          soldAt: { $gte: startMonth, $lte: endMonth }
        }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalProfit: { $sum: '$profit' }
        }
      }
    ]);

    const totalQuantity = salesReport[0]?.totalQuantity || 0;
    const totalProfit = salesReport[0]?.totalProfit || 0;

    res.status(200).json({
      status: 'success',
      month: `${startMonth.toISOString().split('T')[0]} to ${endMonth.toISOString().split('T')[0]}`,
      product: {
        productName: product.name,
        sku: product.sku,
        totalQuantity,
        totalProfit
      }
    });

  } catch (err) {
    logger.error(err);
    next(err);
  }
}
module.exports={
  dailySalesReport,weeklySalesReport,monthlyProductReport};