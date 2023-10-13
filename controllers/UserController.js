const userModel = require("../Models/Usermodel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcryptjs = require("bcryptjs");
// const argon2 = require("argon2");
const ThriftModel = require("../Models/CreateThtift");
const { sendMail, ForgotPassword } = require("../Config/MyMailer");
const cloudinary = require("cloudinary").v2;
const { generateToken, verifyToken } = require("../Services/SessionService");
const axios = require("axios");
const { response } = require("express");
// const { default: Email } = require("next-auth/providers/email");

// sign up for a new account
const signup = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      confirmPassword,
      image,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).send({
        message: "All fields are required",
        status: false,
      });
    }
    console.log(req.body);
    const existingUser = await userModel.findOne({ email });
    const usernameExist = await userModel.findOne({ username });

    if (existingUser) {
      return res.status(400).send({
        message: "Email already exists",
        status: false,
      });
    } else if (usernameExist) {
      return res.status(400).send({
        message: "Username already in use",
        status: false,
      });
    }
    const hash = await bcryptjs.hash(password);
    const newUser = await userModel.create({
      firstname,
      lastname,
      username,
      email,
      password: hash,
      confirmPassword,
      image,
    });

    sendMail(email, username); // Make sure the sendMail function is imported

    return res.status(201).send({
      message: "Account created successfully!",
      status: true,
    });
  } catch (err) {
    console.log("Internal Server Error", err);
    next(err);
  }
};

// signin to your account
const signin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // console.log(password);
    const result = await userModel.findOne({
      $or: [{ username: username }, { email: email }],
    });
    // console.log(result);
    if (!result) {
      return res.status(404).send({
        message: "Account does not exist. Try creating one.",
        status: false,
      });
    }

    const passwordMatch = await bcryptjs.verify(result.password, password);
    // console.log(passwordMatch);
    if (!passwordMatch) {
      return res.status(400).send({
        message: "Invalid password",
        status: false,
      });
    }

    const token = generateToken(result.email);
    return res.status(200).send({
      message: `Hi ${result.username}, Welcome To Ultimate Microfinance Bank`,
      status: true,
      token,
      result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Verifying the user's token
const verifyUserToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(authHeader)

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).send({
  //     message: "Unauthorized Token",
  //     status: false,
  //   });
  // }
  if (typeof authHeader === "undefined")
    return res.status(404).send({ message: "User not found" });
  const token = authHeader.split(" ")[1];

  try {
    const email = verifyToken(token);
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).send({
        message: "This User is Unauthorized",
        status: false,
      });
    }

    // Attach the user object and email to the request object for later use
    req.user = user;
    req.email = email;
    next(); // Call the next middleware in the chain after successful verification
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: "Token has expired",
        status: false,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).send({
        message: "Invalid Token",
        status: false,
      });
    }

    // Handle other possible errors separately if needed

    return res.status(401).send({
      message: "Authentication failed",
      status: false,
    });
  }
};

// Saving logged user
const SaveCurrentUser = async (req, res, next) => {
  try {
    // Check if the token exists and has the expected format
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).send({
        message: "Invalid or missing authorization header",
        status: false,
      });
    }

    const token = authHeader.split(" ")[1];

    const email = await verifyToken(token);

    // console.log(email)

    // Query your database using the email to get the user information
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).send({
        message: "User not found",
        status: false,
      });
    }

    // Check if the token has expired
    const currentDate = new Date();
    if (token.exp && token.exp < currentDate.getTime() / 1000) {
      return res.status(401).send({
        message: "Token has expired",
        status: false,
      });
    }

    // Check if lastLoginTime is already set
    if (!user.lastLoginTime) {
      user.lastLoginTime = new Date();
      await user.save();
    }

    const timeOnly = user.lastLoginTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return res.status(201).send({
      message:
        "Now that you are logged in to our website, what are you doing with us?",
      status: true,
      user: {
        username: user.username,
        email: user.email,
        firstname: user.firstname, // Include the firstname field
        lastname: user.lastname, // Include the lastname field
        wallet: user.Wallet,
        date: currentDate.toDateString(),
        time: timeOnly,
        image: user.image, // Use user.image for the image field
        // Include other user information as needed
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal server error",
      status: false,
    });
  }
};

