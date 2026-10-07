/**
 * models/ChatHistory.js
 * ---------------------
 * Mongoose model for persisting AI agent chat conversations.
 * This is a NEW feature enabled by MongoDB — was not possible in the Python version.
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
  {
    conversation_id: { type: String, required: true, unique: true, index: true },
    messages: [messageSchema],
    query_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
