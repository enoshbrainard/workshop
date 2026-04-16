const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Team = require("../models/Team");
const Achievement = require("../models/Achievement");
const Performance = require("../models/Performance");

dotenv.config();

const seed = async () => {
  await connectDB();

  await Achievement.deleteMany();
  await Performance.deleteMany();
  await Team.deleteMany();
  await User.deleteMany();

  const [admin, managerOne, managerTwo, leader, employeeOne, employeeTwo, employeeThree] = await User.create([
    {
      name: "System Admin",
      email: "admin@example.com",
      password: "password123",
      role: "Admin",
      location: "New York",
      isDirectStaff: true
    },
    {
      name: "Mia Manager",
      email: "manager1@example.com",
      password: "password123",
      role: "Manager",
      location: "New York",
      isDirectStaff: true
    },
    {
      name: "Noah Manager",
      email: "manager2@example.com",
      password: "password123",
      role: "Manager",
      location: "Austin",
      isDirectStaff: false
    },
    {
      name: "Olivia Leader",
      email: "leader@example.com",
      password: "password123",
      role: "Employee",
      location: "Chicago",
      isDirectStaff: true
    },
    {
      name: "Ethan Employee",
      email: "employee1@example.com",
      password: "password123",
      role: "Employee",
      location: "New York",
      isDirectStaff: true
    },
    {
      name: "Ava Employee",
      email: "employee2@example.com",
      password: "password123",
      role: "Employee",
      location: "Boston",
      isDirectStaff: false
    },
    {
      name: "Liam Employee",
      email: "employee3@example.com",
      password: "password123",
      role: "Employee",
      location: "Austin",
      isDirectStaff: false
    }
  ]);

  const [teamAlpha, teamBeta] = await Team.create([
    {
      name: "Alpha Team",
      location: "New York",
      managerId: managerOne._id,
      members: [employeeOne._id, employeeTwo._id],
      organizationLeaderId: leader._id
    },
    {
      name: "Beta Team",
      location: "Austin",
      managerId: managerTwo._id,
      members: [employeeThree._id],
      organizationLeaderId: leader._id
    }
  ]);

  await User.findByIdAndUpdate(admin._id, { $set: { teamId: null } });
  await User.findByIdAndUpdate(employeeOne._id, { teamId: teamAlpha._id });
  await User.findByIdAndUpdate(employeeTwo._id, { teamId: teamAlpha._id });
  await User.findByIdAndUpdate(employeeThree._id, { teamId: teamBeta._id });

  await Achievement.create([
    {
      teamId: teamAlpha._id,
      title: "Delivered client dashboard",
      description: "Released analytics dashboard for the client.",
      month: "2026-04",
      createdBy: managerOne._id
    },
    {
      teamId: teamBeta._id,
      title: "Reduced support backlog",
      description: "Closed 42 pending issues in a month.",
      month: "2026-04",
      createdBy: managerTwo._id
    }
  ]);

  await Performance.create([
    {
      employeeId: employeeOne._id,
      reviewerId: managerOne._id,
      teamId: teamAlpha._id,
      month: "2026-04",
      overallScore: 5,
      productivityScore: 5,
      collaborationScore: 4,
      qualityScore: 5,
      goalsCompleted: 6,
      goalsCommitted: 6,
      summary: "Delivered analytics modules on time and supported rollout smoothly.",
      strengths: ["Delivery ownership", "Client communication"],
      improvementAreas: ["Document more implementation details"]
    },
    {
      employeeId: employeeTwo._id,
      reviewerId: managerOne._id,
      teamId: teamAlpha._id,
      month: "2026-04",
      overallScore: 3,
      productivityScore: 3,
      collaborationScore: 4,
      qualityScore: 3,
      goalsCompleted: 3,
      goalsCommitted: 5,
      summary: "Good collaboration with teammates and steady progress on assigned work.",
      strengths: ["Cross-team support"],
      improvementAreas: ["Close committed goals more consistently"]
    },
    {
      employeeId: employeeThree._id,
      reviewerId: managerTwo._id,
      teamId: teamBeta._id,
      month: "2026-04",
      overallScore: 4,
      productivityScore: 4,
      collaborationScore: 4,
      qualityScore: 4,
      goalsCompleted: 4,
      goalsCommitted: 5,
      summary: "Strong operational throughput and dependable issue resolution.",
      strengths: ["Issue handling", "Responsiveness"],
      improvementAreas: ["Increase automation coverage"]
    }
  ]);

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
