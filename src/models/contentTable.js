import mongoose from "mongoose";

const OutboxListSchema = new mongoose.Schema({
    outbox: { type: mongoose.Schema.Types.ObjectId },
    column: { type: Number, required: true },
    rows: { type: Number, required: true },
    header: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Outbox', OutboxListSchema);