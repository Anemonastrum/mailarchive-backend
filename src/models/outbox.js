import mongoose from "mongoose";

const OutboxSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    attachment: { type: Number },
    attachmentUrls: [{ type: String }],
    category: { type: String, required: true },
    date: { type: Date, required: true },
    destination: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    sign: { type: String, required: true },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Outbox', OutboxSchema);