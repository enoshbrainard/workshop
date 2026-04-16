const express = require("express");
const {
  getDashboardAnalytics,
  getMembersOfEachTeam,
  getTeamLocations,
  getMonthlyAchievementsPerTeam,
  getManagerNotColocatedCount,
  getManagerNonDirectStaffCount,
  getNonDirectStaffRatioAbove20Count,
  getReportingToOrganizationLeaderCount
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/dashboard", getDashboardAnalytics);
router.get("/teams/members", getMembersOfEachTeam);
router.get("/teams/locations", getTeamLocations);
router.get("/teams/achievements/monthly", getMonthlyAchievementsPerTeam);
router.get("/teams/manager-not-colocated/count", getManagerNotColocatedCount);
router.get("/teams/manager-non-direct-staff/count", getManagerNonDirectStaffCount);
router.get("/teams/non-direct-staff-ratio-above-20/count", getNonDirectStaffRatioAbove20Count);
router.get("/teams/reporting-to-organization-leader/count", getReportingToOrganizationLeaderCount);

module.exports = router;
