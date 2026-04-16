const Team = require("../models/Team");
const Achievement = require("../models/Achievement");
const asyncHandler = require("../utils/asyncHandler");
const {
  membersPerTeamPipeline,
  monthlyAchievementsPerTeamPipeline,
  managerNotColocatedPipeline,
  managerNonDirectStaffPipeline,
  nonDirectStaffRatioAbove20Pipeline,
  reportingToOrganizationLeaderPipeline
} = require("../utils/analyticsQueries");

const formatTeamSummary = (team) => ({
  _id: team._id,
  name: team.name,
  location: team.location || "",
  manager: team.manager
    ? {
        _id: team.manager._id,
        name: team.manager.name,
        location: team.manager.location || "",
        isDirectStaff: team.manager.isDirectStaff
      }
    : null,
  organizationLeader: team.organizationLeader
    ? {
        _id: team.organizationLeader._id,
        name: team.organizationLeader.name
      }
    : null,
  members: (team.memberDocs || []).map((member) => ({
    _id: member._id,
    name: member.name,
    location: member.location || "",
    isDirectStaff: member.isDirectStaff
  })),
  totalMembers: team.totalMembers ?? team.memberDocs?.length ?? 0,
  nonDirectStaff: team.nonDirectStaff ?? 0,
  nonDirectStaffRatio:
    typeof team.nonDirectStaffRatio === "number"
      ? Number(team.nonDirectStaffRatio.toFixed(2))
      : undefined
});

const enrichTeamPipeline = (basePipeline) => [
  ...basePipeline,
  {
    $lookup: {
      from: "users",
      localField: "managerId",
      foreignField: "_id",
      as: "manager"
    }
  },
  {
    $unwind: {
      path: "$manager",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "organizationLeaderId",
      foreignField: "_id",
      as: "organizationLeader"
    }
  },
  {
    $unwind: {
      path: "$organizationLeader",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "members",
      foreignField: "_id",
      as: "memberDocs"
    }
  },
  {
    $addFields: {
      totalMembers: { $size: "$memberDocs" },
      nonDirectStaff: {
        $size: {
          $filter: {
            input: "$memberDocs",
            as: "member",
            cond: { $eq: ["$$member.isDirectStaff", false] }
          }
        }
      }
    }
  },
  {
    $addFields: {
      nonDirectStaffRatio: {
        $cond: [
          { $eq: ["$totalMembers", 0] },
          0,
          { $divide: ["$nonDirectStaff", "$totalMembers"] }
        ]
      }
    }
  }
];

const getDashboardAnalytics = asyncHandler(async (_req, res) => {
  const [
    membersPerTeam,
    teamLocations,
    monthlyAchievements,
    managerNotColocatedTeams,
    managerNonDirectStaffTeams,
    nonDirectStaffRatioAbove20Teams,
    reportingToOrganizationLeaderTeams
  ] = await Promise.all([
    Team.aggregate(membersPerTeamPipeline()),
    Team.find({}).select("name location").lean(),
    Achievement.aggregate(monthlyAchievementsPerTeamPipeline()),
    Team.aggregate(enrichTeamPipeline(managerNotColocatedPipeline())),
    Team.aggregate(enrichTeamPipeline(managerNonDirectStaffPipeline())),
    Team.aggregate(enrichTeamPipeline(nonDirectStaffRatioAbove20Pipeline())),
    Team.aggregate(enrichTeamPipeline(reportingToOrganizationLeaderPipeline()))
  ]);

  res.json({
    success: true,
    data: {
      membersPerTeam,
      teamLocations,
      monthlyAchievements,
      managerNotColocatedCount: managerNotColocatedTeams.length,
      managerNotColocatedTeams: managerNotColocatedTeams.map(formatTeamSummary),
      managerNonDirectStaffCount: managerNonDirectStaffTeams.length,
      managerNonDirectStaffTeams: managerNonDirectStaffTeams.map(formatTeamSummary),
      nonDirectStaffRatioAbove20Count: nonDirectStaffRatioAbove20Teams.length,
      nonDirectStaffRatioAbove20Teams: nonDirectStaffRatioAbove20Teams.map(formatTeamSummary),
      reportingToOrganizationLeaderCount: reportingToOrganizationLeaderTeams.length,
      reportingToOrganizationLeaderTeams: reportingToOrganizationLeaderTeams.map(formatTeamSummary)
    }
  });
});

const getMembersOfEachTeam = asyncHandler(async (_req, res) => {
  const data = await Team.aggregate(membersPerTeamPipeline());

  res.json({ success: true, data });
});

const getTeamLocations = asyncHandler(async (_req, res) => {
  const data = await Team.find({}).select("name location").lean();
  res.json({ success: true, data });
});

const getMonthlyAchievementsPerTeam = asyncHandler(async (_req, res) => {
  const data = await Achievement.aggregate(monthlyAchievementsPerTeamPipeline());

  res.json({ success: true, data });
});

const getManagerNotColocatedCount = asyncHandler(async (_req, res) => {
  const teams = await Team.aggregate(enrichTeamPipeline(managerNotColocatedPipeline()));

  res.json({ success: true, count: teams.length, data: teams.map(formatTeamSummary) });
});

const getManagerNonDirectStaffCount = asyncHandler(async (_req, res) => {
  const teams = await Team.aggregate(enrichTeamPipeline(managerNonDirectStaffPipeline()));

  res.json({ success: true, count: teams.length, data: teams.map(formatTeamSummary) });
});

const getNonDirectStaffRatioAbove20Count = asyncHandler(async (_req, res) => {
  const teams = await Team.aggregate(enrichTeamPipeline(nonDirectStaffRatioAbove20Pipeline()));

  res.json({ success: true, count: teams.length, data: teams.map(formatTeamSummary) });
});

const getReportingToOrganizationLeaderCount = asyncHandler(async (_req, res) => {
  const teams = await Team.aggregate(enrichTeamPipeline(reportingToOrganizationLeaderPipeline()));

  res.json({ success: true, count: teams.length, data: teams.map(formatTeamSummary) });
});

module.exports = {
  getDashboardAnalytics,
  getMembersOfEachTeam,
  getTeamLocations,
  getMonthlyAchievementsPerTeam,
  getManagerNotColocatedCount,
  getManagerNonDirectStaffCount,
  getNonDirectStaffRatioAbove20Count,
  getReportingToOrganizationLeaderCount
};