// editing userdata
const EditProfile = async (req, res, next) => {
  try {
    const { firstname, lastname, username, email, image } = req.body;
    console.log(req.body);

    // Find the user based on the provided username
    const getuser = await userModel.findOne({ email });
    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();
    if (!getuser) {
      return res.status(400).send({ message: "User not found", status: false });
    }

    // Update the user's profile information
    getuser.firstname = firstname;
    getuser.lastname = lastname;
    getuser.username = username;
    getuser.email = email;
    getuser.image = image;

    // Save the updated user profile
    await getuser.save();

    return res.status(200).send({
      message: `Yoo!! ${username}  You just updated your Profile we're glad With you connecting with us`,
      time,
      DateEdited,
      status: true,
    });
  } catch (error) {
    // Handle any errors that might occur during the update process
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .send({ message: "An error occurred", status: false });
  }
};

// changing password
const changepassword = async (req, res, next) => {
  try {
    const { oldpassword, newPassword, email } = req.body;

    // Find the user by their email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not found", status: false });
    }

    // Compare the old password with the stored hashed password
    const isOldPasswordCorrect = await argon2.verify(
      user.password,
      oldpassword
    );

    if (!isOldPasswordCorrect) {
      return res
        .status(400)
        .send({ message: "Old password is incorrect", status: false });
    }

    // Hash the new password
    const hashedNewPassword = await argon2.hash(newPassword);

    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    return res
      .status(200)
      .send({
        message: "Your Password is updated successfully",
        time,
        DateEdited,
        status: true,
      });
  } catch (error) {
    // Handle any errors that might occur during the password change process
    console.error("Error changing password:", error);
    return res
      .status(500)
      .send({ message: "An error occurred", status: false });
  }
};

// Creating a new thrift
const CreateAThrift = async (req, res, next) => {
  try {
    const {
      groupName,
      Amount,
      RequiredUsers,
      interest,
      plan,
      imageFile,
      Wallet,
      Total,
      Members,
      creatorUsername,
    } = req.body;
    console.log(req.body);

    // Check if groupname exists
    const existingGroupName = await ThriftModel.findOne({ groupName });
    if (existingGroupName) {
      return res.status(400).send({
        message:
          "Thrift name already in use. Please choose a different name for your group.",
        status: false,
      });
    }

    // Create the new thrift group with the current timestamp
    const createdAt = new Date(); // Get the current date and time

    // Initialize the members array with the creator and other members
    const allMembers = [];

    if (Array.isArray(Members) && Members.length > 0) {
      // Loop through the Members array and initialize paymentArray
      for (let i = 0; i < Members.length; i++) {
        const paymentArray = [{ paid: false }]; // Each member has a single payment object
        allMembers.push({
          username: Members[i].username || "",
          verified: false,
          payment: paymentArray,
        });
      }
      console.log("allmembers after loop :", allMembers);
    } else {
      // Initialize a default member with creatorUsername
      allMembers.push({
        username: creatorUsername || "",
        verified: true,
        payment: [{ paid: false }],
      });
    }

    console.log("creatorUsername:", creatorUsername);
    console.log("allMembers before username assignment:", allMembers);

    // Add the thrift creator as a member with verified set to true
    allMembers[0].username = creatorUsername;
    allMembers[0].verified = true;

    console.log("allMembers after username assignment:", allMembers);

    const newThrift = await ThriftModel.create({
      groupName,
      Amount,
      RequiredUsers,
      interest,
      plan,
      Total,
      image_url: imageFile,
      Wallet,
      Members: allMembers,
      createdAt: createdAt,
    });

    // Save the new thrift group document
    await newThrift.save();

    const groupId = newThrift._id;

    // Extract the date and time separately
    const date = createdAt.toLocaleDateString();
    const time = createdAt.toLocaleTimeString();

    return res.status(201).send({
      message: `${newThrift.groupName}, group created successfully. We are so happy to have you on board. You can kindly add more users to your group via the group link.`,
      status: true,
      createdAt: createdAt.toISOString(),
      date: date,
      time: time,
    });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).send({
      message: "Internal server error",
      error,
      status: false,
    });
  }
};

