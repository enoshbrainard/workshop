const express = require("express");
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTeams)
  .post(authorize("Admin", "Manager"), createTeam);

router
  .route("/:id")
  .get(getTeamById)
  .put(authorize("Admin", "Manager"), updateTeam)
  .delete(authorize("Admin", "Manager"), deleteTeam);

router.post("/:id/members", authorize("Admin", "Manager"), addTeamMember);
router.delete("/:id/members/:userId", authorize("Admin", "Manager"), removeTeamMember);

module.exports = router;
