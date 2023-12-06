const userModel = require("../Models/Usermodel");
const bcryptjs = require("bcryptjs");
const ThriftModel = require("../Models/CreateThtift");
const { sendMail, ForgotPassword } = require("../Config/MyMailer");
const cloudinary = require("cloudinary").v2;
const { generateToken, verifyToken } = require("../Services/SessionService");
const cloudinaryConfig = cloudinary.config({
  cloud_name: "uthmancoder",
  api_key: "331917233267244",
  api_secret: "jYxuv8THBooQjFelkHSLcSLCcCI",
});

// sign up for a new account
const signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, image } = req.body;

    console.log(req.body);

    if (!username || !email || !password || !confirmPassword) {
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

    let userImg;
    try {
      userImg = await cloudinary.uploader.upload(image);
    } catch (cloudinaryError) {
      console.error("Error uploading image to Cloudinary", cloudinaryError);

      // Handle Cloudinary upload error and return an appropriate response
      return res.status(500).send({
        message: "Error uploading image to Cloudinary",
        status: false,
      });
    }

    const hash = await bcryptjs.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: hash,
      confirmPassword,
      image: userImg.secure_url,
      Wallet: 0,
      TotalWithdrawal: 0,
      TotalDeposit: 0,
      TotalTransaction: 0,
      TransactionHistory: [],
    });

    sendMail(email, username);

    return res.status(201).send({
      message: "Account created successfully!",
      status: true,
      newUser,
    });
  } catch (err) {
    console.log("Internal Server Error", err);
    next(err);
  }
};

