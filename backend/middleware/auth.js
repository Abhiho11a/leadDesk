const requireAuth = (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Session missing or invalid' });
  }
};

module.exports = { requireAuth };
