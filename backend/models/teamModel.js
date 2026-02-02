import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A team must have a name"],
      trim: true,
      maxlength: [20, "Team name must be less than 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [20, "Description must be less than 20 characters"],
    },
    image: {
      type: String,
      default: null,
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A team must have an admin"],
    },
    members: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: {
            values: ["Manager", "Member"],
            message: "Role must be either Manager or Member",
          },
          default: "Member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Index for faster queries
teamSchema.index({admin: 1});
teamSchema.index({"members.user": 1});

// Virtual for member count
teamSchema.virtual("memberCount").get(function () {
  return this.members ? this.members.length : 0;
});

// Method to check if user is admin
teamSchema.methods.isAdmin = function (userId) {
  return this.admin && this.admin.toString() === userId.toString();
};

// Method to check if user is member
teamSchema.methods.isMember = function (userId) {
  if (!this.members) return false;
  return this.members.some(
    (member) =>
      member && member.user && member.user.toString() === userId.toString(),
  );
};

// Method to get member role
teamSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString(),
  );
  return member ? member.role : null;
};

export const Team = mongoose.model("Team", teamSchema);
