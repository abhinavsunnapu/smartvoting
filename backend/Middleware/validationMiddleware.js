// Input validation middleware for common operations

const validateRegister = (req, res, next) => {
  const { name, email, password, jobTitle, role } = req.body;

  // Check required fields
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password validation (at least 6 chars, 1 letter, 1 number, 1 special char)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters and include letters, numbers, and a special character",
    });
  }

  // Name length validation
  if (name.trim().length < 2 || name.length > 100) {
    return res
      .status(400)
      .json({ message: "Name must be between 2 and 100 characters" });
  }

  // JobTitle length validation if provided
  if (jobTitle && jobTitle.length > 100) {
    return res
      .status(400)
      .json({ message: "Job title must be less than 100 characters" });
  }

  // Role validation
  if (role && !["voter", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either 'voter' or 'admin'" });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (role && !["voter", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either 'voter' or 'admin'" });
  }

  next();
};

const validateOTP = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (otp.toString().length !== 6 || !/^\d+$/.test(otp)) {
    return res.status(400).json({ message: "OTP must be 6 digits" });
  }

  next();
};

const validateCreateElection = (req, res, next) => {
  const { title, description, startDate, endDate, candidates, allowedVoters } =
    req.body;

  if (!title || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Title, startDate, and endDate are required" });
  }

  // Validate title length
  if (title.trim().length < 3 || title.length > 255) {
    return res
      .status(400)
      .json({ message: "Title must be between 3 and 255 characters" });
  }

  // Validate description length
  if (description && description.length > 1000) {
    return res
      .status(400)
      .json({ message: "Description must be less than 1000 characters" });
  }

  // Validate dates
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (endDateObj <= startDateObj) {
    return res
      .status(400)
      .json({ message: "End date must be after start date" });
  }

  // Validate candidates array
  if (candidates && !Array.isArray(candidates)) {
    return res.status(400).json({ message: "Candidates must be an array" });
  }

  // Validate allowedVoters array
  if (allowedVoters && !Array.isArray(allowedVoters)) {
    return res.status(400).json({ message: "Allowed voters must be an array" });
  }

  next();
};

const validateCastVote = (req, res, next) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ message: "Candidate ID is required" });
  }

  // Check if candidateId is a valid MongoDB ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(candidateId)) {
    return res.status(400).json({ message: "Invalid candidate ID format" });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOTP,
  validateCreateElection,
  validateCastVote,
};
