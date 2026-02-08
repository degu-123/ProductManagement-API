const mongoose=require('mongoose');
const salesSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    sellingPrice: {
      type: Number,
      required: true
    },
    costPrice: {
      type: Number,
      required: true
    },

    profit: {
      type: Number,
      required: true
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    soldAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps:true
  }
);
const Sale=mongoose.model('Sale',salesSchema);
module.exports=Sale;