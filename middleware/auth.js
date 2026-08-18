const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decodedToken.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user object to the request so next functions can use it
    req.user = user;
    next();
    
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { authenticate };