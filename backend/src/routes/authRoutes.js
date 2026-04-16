const express = require("express");
const { login, register, bootstrap, getMe } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/bootstrap", bootstrap);
router.post("/register", protect, authorize("Admin"), register);
router.get("/me", protect, getMe);

module.exports = router;
