const express = require("express");
const UserRouter = express.Router();
const { signup, signin, verifyUserToken,SaveCurrentUser, CreateAThrift, FindExistingThrift, GetMembers, AddUserToGroup, EditProfile, changepassword, UpdateUsersWallet,PayThrift} = require("../controllers/UserController");
// paymentNotificationsonst isAuthenticated = require("../MiddleWares/AuthenticateUser");

UserRouter.post("/signup", signup);
UserRouter.post("/signin", signin);
UserRouter.get("/SaveCurrentUser", SaveCurrentUser);
UserRouter.post("/CreateThrift", verifyUserToken, CreateAThrift);
UserRouter.get("/ExistingThrift", verifyUserToken, FindExistingThrift);
UserRouter.post("/getMembers", verifyUserToken, GetMembers);
UserRouter.post("/addusers", AddUserToGroup);
// UserRouter.post("/InitiatePayment", InitiatePayment);
UserRouter.post("/updateWallet", UpdateUsersWallet); 
UserRouter.post("/editProfile", EditProfile);
UserRouter.post("/changePassword", changepassword);
UserRouter.post("/paythrift", PayThrift);
module.exports = UserRouter;    