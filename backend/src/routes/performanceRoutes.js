const express = require("express");
const {
  getPerformances,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
} = require("../controllers/performanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getPerformances).post(authorize("Admin", "Manager"), createPerformance);

router
  .route("/:id")
  .get(getPerformanceById)
  .put(authorize("Admin", "Manager"), updatePerformance)
  .delete(authorize("Admin", "Manager"), deletePerformance);

module.exports = router;
