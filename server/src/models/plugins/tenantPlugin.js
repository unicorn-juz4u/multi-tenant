import mongoose from 'mongoose';

/**
 * Mongoose plugin to enforce tenant isolation.
 * Automatically adds tenantId to schema, adds .byTenant(tenantId) query helper,
 * and automatically injects tenantId when provided via query options:
 * Model.find().setOptions({ tenantId }) or Model.findOne().setOptions({ tenantId })
 */
export const tenantPlugin = (schema) => {
  if (!schema.path('tenantId')) {
    schema.add({
      tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: [true, 'tenantId is required for tenant isolation'],
        index: true,
      },
    });
  }

  // Query helper: Model.find().byTenant(tenantId)
  schema.query.byTenant = function (tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required for scoped queries');
    }
    return this.where({ tenantId });
  };

  // Hook into query execution to inject tenantId if provided in query options
  const queryOps = [
    'countDocuments',
    'deleteMany',
    'deleteOne',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndUpdate',
    'updateMany',
    'updateOne',
  ];

  queryOps.forEach((method) => {
    schema.pre(method, function () {
      const options = this.getOptions();
      if (options && options.tenantId) {
        this.where({ tenantId: options.tenantId });
      }
    });
  });

  // Pre-validate hook for documents to assign tenantId from $locals if provided
  schema.pre('validate', function (next) {
    if (this.isNew && !this.tenantId && this.$locals && this.$locals.tenantId) {
      this.tenantId = this.$locals.tenantId;
    }
    next();
  });
};

export default tenantPlugin;
