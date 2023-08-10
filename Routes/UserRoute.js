const express = require("express");
const UserRouter = express.Router();
const { signup, signin, verifyUserToken,SaveCurrentUser, CreateAThrift, FindExistingThrift, GetMembers, AddUserToGroup, InitiatePayment} = require("../controllers/UserController");
// const isAuthenticated = require("../MiddleWares/AuthenticateUser");

UserRouter.post("/signup", signup);
UserRouter.post("/signin", signin);
UserRouter.get("/SaveCurrentUser", SaveCurrentUser);
UserRouter.post("/CreateThrift", verifyUserToken, CreateAThrift);
UserRouter.get("/ExistingThrift", verifyUserToken, FindExistingThrift);
UserRouter.post("/getMembers", verifyUserToken, GetMembers);
UserRouter.post("/addusers", verifyUserToken, AddUserToGroup);
UserRouter.post("/InitiatePayment", InitiatePayment);

module.exports = UserRouter;


// you know the firstname and lastname is not relevant on the login but i still want to have access to the firstname and the lastname on the login so i can save it to localstorage and use n my dashboard