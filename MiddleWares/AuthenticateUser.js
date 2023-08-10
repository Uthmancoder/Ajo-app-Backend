const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET

const isAuthenticated = (req, res, next) => {
  // Check if the user is authenticated (e.g., by verifying a token)
  const token = req.headers.authorization;
  if (!token) {
    // If token is not present, the user is not authenticated
    return res.redirect("http://localhost:3001/signup");
  }

  try {
    // Verify the token here and check if it's valid
    // If valid, the user is authenticated, and you can proceed to the next middleware or endpoint
    // Otherwise, redirect the user to the signup page
    const decodedToken = jwt.verify(token, {secretKey});
    // Optionally, you can attach the user data to the request for future use
    req.user = decodedToken; // Now you can access user data with req.user

    next(); // Proceed to the next middleware or endpoint
  } catch (error) {
    // If the token verification fails, the user is not authenticated
    // Redirect the user to the signup page or any other page as needed
    return res.redirect("http://localhost:3001/signup");
  }
};

module.exports = isAuthenticated;
