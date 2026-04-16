const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  teamId: user.teamId,
  location: user.location,
  isDirectStaff: user.isDirectStaff,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamId, location, isDirectStaff } = req.body;

  const existingUser = await User.findOne({ email: String(email).toLowerCase() });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    teamId: teamId || null,
    location,
    isDirectStaff
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const bootstrap = asyncHandler(async (req, res) => {
  const { name, email, password, location, isDirectStaff = true, setupKey } = req.body;
  const configuredSetupKey = process.env.BOOTSTRAP_SECRET;

  if (!configuredSetupKey) {
    const error = new Error("Bootstrap is not configured on this server");
    error.statusCode = 503;
    throw error;
  }

  if (setupKey !== configuredSetupKey) {
    const error = new Error("Invalid bootstrap secret");
    error.statusCode = 403;
    throw error;
  }

  const adminCount = await User.countDocuments({ role: "Admin" });
  if (adminCount > 0) {
    const error = new Error("Bootstrap is only available before the first admin is created");
    error.statusCode = 409;
    throw error;
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase() });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "Admin",
    teamId: null,
    location,
    isDirectStaff
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("teamId", "name location managerId");

  res.json({
    success: true,
    user: sanitizeUser(user),
    team: user.teamId
  });
});

module.exports = {
  login,
  register,
  bootstrap,
  getMe,
  sanitizeUser
};
