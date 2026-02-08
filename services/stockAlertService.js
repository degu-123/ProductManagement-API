const Product=require('../models/productModel');
async function getStockAlerts(){
  const lowStock=await Product.find({stock:{$gte:1,$lte:5}}).select('name sku stock')
  const outOfStock=await Product.find({stock:0}).select('name sku stock');
  return {
    lowStock,
    outOfStock
  }
}
module.exports=getStockAlerts;