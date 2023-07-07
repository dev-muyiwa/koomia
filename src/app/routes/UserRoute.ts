import express, {Router} from "express";
import {userController} from "../controller/UserController";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";








const userRoute: Router = express.Router();

userRoute.use(validateBearerToken);
userRoute.get("/all", verifyAdminRole, userController.getAllUsers);
userRoute.get("/wishlist", userController.getWishlist);
userRoute.get("/cart", userController.getCart);
userRoute.get("/profile", userController.getUserProfile);
userRoute.get("/:id", verifyAdminRole, userController.getSingleUser);
userRoute.put("/edit-profile", userController.updateUser);
userRoute.put("/edit-password", userController.updatePassword);
userRoute.delete("/delete", verifyAdminRole, userController.deleteUser);
userRoute.post("/block/:id", verifyAdminRole, userController.blockUser);
userRoute.post("/unblock/:id", verifyAdminRole, userController.unblockUser);

export default userRoute;