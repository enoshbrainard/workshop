const Performance = require("../models/Performance");
const Team = require("../models/Team");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getScopedTeamIds = async (user) => {
  if (user.role === "Admin") {
    const teams = await Team.find({}).select("_id");
    return teams.map((team) => team._id);
  }

  if (user.role === "Manager") {
    const teams = await Team.find({ managerId: user._id }).select("_id");
    return teams.map((team) => team._id);
  }

  return user.teamId ? [user.teamId] : [];
};

const canManagePerformance = (user) => user.role === "Admin" || user.role === "Manager";

const parseListField = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getPerformances = asyncHandler(async (req, res) => {
  const { employeeId, month, teamId } = req.query;
  const scopedTeamIds = await getScopedTeamIds(req.user);
  const query = {
    teamId: { $in: scopedTeamIds }
  };

  if (req.user.role === "Employee") {
    query.employeeId = req.user._id;
  } else if (employeeId) {
    query.employeeId = employeeId;
  }

  if (month) {
    query.month = month;
  }

  if (teamId) {
    query.teamId = teamId;
  }

  const records = await Performance.find(query)
    .populate("employeeId", "name email location role")
    .populate("reviewerId", "name email role")
    .populate("teamId", "name location")
    .sort({ month: -1, createdAt: -1 });

  const summaryPipeline = [
    { $match: query },
    {
      $group: {
        _id: "$employeeId",
        averageScore: { $avg: "$overallScore" },
        totalReviews: { $sum: 1 },
        latestMonth: { $max: "$month" },
        totalGoalsCompleted: { $sum: "$goalsCompleted" },
        totalGoalsCommitted: { $sum: "$goalsCommitted" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "employee"
      }
    },
    { $unwind: "$employee" },
    {
      $project: {
        _id: 0,
        employeeId: "$employee._id",
        employeeName: "$employee.name",
        employeeEmail: "$employee.email",
        averageScore: { $round: ["$averageScore", 2] },
        totalReviews: 1,
        latestMonth: 1,
        totalGoalsCompleted: 1,
        totalGoalsCommitted: 1
      }
    },
    { $sort: { averageScore: -1, employeeName: 1 } }
  ];

  const summary = await Performance.aggregate(summaryPipeline);

  res.json({
    success: true,
    count: records.length,
    data: records,
    summary
  });
});

const getPerformanceById = asyncHandler(async (req, res) => {
  const record = await Performance.findById(req.params.id)
    .populate("employeeId", "name email location role teamId")
    .populate("reviewerId", "name email role")
    .populate("teamId", "name location managerId");

  if (!record) {
    const error = new Error("Performance record not found");
    error.statusCode = 404;
    throw error;
  }

  const scopedTeamIds = await getScopedTeamIds(req.user);
  if (!scopedTeamIds.some((teamId) => String(teamId) === String(record.teamId._id))) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (req.user.role === "Employee" && String(record.employeeId._id) !== String(req.user._id)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  res.json({ success: true, data: record });
});

const createPerformance = asyncHandler(async (req, res) => {
  if (!canManagePerformance(req.user)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const employee = await User.findById(req.body.employeeId);
  if (!employee || employee.role !== "Employee") {
    const error = new Error("Valid employee is required");
    error.statusCode = 400;
    throw error;
  }

  if (!employee.teamId) {
    const error = new Error("Employee must belong to a team");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.findById(employee.teamId);
  if (!team) {
    const error = new Error("Employee team not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === "Manager" && String(team.managerId) !== String(req.user._id)) {
    const error = new Error("Managers can only review their own team members");
    error.statusCode = 403;
    throw error;
  }

  const record = await Performance.create({
    employeeId: employee._id,
    reviewerId: req.user._id,
    teamId: team._id,
    month: req.body.month,
    overallScore: req.body.overallScore,
    productivityScore: req.body.productivityScore,
    collaborationScore: req.body.collaborationScore,
    qualityScore: req.body.qualityScore,
    goalsCompleted: req.body.goalsCompleted,
    goalsCommitted: req.body.goalsCommitted,
    summary: req.body.summary,
    strengths: parseListField(req.body.strengths),
    improvementAreas: parseListField(req.body.improvementAreas)
  });

  const populated = await Performance.findById(record._id)
    .populate("employeeId", "name email location role")
    .populate("reviewerId", "name email role")
    .populate("teamId", "name location");

  res.status(201).json({ success: true, data: populated });
});

const updatePerformance = asyncHandler(async (req, res) => {
  const record = await Performance.findById(req.params.id);

  if (!record) {
    const error = new Error("Performance record not found");
    error.statusCode = 404;
    throw error;
  }

  const team = await Team.findById(record.teamId);
  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === "Manager" && String(team.managerId) !== String(req.user._id)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (!canManagePerformance(req.user)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const fields = [
    "month",
    "overallScore",
    "productivityScore",
    "collaborationScore",
    "qualityScore",
    "goalsCompleted",
    "goalsCommitted",
    "summary"
  ];

  fields.forEach((field) => {
    if (field in req.body) {
      record[field] = req.body[field];
    }
  });

  if ("strengths" in req.body) {
    record.strengths = parseListField(req.body.strengths);
  }

  if ("improvementAreas" in req.body) {
    record.improvementAreas = parseListField(req.body.improvementAreas);
  }

  await record.save();

  const populated = await Performance.findById(record._id)
    .populate("employeeId", "name email location role")
    .populate("reviewerId", "name email role")
    .populate("teamId", "name location");

  res.json({ success: true, data: populated });
});

const deletePerformance = asyncHandler(async (req, res) => {
  const record = await Performance.findById(req.params.id);

  if (!record) {
    const error = new Error("Performance record not found");
    error.statusCode = 404;
    throw error;
  }

  const team = await Team.findById(record.teamId);
  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === "Manager" && String(team.managerId) !== String(req.user._id)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (!canManagePerformance(req.user)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  await record.deleteOne();

  res.json({ success: true, message: "Performance record deleted successfully" });
});

module.exports = {
  getPerformances,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
};
