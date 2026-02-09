const express = require('express');
const router = express.Router();
const protectRoute=require('../middlewares/authMiddleware');
const restrictTo=require('../middlewares/roleMiddleware');

const {
  dailySalesReport,
  weeklySalesReport,monthlyProductReport}=require('../controllers/reportController');
  
  router.get('/daily',protectRoute,
  restrictTo('owner'),
  dailySalesReport);
  
  router.get('/weekly',protectRoute,
  restrictTo('owner'),
  weeklySalesReport);
  
  router.get('/:sku/monthly',protectRoute,
  restrictTo('owner'),
  monthlyProductReport);
  
  module.exports=router