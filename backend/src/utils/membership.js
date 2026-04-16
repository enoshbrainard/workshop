const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");

const objectId = (value) => new mongoose.Types.ObjectId(value);

const syncTeamMembership = async ({ userId, newTeamId, oldTeamId = null }) => {
  if (oldTeamId && String(oldTeamId) !== String(newTeamId || "")) {
    await Team.findByIdAndUpdate(oldTeamId, {
      $pull: { members: objectId(userId) }
    });
  }

  if (newTeamId) {
    await Team.findByIdAndUpdate(newTeamId, {
      $addToSet: { members: objectId(userId) }
    });
  }
};

const ensureMembersMatchTeam = async (teamId, memberIds = []) => {
  const normalizedTeamId = objectId(teamId);
  const desiredIds = memberIds.map((memberId) => objectId(memberId));

  await User.updateMany(
    { teamId: normalizedTeamId, _id: { $nin: desiredIds } },
    { $set: { teamId: null } }
  );

  if (desiredIds.length) {
    await User.updateMany(
      { _id: { $in: desiredIds } },
      { $set: { teamId: normalizedTeamId } }
    );
  }
};

module.exports = {
  syncTeamMembership,
  ensureMembersMatchTeam
};
