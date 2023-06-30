import express, {Router} from "express";
import {UserController} from "../controller/UserController";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const userController: UserController = new UserController();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/all-users", userController.getAllUsers);

router.put("/edit", validateBearerToken, userController.updateUser);
router.put("/update-password", validateBearerToken, userController.updatePassword);
router.post("/forgot-password", userController.forgotPassword);
router.put("/reset-password/:token", userController.resetPassword);
router.delete("/delete", validateBearerToken, userController.deleteUser);
router.get("/refresh", userController.handleRefreshToken);
router.post("/logout", userController.logoutUser)

// Admin routes.
router.get("/:id", validateBearerToken, verifyAdminRole, userController.getSingleUser);
router.post("/block-user/:id", validateBearerToken, verifyAdminRole, userController.blockUser)
router.post("/unblock-user/:id", validateBearerToken, verifyAdminRole, userController.unblockUser)

export default router;