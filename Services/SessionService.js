const jwt = require("jsonwebtoken");
const SecretKey = "uthman12";

const generateToken = (email) => {
  try {
    // Change expiresIn value to set the desired token expiration time (e.g., "1h" for one hour)
    const token = jwt.sign({ email }, SecretKey, { expiresIn: "1d" });
    return token;
  } catch (err) {
    console.log(err);
    throw new Error("Authentication Error, Error Generating token");
  }
};

const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error("Authentication Error: Invalid Token");
    }
    const decodedToken = jwt.verify(token, SecretKey);
    console.log(decodedToken);
    const email = decodedToken.email;
    return email;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Session expired")
      throw {
        name: "Authentication error",
        message: "Session Expired, try signing in again",
      };
    } else {
      throw {
        name: "Authentication error",
        message: "Token verification failed, try signing in again",
      };
    }
  }
};

module.exports = { generateToken, verifyToken };
