const express = require("express");
const UserRouter = express.Router();
const { signup, signin, verifyUserToken,SaveCurrentUser, CreateAThrift, FindExistingThrift, GetMembers, AddUserToGroup, InitiatePayment, paymentNotifications} = require("../controllers/UserController");
// cpaymentNotificationsonst isAuthenticated = require("../MiddleWares/AuthenticateUser");

UserRouter.post("/signup", signup);
UserRouter.post("/signin", signin);
UserRouter.get("/SaveCurrentUser", SaveCurrentUser);
UserRouter.post("/CreateThrift", verifyUserToken, CreateAThrift);
UserRouter.get("/ExistingThrift", verifyUserToken, FindExistingThrift);
UserRouter.post("/getMembers", verifyUserToken, GetMembers);
UserRouter.post("/addusers", verifyUserToken, AddUserToGroup);
UserRouter.post("/InitiatePayment", InitiatePayment);
UserRouter.get("/Notification", paymentNotifications);

module.exports = UserRouter;