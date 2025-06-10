import mongoose from "mongoose";

const OutboxListSchema = new mongoose.Schema({
    outbox: { type: mongoose.Schema.Types.ObjectId },
    length: { type: Number },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Outbox', OutboxListSchema);