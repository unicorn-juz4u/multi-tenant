import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env.js';
import tenantPlugin from './plugins/tenantPlugin.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'User name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return in default queries
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: Email is unique per tenant
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// Apply tenant plugin
userSchema.plugin(tenantPlugin);

// Helper method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If passwordHash was not selected in query, retrieve it or ensure it exists
  const hash = this.passwordHash || (await this.constructor.findById(this._id).select('+passwordHash')).passwordHash;
  return bcrypt.compare(candidatePassword, hash);
};

// Static helper to hash passwords with cost 12
userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
};

export const User = mongoose.model('User', userSchema);
export default User;
