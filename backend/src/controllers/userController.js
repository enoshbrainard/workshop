const User = require("../models/User");
const Team = require("../models/Team");
const Performance = require("../models/Performance");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("./authController");
const { syncTeamMembership } = require("../utils/membership");

const getUsers = asyncHandler(async (req, res) => {
  const { search, role, location, teamId } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (teamId) {
    query.teamId = teamId;
  }

  const users = await User.find(query)
    .populate("teamId", "name location")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users.map(sanitizeUser)
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("teamId", "name location");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: sanitizeUser(user) });
});

const createUser = asyncHandler(async (req, res) => {
  const { email, teamId } = req.body;

  const existingUser = await User.findOne({ email: String(email).toLowerCase() });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  if (teamId) {
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error("Assigned team not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const user = await User.create(req.body);
  await syncTeamMembership({ userId: user._id, newTeamId: user.teamId });

  res.status(201).json({ success: true, data: sanitizeUser(user) });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const oldTeamId = user.teamId;
  const allowedFields = ["name", "email", "role", "teamId", "location", "isDirectStaff", "password"];

  allowedFields.forEach((field) => {
    if (field in req.body) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  await syncTeamMembership({
    userId: user._id,
    newTeamId: user.teamId,
    oldTeamId
  });

  res.json({ success: true, data: sanitizeUser(user) });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await syncTeamMembership({
    userId: user._id,
    newTeamId: null,
    oldTeamId: user.teamId
  });

  await Team.updateMany({ members: user._id }, { $pull: { members: user._id } });
  await Team.updateMany(
    { managerId: user._id },
    { $unset: { managerId: 1 } }
  );
  await Team.updateMany(
    { organizationLeaderId: user._id },
    { $unset: { organizationLeaderId: 1 } }
  );
  await Performance.deleteMany({
    $or: [{ employeeId: user._id }, { reviewerId: user._id }]
  });

  await user.deleteOne();

  res.json({ success: true, message: "User deleted successfully" });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const allowedFields = ["name", "email", "location", "password", "isDirectStaff"];

  allowedFields.forEach((field) => {
    if (field in req.body) {
      user[field] = req.body[field];
    }
  });

  await user.save();

  res.json({ success: true, data: sanitizeUser(user) });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMyProfile
};
