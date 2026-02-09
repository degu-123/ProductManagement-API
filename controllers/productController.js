const Product=require('../models/productModel');
const Sale=require('../models/saleModel');
const AppError=require('../utils/AppError');
const logger=require('../utils/logger');
const getStockAlerts = require('../services/stockAlertService');
const {generateProductDescription,generateProductTags,
  getEmbedding,
  cosineSimilarity
} = require("../services/aiService");
const rankProducts=require('../services/searchService');
const {summarizeSales,buildOwnerPrompt}=require('../utils/math');
const getAIStockAdvice=require('../services/aiStockAdvisor');


async function uploadProduct(req,res,next){
  try{
    if(!req.user)return next(new AppError('Authentication failed',401))
    const{name,category,
    costPrice,sellingPrice,
    stock}=req.body;
    if(name== null ||
    costPrice== null ||
    sellingPrice== null ||
    stock== null){
    return next(new AppError('Required fields are missing',400))
    }
    let product=await Product.findOne({name,category,owner:req.user.id})
    if(product)return next(new AppError('product already exists',400));
    
    if(sellingPrice < costPrice)return next(new AppError('sellingPrice can not less than cost price',400));
   product=await Product.create({
      name,
      category,
      costPrice,
      sellingPrice,
      stock,
      owner:req.user.id
    });

    const aiDescription = await generateProductDescription({name,
      category,
      sellingPrice
    });
    const aiTags = await generateProductTags({
      name,
      category,
      aiDescription
    });
  const embeddingText = `
      ${name}
      ${category}
      ${aiDescription}
      ${aiTags.join(" ")}
    `;

    const embedding = await getEmbedding(embeddingText);

   product.description=aiDescription;
   product.tags=aiTags;
   product.embedding=embedding;
   await product.save()

    res.status(201).json({
      message:'product created successfully ',
      product:product
    });
  }catch(err){
    logger.error(err);
    if (err.code === 11000) {
  return next(new AppError('Product already exists', 409));
}
next(err)
  }
}
async function updateProduct(req,res,next){
  try{
    if(!req.user)return next(new AppError('Authentication failed',401))
  const product=await Product.findOne({sku:req.params.sku});
  if(!product)return next(new AppError('No product is found',404));
  if(!product.owner.equals(req.user.id))return next(new AppError('Not allowed to update this product',403));
  const allowedFields=['name','category','costPrice','sellingPrice','stock'];
  let update=false;
  allowedFields.forEach(field=>{
    if(req.body[field]!==undefined){
      product[field]=req.body[field]
      update=true
    };
  })
  if(!update)return next(new AppError('No valid data to update',400));
  if(product.sellingPrice < product.costPrice)return next(new AppError('sellingPrice can not less than cost price',400));
  
  await product.save();
  res.status(200).json({
    message:'product updated successfully',
    product:product
  });
  }catch(err){
    logger.error(err);
    next(err)
  }
}
async function getProducts(req,res,next){
  try{
    const page=Math.max(parseInt(req.query.page)||1,1);
    const limit=Math.min(parseInt(req.query.limit)||10,50);
    const skip=(page-1)*limit;
    const filter={isActive:true}
    const [products,totalProducts]=await Promise.all([
      Product.find(filter)
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit),
      Product.countDocuments(filter)
      ]);
      const totalPages=Math.ceil(totalProducts/limit);
      res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      products
      })
  }catch(err){
    logger.error(err);
    next(err)
  }
}
async function getProduct(req,res,next){
  try{
    if(!req.params.sku)return next(new AppError('sku is required',400))
  const product=await Product.findOne({sku:req.params.sku});
  if(!product)return next(new AppError('product is not found',404));
  if(!product.isActive)return next(new AppError('product is temmporarely banned',403));
  res.status(200).json({
    message:'success',
    product:product
  })
  }catch(err){
    logger.error(err)
    next(err)
  }
}
async function deleteProduct(req,res,next){
  try{
  if(!req.params.sku)return next(new AppError('sku is required',400));
  const product=await Product.findOne({sku:req.params.sku});
  if(!product)return next(new AppError('product not exists',404));
  if(!product.owner.equals(req.user.id))return next(new AppError('User is forbidden to delete',403));
  if (!product.isActive)
      return next(new AppError('product already banned', 400));
  product.isActive=false;
  await product.save()
  res.status(200).json({
    status:"success",
    message:"product is banned successfully"
  })
  }catch(err){
    logger.error(err);
    next(err)
  }
}

async function stockAlert(req, res, next) {
  try {
    const {lowStock,outOfStock}= await getStockAlerts();
  if(lowStock.length===0&&outOfStock.length===0)return next(new AppError('No stock Alert in this moment',200));
    res.status(200).json({
      status: 'success',
     lowStockCount:lowStock.length,
      outOfStockCount:outOfStock.length,
      lowStock,
      outOfStock
    });
  } catch (err) {
    logger.error(err)
    next(err);
  }
}


async function rankedSearch(req, res,next) {
  try{
    
  const q = req.query.q?.toLowerCase().trim();
  if (!q) return next(new AppError('search query required',400));

  const tokens = q.split(" ");

  const products = await Product.find({
    tags: {
      $in: tokens.map(t => new RegExp(t, "i"))
    }
  });
  const ranked = rankProducts(products, tokens);

  res.status(200).json(ranked);
  }catch(err){
    next(err)
  }
}


 async function aiOwnerAdvice(req, res, next) {
  try {
    
    // 1️⃣ Fetch sales directly from DB
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const sales = await Sale.find({
      soldAt: { $gte: fromDate }
    }).populate("product");

    if (!sales.length) {
      return next(new AppError('No sales data available',404))
    }

    // 2️⃣ Summarize sales
    const summary = summarizeSales(sales);

    // 3️⃣ Build AI prompt
    const prompt = buildOwnerPrompt(summary);

    // 4️⃣ Ask AI
    const aiResult = await getAIStockAdvice(prompt);

    // 5️⃣ Return result
    res.json({
      period: "last 30 days",
      summary,
      aiAdvice: aiResult,
    });

  } catch (err) {
    logger.error(err);
    next(err);
  }
}
async function semanticSearch(req, res,next) {
  try{
  const query = req.query.q;
  if (!query)
    return next(new AppError('query is required'))
  // 1. Embed user query
  const queryEmbedding = await getEmbedding(query);
  // 2. Get all products with embeddings
  const products = await Product.find({ embedding: { $exists: true } });
  // 3. Rank by similarity
  const results = products
    .map(p => ({
      product: p,
      score: cosineSimilarity(queryEmbedding, p.embedding),
    }))
    .filter(r => r.score > 0.3) // threshold
    .sort((a, b) => b.score - a.score);

  res.json({
    status:"success",
    results
  });
  }catch(err){
    logger.error(err)
    next(err)
  }
}

module.exports ={uploadProduct,
updateProduct,getProducts,
  getProduct,deleteProduct,
  stockAlert,
  rankedSearch,
  aiOwnerAdvice,
  semanticSearch
};
