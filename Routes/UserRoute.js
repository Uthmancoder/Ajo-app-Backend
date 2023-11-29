const express = require("express");
const UserRouter = express.Router();
const { signup, signin, CreateAThrift, FindExistingThrift, GetMembers, AddUserToGroup, EditProfile, changepassword, UpdateUsersWallet,getCurrentUpdate, PayThrift, WithdrawFunds,forgotPassword, ResetPassword, getGroupDetails} = require("../controllers/UserController");


UserRouter.post("/signup", signup);
UserRouter.post("/signin", signin);
UserRouter.post("/CreateThrift", CreateAThrift);
UserRouter.get("/ExistingThrift", FindExistingThrift);
UserRouter.post("/getMembers", GetMembers);
UserRouter.post("/addusers", AddUserToGroup);
UserRouter.post("/getData", getCurrentUpdate);
UserRouter.get("/getDetails/:id", getGroupDetails);
UserRouter.post("/updateWallet", UpdateUsersWallet); 
UserRouter.post("/editProfile", EditProfile);
UserRouter.post("/changePassword", changepassword);
UserRouter.post("/paythrift", PayThrift);
UserRouter.post("/withdraw", WithdrawFunds);
UserRouter.post("/forgotPassword", forgotPassword);
UserRouter.post("/resetPassword", ResetPassword);
module.exports = UserRouter;    