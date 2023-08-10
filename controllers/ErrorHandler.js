const ErrorHandler = (err, req, res, next) => {
    console.log(err);
    if (err.name === "MongoError") {
      if (err.code === 11000) {
        return res.status(400).send({ message: "Duplicate key error. A value is already in use in our database", status: false });
      }
    } else if (err.name === "Authentication error") {
      return res.status(401).send({ message: "Authentication error", status: false });
    } else if (err.name === "Authorization error") {
      return res.status(401).send({ message: "Authorization error", status: false });
    } else {
      return res.status(500).send({ message: "Internal server error", status: false });
    }
  };
  
  module.exports = { ErrorHandler };
  