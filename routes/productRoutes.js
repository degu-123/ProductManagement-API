const express=require('express');
const router=express.Router();
const {uploadProductValidation,updateProductValidation}=require('../middlewares/productValidate');
const {uploadProduct,updateProduct,getProduct,getProducts,
  deleteProduct,stockAlert,getAIProductDescription,getAIProductTags,rankedSearch
}=require('../controllers/productController');

const protectRoute=require('../middlewares/authMiddleware');
const restrictTo=require('../middlewares/roleMiddleware');

router.post('/',
protectRoute,restrictTo('owner'),
uploadProductValidation,uploadProduct);
router.delete('/:sku',protectRoute,restrictTo('owner'),deleteProduct)
router.get('/',getProducts);
router.get('/:sku',getProduct)
router.patch('/:sku',protectRoute,restrictTo('owner'),updateProductValidation,updateProduct);
router.get('/alerts/stock',protectRoute,stockAlert);
//ai created endpoints
router.get('/:id/ai-description',getAIProductDescription);
router.get('/:id/ai-tags',getAIProductTags)
router.get('/search/ranked',rankedSearch);
module.exports=router;