module.exports.requireRole = function (...roles) {
  return function (req, res, next) {
    try {
      const userRole = req.user?.role;
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ msg: 'Forbidden' });
      }
      next();
    } catch {
      return res.status(403).json({ msg: 'Forbidden' });
    }
  };
};


