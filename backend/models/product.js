// models/Product.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    // unique identifier cho variant (tùy chọn)
    variantId: { type: String, required: true },

    // kích thước / phiên bản
    sizeCm: { type: Number, required: true, index: true }, // 3, 5, 10

    // giá cho size này (đơn vị: VND)
    price: { type: Number, required: true, min: 0 },

    // giá gốc nếu cần hiển thị giảm giá
    originalPrice: { type: Number, min: 0 },

    // danh sách ảnh ứng với size này
    images: [{ type: String }], // url hoặc path

    // tồn kho riêng cho mỗi size
    stock: { type: Number, default: 0, min: 0, index: true },

    // sku/barcode riêng theo size (tùy chọn)
    sku: { type: String, sparse: true },

    // trọng lượng/khối lượng riêng cho variant (grams)
    weightGrams: { type: Number, min: 0 },

    // flag/metadata
    status: { type: String, enum: ['active','out_of_stock','discontinued'], default: 'active' }
  },
  { _id: false } // không cần _id con, tùy bạn muốn hay không
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true },
    pokemon: { type: String, index: true },
    category: { type: String, index: true },
    description: { type: String, default: '' },

    // variants: embed tất cả variant (3cm,5cm,10cm)
    variants: { type: [VariantSchema], default: [] },

    // ảnh tổng (gallery) và thumbnail chung (không thay thế ảnh variant)
    images: [{ type: String }],
    thumbnail: String,

    // tổng quát (tính toán nhanh)
    minPrice: { type: Number, min: 0, index: true }, // cache giá nhỏ nhất giữa các variant
    maxPrice: { type: Number, min: 0, index: true }, // cache giá lớn nhất

    // thống kê
    stockTotal: { type: Number, default: 0, index: true },

    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* Indexes */
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', pokemon: 'text' });
ProductSchema.index({ 'variants.sizeCm': 1 }); // tìm theo kích thước nhanh

/* Virtual: list available sizes */
ProductSchema.virtual('availableSizes').get(function () {
  return (this.variants || []).filter(v => v.status === 'active' && v.stock > 0).map(v => v.sizeCm);
});

/* Pre-save hook: cập nhật minPrice/maxPrice/stockTotal */
ProductSchema.pre('save', function (next) {
  const variants = this.variants || [];
  if (variants.length) {
    this.minPrice = Math.min(...variants.map(v => v.price));
    this.maxPrice = Math.max(...variants.map(v => v.price));
    this.stockTotal = variants.reduce((s, v) => s + (v.stock || 0), 0);
  } else {
    this.minPrice = this.maxPrice = this.stockTotal = 0;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
