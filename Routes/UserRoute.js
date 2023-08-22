const express = require("express");
const UserRouter = express.Router();
const { signup, signin, verifyUserToken,SaveCurrentUser, CreateAThrift, FindExistingThrift, GetMembers, AddUserToGroup, InitiatePayment, getPayments} = require("../controllers/UserController");
// const isAuthenticated = require("../MiddleWares/AuthenticateUser");

UserRouter.post("/signup", signup);
UserRouter.post("/signin", signin);
UserRouter.get("/SaveCurrentUser", SaveCurrentUser);
UserRouter.post("/CreateThrift", verifyUserToken, CreateAThrift);
UserRouter.get("/ExistingThrift", verifyUserToken, FindExistingThrift);
UserRouter.post("/getMembers", verifyUserToken, GetMembers);
UserRouter.post("/addusers", verifyUserToken, AddUserToGroup);
UserRouter.post("/InitiatePayment", InitiatePayment);
UserRouter.get("/getPayment", getPayments);

module.exports = UserRouter;