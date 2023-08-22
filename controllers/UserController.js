const userModel = require("../Models/Usermodel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// const bcryptjs = require("bcryptjs");
const argon2 = require("argon2");
const ThriftModel = require("../Models/CreateThtift");
const { sendMail } = require("../Config/MyMailer");
const cloudinary = require("cloudinary").v2;
const { generateToken, verifyToken } = require("../Services/SessionService");
const axios = require("axios");
// const { default: Email } = require("next-auth/providers/email");

// sign up for a new account
const signup = async (req, res, next) => {
  try {
    const { firstname, lastname, username, email, password, confirmPassword } =
      req.body;
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
    const hash = await argon2.hash(password);
    const newUser = await userModel.create({
      firstname,
      lastname,
      username,
      email,
      password: hash,
      confirmPassword,
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

    const passwordMatch = await argon2.verify(result.password, password);
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
    return res.status.send({ message: "User not found" });
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
        wallet: user.Wallet,
        date: currentDate.toDateString(),
        time: timeOnly,
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
    const newThrift = await ThriftModel.create({
      groupName,
      Amount,
      RequiredUsers,
      interest,
      plan,
      Total,
      image_url: imageFile, // Assuming you want to save the image URL in the database
      Wallet,
      Members: [],
      createdAt: createdAt, // Save the timestamp in the 'createdAt' field of the model
    });

    // Add the thrift creator as a member with verified set to true
    const creator = {
      username: creatorUsername,
      verified: true,
      payment: false,
    };
    newThrift.Members.push(creator);

    // If you want to set the creator verification immediately, you can do so here
    newThrift.creatorUsername = creatorUsername;
    newThrift.verified = true;
    newThrift.payment = false;

    await newThrift.save();

    const groupId = newThrift._id;

    // Extract the date and time separately
    const date = createdAt.toLocaleDateString(); // Extract the date as a string (e.g., "MM/DD/YYYY")
    const time = createdAt.toLocaleTimeString(); // Extract the time as a string (e.g., "HH:MM:SS AM/PM")

    return res.status(201).send({
      message: `${newThrift.groupName},group created successfully. we are so happy to have you on board You can kindly add more users to your group via the grouplink.`,
      status: true,
      link: `https://ultimate-ajo-app.netlify.app/groups/${groupId}`,
      createdAt: createdAt.toISOString(), // Include the full timestamp if needed
      date: date, // Include the extracted date
      time: time, // Include the extracted time
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
          payment: member.payment,
        };
      });
      const plan = thriftGroup.plan;

      return res.status(200).json({
        message: "Here is the list of all users.",
        status: true,
        plan: plan,
        groupName: groupName,
        groupMembers: groupMembers,
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

// Initiate  the  payment  process
const InitiatePayment = async (req, res, next) => {
  const { email, amount, tx_ref, username } = req.body;

  const FlutterwaveSecretKey = process.env.FLW_SECRET;

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: tx_ref,
        amount: amount,
        currency: "NGN",
        redirect_url: "http://localhost:3001/account",
        customer :{
          email: email,
          username: username,
        },
        customizations: {
          title: "Funding Wallet",
          logo: "https://www.shutterstock.com/image-vector/ultimate-text-effect-abstract-modern-600w-2075952592.jpg",
        },
        merchant: {
          name: username, // Set the merchant name to the contributor's username
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FlutterwaveSecretKey}`,
        },
      }
    );

    console.log("Flutterwave Response:", response.data);
    const  flutterwaveResponse = response.data
    return res.status(200).json({ success: true,
       message: "Payment initiated successfully" ,
       flutterwaveResponse });
  } catch (err) {
    console.log("Error:", err.code);
    console.log("Error Response:", err.response.data);
    return res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

// Add a new user to existing thrift
const AddUserToGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { username, verified } = req.body;

    // Find the thrift group based on the groupId
    const thriftGroup = await ThriftModel.findById(groupId);
    if (!thriftGroup) {
      return res.status(404).send({
        message: "Thrift group not found.",
        status: false,
      });
    }

    // Check if the user is already a member of the group
    const isUserAlreadyMember = thriftGroup.Members.some(
      (member) => member.username === username
    );
    if (isUserAlreadyMember) {
      return res.status(400).send({
        message: "User is already a member of the group.",
        status: false,
      });
    }

    // Add the new user to the Members array
    thriftGroup.Members.push({
      username,
      verified,
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

module.exports = {
  signup,
  signin,
  verifyUserToken,
  SaveCurrentUser,
  CreateAThrift,
  FindExistingThrift,
  GetMembers,
  AddUserToGroup,
  InitiatePayment
};
