const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/
    },
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    productivityScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    collaborationScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    qualityScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    goalsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    goalsCommitted: {
      type: Number,
      default: 0,
      min: 0
    },
    summary: {
      type: String,
      trim: true,
      default: ""
    },
    strengths: {
      type: [String],
      default: []
    },
    improvementAreas: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

performanceSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Performance", performanceSchema);
