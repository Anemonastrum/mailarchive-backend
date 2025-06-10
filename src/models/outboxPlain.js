import mongoose from "mongoose";

const OutboxPlainSchema = new mongoose.Schema({
    outbox: { type: mongoose.Schema.Types.ObjectId },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Outbox', OutboxPlainSchema);