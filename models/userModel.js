const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
 email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
 password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
 role: {
    type: String,
    enum: ['owner', 'staff'],
    default: 'owner'
  },
 isBanned: {
    type: Boolean,
    default: false
  },
 refreshToken: {
    type: String,
    select: false
  },
 passwordChangedAt: Date
}, { timestamps: true });

/* 🔐 Hash password */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* 🔄 Password change tracking */
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.passwordChangedAfter = function (iat) {
  if (!this.passwordChangedAt) return false;
  return iat < Math.floor(this.passwordChangedAt.getTime() / 1000);
};

module.exports = mongoose.model('User', userSchema);