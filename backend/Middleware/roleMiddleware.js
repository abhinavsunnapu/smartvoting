// Role-based access control middleware

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no user" });
  }

  const userRoles = req.user.roles || [req.user.role || "admin"];

  if (!userRoles.includes("admin")) {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

const voterOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no user" });
  }

  const userRoles = req.user.roles || [req.user.role || "admin"];

  if (!userRoles.includes("voter")) {
    return res.status(403).json({
      message: "Access denied. Voter privileges required.",
    });
  }

  next();
};

module.exports = {
  adminOnly,
  voterOnly,
};
