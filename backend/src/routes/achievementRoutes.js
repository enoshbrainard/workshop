const express = require("express");
const {
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement
} = require("../controllers/achievementController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAchievements)
  .post(authorize("Admin", "Manager"), createAchievement);

router
  .route("/:id")
  .get(getAchievementById)
  .put(authorize("Admin", "Manager"), updateAchievement)
  .delete(authorize("Admin", "Manager"), deleteAchievement);

module.exports = router;
