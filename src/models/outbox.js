import mongoose from "mongoose";

const OutboxSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    attachment: { type: Number },
    attachmentUrl: { type: String },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    destination: { type: String, required: true },
    intro: { type: String, required: true },
    outro: { type: String, required: true },
    sign: { type: String, required: true },
    contentType: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Outbox', OutboxSchema);