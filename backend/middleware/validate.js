// A simple validation middleware to catch common schema issues before they hit Mongoose
const validateLead = (req, res, next) => {
  const { name, email, budgetRange, message } = req.body;
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters';
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Valid email is required';
  }

  const validBudgets = ["<1k", "1k-5k", "5k-10k", "10k+"];
  if (!budgetRange || !validBudgets.includes(budgetRange)) {
    errors.budgetRange = 'Invalid budget range selected';
  }

  if (!message || message.length > 1000) {
    errors.message = 'Message is required and must be under 1000 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["New", "Contacted", "Closed"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ status: 'Invalid status' });
  }
  next();
};

module.exports = { validateLead, validateStatusUpdate };
