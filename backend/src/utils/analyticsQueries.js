const membersPerTeamPipeline = () => [
  {
    $lookup: {
      from: "users",
      localField: "members",
      foreignField: "_id",
      as: "memberDocs"
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      memberCount: { $size: "$memberDocs" },
      members: {
        $map: {
          input: "$memberDocs",
          as: "member",
          in: {
            _id: "$$member._id",
            name: "$$member.name",
            email: "$$member.email",
            location: "$$member.location",
            isDirectStaff: "$$member.isDirectStaff"
          }
        }
      }
    }
  }
];

const monthlyAchievementsPerTeamPipeline = () => [
  {
    $lookup: {
      from: "teams",
      localField: "teamId",
      foreignField: "_id",
      as: "team"
    }
  },
  { $unwind: "$team" },
  {
    $group: {
      _id: { teamId: "$teamId", month: "$month" },
      teamName: { $first: "$team.name" },
      achievements: {
        $push: {
          _id: "$_id",
          title: "$title",
          description: "$description",
          createdAt: "$createdAt"
        }
      },
      total: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      teamId: "$_id.teamId",
      month: "$_id.month",
      teamName: 1,
      total: 1,
      achievements: 1
    }
  },
  { $sort: { month: -1, teamName: 1 } }
];

const managerNotColocatedPipeline = () => [
  {
    $lookup: {
      from: "users",
      localField: "managerId",
      foreignField: "_id",
      as: "manager"
    }
  },
  { $unwind: "$manager" },
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
      membersDifferentLocation: {
        $size: {
          $filter: {
            input: "$memberDocs",
            as: "member",
            cond: { $ne: ["$$member.location", "$manager.location"] }
          }
        }
      }
    }
  },
  { $match: { membersDifferentLocation: { $gt: 0 } } }
];

const managerNonDirectStaffPipeline = () => [
  {
    $lookup: {
      from: "users",
      localField: "managerId",
      foreignField: "_id",
      as: "manager"
    }
  },
  { $unwind: "$manager" },
  { $match: { "manager.isDirectStaff": false } }
];

const nonDirectStaffRatioAbove20Pipeline = () => [
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
    $match: {
      $expr: {
        $gt: [
          {
            $cond: [
              { $eq: ["$totalMembers", 0] },
              0,
              { $divide: ["$nonDirectStaff", "$totalMembers"] }
            ]
          },
          0.2
        ]
      }
    }
  }
];

const reportingToOrganizationLeaderPipeline = () => [
  {
    $match: {
      organizationLeaderId: { $ne: null }
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
  }
];

module.exports = {
  membersPerTeamPipeline,
  monthlyAchievementsPerTeamPipeline,
  managerNotColocatedPipeline,
  managerNonDirectStaffPipeline,
  nonDirectStaffRatioAbove20Pipeline,
  reportingToOrganizationLeaderPipeline
};
