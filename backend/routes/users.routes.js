const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const { verifyToken } = require("../middlewares/auth");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validators/userValidator");

// Routes publiques
router.post("/", validate(createUserSchema), userController.createUser);
router.post("/login", userController.loginUser);
router.post("/google-login", userController.googleLogin);
router.post("/refresh-token", userController.refreshToken);
router.post("/:userId/activate", userController.activatePulsifyAccount);
router.post("/claim/:id", verifyToken, userController.claimAccount);

// Routes protégées
router.get("/", verifyToken, userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.put(
  "/:id",
  verifyToken,
  validate(updateUserSchema),
  userController.updateUser
);
router.delete("/:id", verifyToken, userController.deleteUser);
router.get("/:userId/analyses", verifyToken, userController.getUserAnalyses);
router.post("/:userId/analyses", verifyToken, userController.addUserAnalyse);
router.delete(
  "/:userId/analyses/:analyseId",
  verifyToken,
  userController.deleteUserAnalyse
);

// Routes pour les get
router.get("/pulsify-id/:id", verifyToken, userController.getPulsifyId);
router.get(
  "/:userId/activation-status",
  verifyToken,
  userController.getActivationStatus
);
router.get(
  "/:userId/my-music-sent",
  verifyToken,
  userController.getMyMusicSent
);
router.delete(
  "/:userId/my-music-sent/:songId",
  verifyToken,
  userController.deleteUserMusicSent
);

module.exports = router;
