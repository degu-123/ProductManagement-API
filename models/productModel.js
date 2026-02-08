const mongoose=require('mongoose');
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      unique: true
    },
    category: {
      type: String
    },
    description:String,
    tags:[String],
    costPrice: {
      type: Number,
      required: true
    },
    sellingPrice: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);
productSchema.index(
  { name: 1, category: 1,owner:1},
  { unique: true }
);
productSchema.pre('save', function () {
  if (this.sku) return;
const shortName = this.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  this.sku = `${this.category}-${shortName}-${this._id.toString().slice(-6)}`;
});
const Product=mongoose.model('Product',productSchema);
module.exports=Product;