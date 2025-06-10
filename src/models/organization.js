import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  number: { type: String, required: true },
  logo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  singleton: {
    type: Boolean,
    default: true,
    unique: true
  }
});

export default mongoose.model('Organization', OrganizationSchema);
