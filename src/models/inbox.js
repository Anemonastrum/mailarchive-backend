import mongoose from "mongoose";

const InboxSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    attachment: { type: Number },
    attachmentUrls: [{ type: String }],
    category: { type: String, required: true },
    date: { type: Date, required: true },
    recievedDate: { type: Date, required: true },
    origin: { type: String, required: true },
    summary: { type: String, required: true },
    status: { type: String, required: true, default: 'wait' },
    action: { type: String },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Inbox', InboxSchema);