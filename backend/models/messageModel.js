import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "A message must have content"],
      trim: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A message must have a sender"],
    },
    team: {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
      required: [true, "A message must belong to a team"],
    },
    readBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Auto-add sender to readBy array when message is created
messageSchema.pre("save", async function () {
  if (this.isNew && this.sender) {
    // Only add sender to readBy if not already there
    const senderExists = this.readBy.some(
      (id) => id.toString() === this.sender.toString(),
    );
    if (!senderExists) {
      this.readBy.push(this.sender);
    }
  }
});

// Populate sender details when querying messages
messageSchema.pre(/^find/, async function () {
  this.populate({
    path: "sender",
    select: "name photo email",
  });
});

export const Message = mongoose.model("Message", messageSchema);