// signin to your account
const signin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(404).send({
      message: "All fields are required",
      status: false,
    });
  }
  try {
    const result = await userModel.findOne({ email });
    // console.log(result);
    if (!result) {
      return res.status(404).send({
        message: "Account does not exist. Try creating one.",
        status: false,
      });
    }
    const Username = result.username;
    const userEmail = result.email;

    // compare the password with the decoded one
    const passwordMatch = await bcryptjs.compare(password, result.password);

    // console.log(passwordMatch);
    if (!passwordMatch) {
      return res.status(400).send({
        message: "Invalid password",
        status: false,
      });
    }

    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const token = generateToken({ email: userEmail });

    const userData = {
      username: Username,
      email: userEmail,
      wallet: result.Wallet,
      image: result.image,
      formattedDateTime,
      TotalDeposit: result.TotalDeposit,
      TotalTransactions: result.TotalTransactions,
      TotalWithdrawal: result.TotalWithdrawal,
      TransactionHistory: result.TransactionHistory,
    };
    console.log(userData);
    return res.status(200).send({
      message: `Hi ${Username}, Welcome To Ultimate Microfinance Bank. Soo glad to have you on board`,
      status: true,
      token,
      userData,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// editing userdata
const EditProfile = async (req, res, next) => {
  try {
    const { username, email, image } = req.body;
    console.log(req.body);

    // Find the user based on the provided username
    const getuser = await userModel.findOne({ email });
    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (!getuser) {
      return res.status(400).send({ message: "User not found", status: false });
    }

    let userImg;
    try {
      userImg = await cloudinary.uploader.upload(image);
    } catch (cloudinaryError) {
      console.error("Error uploading image to Cloudinary", cloudinaryError);

      // Handle Cloudinary upload error and return an appropriate response
      return res.status(500).send({
        message: "Error uploading image to Cloudinary",
        status: false,
      });
    }

    // Update the user's profile information
    getuser.username = username;
    getuser.email = email;
    getuser.image = userImg.secure_url;

    // Save the updated user profile
    await getuser.save();

    return res.status(200).send({
      message: `Yoo!! ${username}  You just updated your Profile we're glad With you connecting with us`,
      formattedDateTime,
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
    const isOldPasswordCorrect = await bcryptjs.compare(
      user.password,
      oldpassword
    );

    if (!isOldPasswordCorrect) {
      return res
        .status(400)
        .send({ message: "Old password is incorrect", status: false });
    }

    // Hash the new password
    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).send({
      message: "Your Password is updated successfully",
      formattedDateTime,
      status: true,
    });
  } catch (error) {
    // Handle any errors that might occur during the password change process
    console.log("Error changing password  :", error);
    return res
      .status(500)
      .send({ message: "Error changing password:", status: false });
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

    // Initialize the members array with the creator
    const allMembers = [
      {
        username: creatorUsername,
        verified: true,
        payment: [{ paid: false }],
      },
    ];
    console.log("All members after assignment :", allMembers);

    // Set the NextWithdrawal to the creatorUsername
    const nextWithdrawalIndex = 0;

    // Update TotalWithdrawal
    const TotalWithdraws = 0; // Set to 0 initially

    // Upload user image to Cloudinary
    let groupImg;
    try {
      groupImg = await cloudinary.uploader.upload(imageFile);
    } catch (cloudinaryError) {
      console.error("Error uploading image to Cloudinary", cloudinaryError);
      return res.status(500).send({
        message: "Error uploading image to Cloudinary",
        status: false,
      });
    }

    const newThrift = await ThriftModel.create({
      groupName,
      Amount,
      RequiredUsers,
      interest,
      plan,
      Total,
      image_url: groupImg.secure_url,
      Wallet,
      Members: allMembers,
      NextWithdrawal: allMembers[nextWithdrawalIndex].username,
      TotalWithdraws,
    });

    // Save the new thrift group document
    await newThrift.save();

    const groupId = newThrift._id;

    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return res.status(201).send({
      message: `${newThrift.groupName}, group created successfully. We are so happy to have you on board. You can kindly add more users to your group via the group link.`,
      status: true,
      NextWithdrawal: newThrift.NextWithdrawal,
      TotalWithdraws,
      formattedDateTime,
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
        TotalWithdraws : thriftGroup.TotalWithdraws,
        NextWithdrawal: thriftGroup.NextWithdrawal,
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
// fund wallet
const UpdateUsersWallet = async (req, res, next) => {
  const { username, amount } = req.body;

  // Get the current date and time
  const currentDate = new Date();

  try {
    const user = await userModel.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found", success: false });
    }

    // Before updating the wallet
    console.log("Current Wallet Balance:", user.Wallet);

    // Update the user's wallet
    user.Wallet = parseFloat(user.Wallet) + parseFloat(amount);
    console.log("New Wallet Balance:", user.Wallet);

    // Update TotalDeposits
    const TotalDeposit = (user.TotalDeposit =
      parseFloat(user.TotalDeposit) + 1);

    // Update TotalTransactions
    const TotalTransactions = (user.TotalTransactions =
      parseFloat(user.TotalTransactions) + 1);

    // Update TransactionHistory
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const transactionDetails = {
      Category: "Wallet Funding",
      Amount: amount,
      Date: formattedDateTime,
    };
    const TransactionHistory = user.TransactionHistory.push(transactionDetails);

    // After saving the user
    await user.save();

    console.log("Wallet updated for user:", user.email);

    const userData = {
      username: user.username,
      email: user.email,
      wallet: user.Wallet,
      image: user.image,
      formattedDateTime,
      TotalDeposit,
      TotalTransactions,
      TransactionHistory,
    };

    return res.status(200).send({
      success: true,
      message: `Payment verified and wallet updated successfully, an amount of ${amount} has been added to your wallet`,
      formattedDateTime,
      userData,
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
      // If the user doesn't exist, send a message and status to notify the client
      return res.status(404).send({
        message: "User not found. Please sign up for a new account.",
        status: "new_user",
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
    const paymentArray = Array(thriftGroup.Members.length).fill({
      paid: false,
    });

    // Add the new user to the Members array
    thriftGroup.Members.push({
      username: username,
      verified: true, // Set verification status to true
      payment: paymentArray, // Set the payment status array
    });

    // Ensure the creator is always the first index
    thriftGroup.Members.sort((a, b) => {
      if (a.username === thriftGroup.creatorUsername) return -1;
      if (b.username === thriftGroup.creatorUsername) return 1;
      return 0;
    });

    // Update NextWithdrawal to the creatorUsername
    thriftGroup.NextWithdrawal = thriftGroup.Members[0].username;

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

// const AddUserToGroup = async (req, res, next) => {
//   try {
//     const { username, groupname } = req.body;
//     console.log(req.body);

//     // Find the thrift group based on the groupname
//     const thriftGroup = await ThriftModel.findOne({ groupName: groupname });
//     const user = await userModel.findOne({ username : username });

//     if (!thriftGroup) {
//       return res.status(404).send({
//         message: "Thrift group not found.",
//         status: false,
//       });
//     }

//     if (!user) {
//       // If the user doesn't exist, send a message and status to notify the client
//       return res.status(404).send({
//         message: "User not found. Please sign up for a new account.",
//         status: "new_user",
//       });
//     }

//     // Check if the user is already a member of the group
//     const isUserAlreadyMember = thriftGroup.Members.find(
//       (member) => member.username === username
//     );

//     if (isUserAlreadyMember) {
//       return res.status(400).send({
//         message: "User is already a member of the group.",
//         status: false,
//       });
//     }

//     // Check if the group is completed
//     if (thriftGroup.Members.length === thriftGroup.RequiredUsers) {
//       return res.status(400).send({
//         message: "Thrift group Completed, try joining a new group",
//         status: false,
//       });
//     }

//     // Initialize the payment array for the new user
//     const paymentArray = [];
//     for (let i = 0; i < thriftGroup.Members.length; i++) {
//       paymentArray.push({ paid: false });
//     }

//     // Add the new user to the Members array
//     thriftGroup.Members.push({
//       username: username,
//       verified: true, // Set verification status to true
//       payment: paymentArray, // Set the payment status array
//     });

//     // Increase payment status for all users
//     const updatedPaymentArray = Array(thriftGroup.Members.length).fill({
//       paid: false,
//     });

//     thriftGroup.Members.forEach((member, index) => {
//       member.payment = updatedPaymentArray; // Update payment array for each member
//     });

//     await thriftGroup.save();

//     return res.status(200).send({
//       message: "User added to the group successfully.",
//       status: true,
//     });
//   } catch (error) {
//     console.log("Internal server error", error);
//     return res.status(500).send({
//       message: "Internal server error",
//       error,
//       status: false,
//     });
//   }
// };

// Paying of thrifts to each group
const PayThrift = async (req, res, next) => {
  // data expecting from the client
  const { username, amount, groupName, amountPerThrift } = req.body;
  console.log(req.body);

  try {
    // Find the user and thrift group
    const getUser = await userModel.findOne({ username });
    const thriftGroup = await ThriftModel.findOne({ groupName });

    // Check if the user is available
    if (!getUser) {
      return res.status(400).send({
        message: "User Not Found, Try Signing in for a new account",
        status: false,
      });
    }

    // Check if there's no thrift group available
    if (!thriftGroup) {
      return res
        .status(400)
        .send({ message: "Thrift group not found", status: false });
    }

    // Convert userWallet to float
    const userWallet = parseFloat(getUser.Wallet);

    // Convert groupWallet to floaty
    const groupWallet = parseFloat(thriftGroup.Wallet);

    // check the required users
    const requiredUser = thriftGroup.RequiredUsers;

    // Check if all users in the group have completed their payments

    console.log("Number of Members:", thriftGroup.Members.length);
    console.log("Required Users:", requiredUser);

    // Check if the user has enough balance
    if (userWallet < parseFloat(amount)) {
      return res
        .status(400)
        .send({ message: "Insufficient balance", status: false });
    }

    // Check if the amount paid is less than the amountPerThrift
    if (parseFloat(amount) < parseFloat(amountPerThrift)) {
      return res.status(400).send({
        message:
          "The amount you're trying to pay is less than the required amount",
        status: false,
      });
    }

    // Check if the amount paid is greater than the amountPerThrift
    if (parseFloat(amount) > parseFloat(amountPerThrift)) {
      return res.status(400).send({
        message:
          "The amount you're trying to pay is more than the required amount",
        status: false,
      });
    }

    // check if group is completed before making payment
    if (thriftGroup.Members.length !== requiredUser) {
      return res.status(400).send({
        message:
          "Thrift group has to be completed before a payment could be made",
        status: false,
      });
    }

    // Find the user's index within the thriftGroup.Members array
    const memberIndex = thriftGroup.Members.findIndex(
      (member) => member.username === username
    );

    if (memberIndex !== -1) {
      // Find the user's payment array
      const userPaymentArray = thriftGroup.Members[memberIndex].payment;

      // Check if all payments are completed
      const allPaymentsCompleted = userPaymentArray.every(
        (paymentObject) => paymentObject.paid
      );

      if (allPaymentsCompleted) {
        return res.status(400).send({
          message:
            "Your payment is completed already; you can't make another payment at this instance",
          status: false,
        });
      }

      // Deduct the specified amount from the user's wallet
      getUser.Wallet = (userWallet - parseFloat(amount)).toFixed(2);

      // Add the deducted amount to the group's wallet
      thriftGroup.Wallet = (groupWallet + parseFloat(amount)).toFixed(2);

      // Find the first payment object in the user's payment array with paid set to false
      const firstUnpaidIndex = userPaymentArray.findIndex(
        (paymentObject) => !paymentObject.paid
      );

      // If an unpaid index is found, set it to true
      if (firstUnpaidIndex !== -1) {
        userPaymentArray[firstUnpaidIndex].paid = true;
      }
    }

    // Update TotalTransactions
    const TotalTransactions = (getUser.TotalTransactions =
      parseFloat(getUser.TotalTransactions) + 1);

    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const transactionDetails = {
      Category: "Thrift Payment",
      Amount: amount,
      Date: formattedDateTime,
    };
    const TransactionHistory =
      getUser.TransactionHistory.push(transactionDetails);
    // Save changes to user and group documents in the database
    await getUser.save();
    await thriftGroup.save();

    console.log(
      "User Payment Status Updated:",
      thriftGroup.Members[memberIndex].payment
    );

    return res.status(200).send({
      message: `A payment of ${amount} has been made successfully to ${groupName}`,
      formattedDateTime,
      TotalTransactions,
      TransactionHistory,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Error making payment to group", status: false });
  }
};

// Withdrawing money from the group wallet
const WithdrawFunds = async (req, res, next) => {
  try {
    const { Withdrawer, username, groupName, amount } = req.body;

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
          "Not all users are verified. Payment verification for all users is required before withdrawing.",
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

    // Update TotalTransactions
    user.TotalTransactions += 1;

    // Update TotalWithdraws made by user
    user.TotalWithdrawal += 1;

    // Update group TotalWithdraws
    thriftGroup.TotalWithdraws += 1;

    // Add the amount to the user's wallet
    user.Wallet += amount;

    // Move the next withdrawer to the next index in the Members array
    const currentWithdrawerIndex = thriftGroup.Members.findIndex(
      (member) => member.username === Withdrawer
    );
    const nextWithdrawerIndex =
      (currentWithdrawerIndex + 1) % thriftGroup.Members.length;

    // Update NextWithdrawal in the thrift group
    thriftGroup.NextWithdrawal =
      thriftGroup.Members[nextWithdrawerIndex].username;

    // Reset payments for all users in the thrift group
    thriftGroup.Members.forEach((member) => {
      member.payment = member.payment.map(() => ({ paid: false }));
    });

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const currentDate = new Date();
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const transactionDetails = {
      Category: "Contribution Withdrawal",
      Amount: amount,
      Date: formattedDateTime,
    };

    // Push the transaction details to the TransactionHistory array
    user.TransactionHistory.push(transactionDetails);

    // Save the updated thrift group and user data
    await thriftGroup.save();
    await user.save();

    res.status(200).send({
      message: `You just made a withdrawal of ${amount} from ${groupName}. We're so glad for your contribution with us.`,
      formattedDateTime,
      TotalTransactions: user.TotalTransactions,
      TransactionHistory: user.TransactionHistory,
      TotalWithdraws: thriftGroup.TotalWithdraws,
      NextWithdrawal: thriftGroup.NextWithdrawal,
      TotalWithdrawal: thriftGroup.TotalWithdrawal,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// sending email to user when he forgot his password
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(404)
      .send({ message: "email is required", status: false });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).send({ message: "User Not Found", status: false });
  }
  const username = user.username;
  console.log(req.body);
  try {
    const generatedNum = Math.floor(Math.random() * 9999);

    // here is where we send the email to the user
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
    const hashedNewPassword = await bcryptjs.hash(password, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    const currentDate = new Date();

    // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
    const formattedDateTime = currentDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return res.status(200).send({
      message: "Your  Password has been Updated successfully",
      status: true,
      formattedDateTime,
    });
  } catch (error) {
    // Handle any errors that might occur during the password change process
    console.error("Error Resetting password:", error);
    return res
      .status(500)
      .send({ message: "An error occurred", status: false });
  }
};

const getCurrentUpdate = async (req, res) => {
  const { username } = req.query; // Use req.query to get parameters from the URL
  console.log("Received Username : ", req.query);

  try {
    // Find the user without sorting
    const getUser = await userModel.findOne({ username });
    console.log("user", getUser);
    if (getUser) {
      const currentDate = new Date();
      // Format the date and time as "YYYY-MM-DD HH:MM:SS" (24-hour clock)
      const formattedDateTime = currentDate.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const userData = {
        username: getUser.username,
        email: getUser.email,
        wallet: getUser.Wallet,
        image: getUser.image,
        TotalDeposit: getUser.TotalDeposit,
        TotalWithdrawal: getUser.TotalWithdrawal,
        TotalTransactions: getUser.TotalTransactions,
        TransactionHistory: getUser.TransactionHistory,
        formattedDateTime,
      };

      console.log("userData sentt :", userData);
      return res
        .status(200)
        .send({ message: "here are the user data", status: true, userData });
    } else {
      return res.status(404).send({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error fetching user's data",
    });
  }
};

module.exports = {
  signup,
  signin,
  getCurrentUpdate,
  // SaveCurrentUser,
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
