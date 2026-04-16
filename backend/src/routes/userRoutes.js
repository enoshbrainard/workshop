const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMyProfile
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", (req, res) => res.json({ success: true, data: req.user }));
router.put("/me", updateMyProfile);

router
  .route("/")
  .get(authorize("Admin"), getUsers)
  .post(authorize("Admin"), createUser);

router
  .route("/:id")
  .get(authorize("Admin"), getUserById)
  .put(authorize("Admin"), updateUser)
  .delete(authorize("Admin"), deleteUser);

module.exports = router;