// querying my database to check for existing thrifts
const FindExistingThrift = async (req, res, next) => {
  try {
    const existingThrifts = await ThriftModel.find();

    if (existingThrifts && existingThrifts.length > 0) {
      const thriftsResponse = existingThrifts.map((existingThrift) => {
        const verifiedMembers = existingThrift.Members.map((member) => ({
          verified: member.verified,
          username: member.username,
        }));
        return {
          groupName: existingThrift.groupName,
          groupId: existingThrift._id,
          groupIcon: existingThrift.image_url,
          RequiredUsers: existingThrift.RequiredUsers,
          Amount: existingThrift.Amount,
          plan: existingThrift.plan,
          verifiedMembers: verifiedMembers,
          Total: existingThrift.Total,
        };
      });

      return res.status(200).json({
        message: "Existing thrifts found.",
        status: true,
        existingThrifts: thriftsResponse,
      });
    } else {
      console.log("no thrift currently");
      return res.status(404).send({
        message: "No existing thrifts found.",
        status: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      status: false,
    });
  }
};

// getting all the members  of  each thrift from  database
const GetMembers = async (req, res, next) => {
  try {
    const { groupName } = req.body;
    const thriftGroup = await ThriftModel.findOne({ groupName });

    if (thriftGroup) {
      const groupMembers = thriftGroup.Members.map((member) => {
        return {
          username: member.username,
          payments: member.payment, // Change to "payments" to reflect the array of payments
        };
      });
      const plan = thriftGroup.plan;

      return res.status(200).json({
        message: "Here is the list of all users.",
        status: true,
        plan: plan,
        groupName: groupName,
        groupId: thriftGroup._id,
        groupMembers: groupMembers,
        groupIcon: thriftGroup.image_url,
        RequiredUsers: thriftGroup.RequiredUsers,
        Amount: thriftGroup.Amount,
        plan: thriftGroup.plan,
        Total: thriftGroup.Total,
        wallet: thriftGroup.Wallet,
      });
    } else {
      return res.status(404).json({
        message: "Thrift group not found.",
        status: false,
        groupMembers: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
      status: false,
      groupMembers: [],
    });
  }
};

// GET a specific groupData for joining a thrift
const getGroupDetails = async (req, res, next) => {
  const GroupId = req.params.id; // Use req.params.id to access the value
  console.log(req.params);

  try {
    const thriftGroup = await ThriftModel.findById(GroupId);
    console.log(thriftGroup);

    if (!thriftGroup) {
      return res
        .status(404)
        .send({ message: "Invalid Invite, Thrift group not found" });
    }

    const groupDetails = {
      groupName: thriftGroup.groupName,
      groupId: thriftGroup._id,
      groupIcon: thriftGroup.image_url,
      RequiredUsers: thriftGroup.RequiredUsers,
      Amount: thriftGroup.Amount,
      plan: thriftGroup.plan,
      Total: thriftGroup.Total,
    };

    return res
      .status(200)
      .send({ message: "Invite link details", groupDetails });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// Funding user's wallet
const UpdateUsersWallet = async (req, res, next) => {
  const { username, amount } = req.body;
  console.log("Username:", username);
  console.log("Amount:", amount);
  try {
    const user = await userModel.findOne({ username });
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Before updating the wallet
    console.log("Current Wallet Balance:", user.Wallet);

    // Update the user's wallet
    user.Wallet = parseFloat(user.Wallet) + parseFloat(amount);
    console.log("New Wallet Balance:", user.Wallet);

    // After saving the user
    await user.save();

    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();

    console.log("Wallet updated for user:", user.email);

    return res.status(200).json({
      success: true,
      message: `Payment verified and wallet updated successfully, an amount of ${amount} has been added to your wallet`,
      time,
      DateEdited,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user's wallet",
    });
  }
};

// Add a new user to an existing thrift
const AddUserToGroup = async (req, res, next) => {
  try {
    const { username, groupname } = req.body;
    console.log(req.body);

    // Find the thrift group based on the groupname
    const thriftGroup = await ThriftModel.findOne({ groupName: groupname });
    const user = await userModel.findOne({ username: username });

    if (!thriftGroup) {
      return res.status(404).send({
        message: "Thrift group not found.",
        status: false,
      });
    }

    if (!user) {
      return res.status(404).send({
        message: "User not found. Try signing up for a new account.",
        status: false,
      });
    }

    // Check if the user is already a member of the group
    const isUserAlreadyMember = thriftGroup.Members.find(
      (member) => member.username === username
    );

    if (isUserAlreadyMember) {
      return res.status(400).send({
        message: "User is already a member of the group.",
        status: false,
      });
    }

    // Check if the group is completed
    if (thriftGroup.Members.length === thriftGroup.RequiredUsers) {
      return res.status(400).send({
        message: "Thrift group Completed, try joining a new group",
        status: false,
      });
    }

    // Initialize the payment array for the new user
    const paymentArray = [];
    for (let i = 0; i < thriftGroup.Members.length; i++) {
      paymentArray.push({ paid: false });
    }

    // Add the new user to the Members array
    thriftGroup.Members.push({
      username: username,
      verified: true, // Set verification status to true
      payment: paymentArray, // Set the payment status array
    });

    // Increase payment status for all users
    const updatedPaymentArray = Array(thriftGroup.Members.length).fill({
      paid: false,
    });

    thriftGroup.Members.forEach((member, index) => {
      member.payment = updatedPaymentArray; // Update payment array for each member
    });

    await thriftGroup.save();

    return res.status(200).send({
      message: "User added to the group successfully.",
      status: true,
    });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).send({
      message: "Internal server error",
      error,
      status: false,
    });
  }
};

// Paying of thrifts to each group
const PayThrift = async (req, res, next) => {

  // data expecting from the client
  const { username, amount, groupName, amountPerThrift } = req.body;

  try {
    // Find the user and thrift group
    const getUser = await userModel.findOne({ username });
    const thriftGroup = await ThriftModel.findOne({ groupName });

    // check if the user is available
    if (!getUser) {
      return res.status(400).send({
        message: "User Not Found, Try Signing in for a new account",
        status: false,
      });
    }

    // check if there's no thrift available
    if (!thriftGroup) {
      return res
        .status(401)
        .send({ message: "Thrift-group not found", status: false });
    }

   // Convert userWllet to float
    const userWallet = parseFloat(getUser.Wallet); 

    // Convert groupWallet to float
    const groupWallet = parseFloat(thriftGroup.Wallet); 

    // Check if all users in the group are completed
    if (thriftGroup.Members.length !== thriftGroup.RequiredUsers) {
      return res.status(400).send({
        message:
          "Thrift group has to be completed before payment could be made.",
        status: false,
      });
    }

    // Check if the user has enough balance
    if (userWallet < amount) {
      return res.status(500).send({ message: "Insufficient balance" });
    }

    // Check if the amount paid is less than the amountPerThrift
    if (parseFloat(amount) < parseFloat(amountPerThrift)) {
      return res.status(401).send({
        message:
          "The amount you're trying to pay is less than the required amount",
        status: false,
      });
    }

    // Check if amount to be paid is greater 
    if (parseFloat(amount) > parseFloat(amountPerThrift)) {
      return res.status(400).send({
        message:
          "The amount you're trying to pay is More than the required amount",
        ststus: false,
      });
    }

    // Check if the user's payment is completed
    if (thriftGroup.Members.length === thriftGroup.Members.payment.length) {
      return res.status(400).send({
        message:
          "Your payment is completed alredy, you can't make another payment at this instance",
        status: false,
      });
    }

    // Deduct the specified amount from the user's wallet
    getUser.Wallet = userWallet - parseFloat(amount);

    // Add the deducted amount to the group's wallet
    thriftGroup.Wallet = groupWallet + parseFloat(amount);

    // Find the user's index within the thriftGroup.Members array
    const memberIndex = thriftGroup.Members.findIndex(
      (member) => member.username === username
    );

    if (memberIndex !== -1) {
      // Find the user's payment array
      const userPaymentArray = thriftGroup.Members[memberIndex].payment;

      // Find the first payment object in the user's payment array with paid set to false
      const firstUnpaidIndex = userPaymentArray.findIndex(
        (paymentObject) => !paymentObject.paid
      );

      // If an unpaid index is found, set it to true
      if (firstUnpaidIndex !== -1) {
        userPaymentArray[firstUnpaidIndex].paid = true;
      }
    }

    // Save changes to user and group documents in the database
    await getUser.save();
    await thriftGroup.save();

    // attach the date to be sent to the client 
    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();
     
    console.log(
      "User Payment Status Updated:",
      thriftGroup.Members[memberIndex].payment
    );

    return res
      .status(200)
      .send({ message: `A Payment of ${amount} has been  Made successfully to ${groupName}`, time, DateEdited, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

// Withdrawing money from the group wallet
const WithdrawFunds = async (req, res, next) => {
  try {
    const { Withdrawer, username, groupName, amount } = req.body;

    console.log(req.body);

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    const thriftGroup = await ThriftModel.findOne({ groupName });

    if (!thriftGroup) {
      return res.status(401).send({ message: "Thrift group not found" });
    }

    

    // Check verification status for all users in the thrift group
    const allVerified = thriftGroup.Members.every((member) => member.verified);

    if (!allVerified) {
      return res.status(400).send({
        message:
          "Not all users are verified. Verification is required before withdrawing.",
      });
    }

    // Checking the user trying to withdraw money
    if (Withdrawer !== username) {
      return res.status(400).send({
        message:
          "It's not your turn to withdraw, kindly wait for your time to withdraw",
      });
    }

    // Subtract the amount from the thrift group's wallet
    thriftGroup.Wallet -= amount;

    // Add the amount to the user's wallet
    user.Wallet += amount;

    // Reset payments for all users in the thrift group
    thriftGroup.Members.forEach((member) => {
      member.payment = member.payment.map(() => ({ paid: false }));
    });

    // Save the updated thrift group and user data
    await thriftGroup.save();
    await user.save();

    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();

    res.status(200).send({
      message: ` You just made Withdrawal of ${amount} From ${groupName}, we're so glad for your contribution  with us  `,
      time,
      DateEdited,
      status : true
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// sending email to user when he forgot his password
const forgotPassword = (req, res, next) => {
  const { email, username } = req.body;
  console.log(req.body);
  try {
    const generatedNum = Math.floor(Math.random() * 9999);
    ForgotPassword(email, username, generatedNum);
    const data = {
      generatedNum,
      username,
    };
    return res
      .status(200)
      .send({ message: "Email sent successfully", status: true, data });
  } catch (error) {
    console.log(error);
    toast.error(error.data.message);
    return res
      .status(400)
      .send({ message: "Error generating Otp", status: false });
  }
};

// resetting user's password
const ResetPassword = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);

    // Find the user by their email
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(400).send({ message: "User not found", status: false });
    }

    // Hash the new password
    const hashedNewPassword = await argon2.hash(password);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();
 
    const date = new Date();
    const time = date.getTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const DateEdited = date.toDateString();

    return res
      .status(200)
      .send({ message: "Your  Password has been Updated successfully", status: true,time, DateEdited });
  } catch (error) {
    // Handle any errors that might occur during the password change process
    console.error("Error Resetting password:", error);
    return res
      .status(500)
      .send({ message: "An error occurred", status: false });
  }
};

module.exports = {
  signup,
  signin,
  verifyUserToken,
  SaveCurrentUser,
  CreateAThrift,
  FindExistingThrift,
  GetMembers,
  AddUserToGroup,
  EditProfile,
  changepassword,
  UpdateUsersWallet,
  PayThrift,
  WithdrawFunds,
  forgotPassword,
  ResetPassword,
  getGroupDetails,
};
