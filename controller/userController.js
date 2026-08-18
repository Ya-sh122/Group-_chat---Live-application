const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Helper to generate token
const generateAccessToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    // Encrypt password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({ message: "Successfully signed up", user: { id: newUser.id, name: newUser.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "User not authorized - Incorrect password" });
    }

    // Generate JWT token on successful login
    const token = generateAccessToken(user.id, user.name);

    res.status(200).json({ 
      message: "User login successful", 
      token: token,
      userId: user.id,
      userName: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};