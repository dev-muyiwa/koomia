import express, {Router} from "express";
import {checkAuthorizationToken, verifyAdminRole} from "../middlewares/auth";
import {
    blockUser,
    getUser,
    getUsers,
    unblockUser,
} from "../controller/AdminController";


const adminRouter: Router = express.Router();

adminRouter.use(checkAuthorizationToken, verifyAdminRole);

adminRouter.get("/users", getUsers);

adminRouter.route("/users/:userId")
    .get(getUser)
    .put(blockUser)
    .patch(unblockUser);

export default adminRouter;