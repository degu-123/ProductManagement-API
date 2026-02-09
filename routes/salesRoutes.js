const express=require('express');
const router=express.Router();

const protectRoute=require('../middlewares/authMiddleware');
const restrictTo=require('../middlewares/roleMiddleware');

const {salesProduct,
  getSalesRecords
}=require('../controllers/salesController');

router.post('/:sku',protectRoute,salesProduct);

router.get('/',protectRoute,restrictTo('owner'),getSalesRecords);
module.exports=router