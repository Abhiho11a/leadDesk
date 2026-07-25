const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Lead = require('../models/Lead');
const Admin = require('../models/Admin');
const { requireAuth } = require('../middleware/auth');
const { validateLead, validateStatusUpdate } = require('../middleware/validate');


router.get('/',(req,res)=>{
  return res.status(200).json("Backend server is running");
});

// Create Lead (Public)
router.post('/leads', validateLead, async (req, res, next) => {
  try {
    const { name, email, budgetRange, message } = req.body;
    const lead = new Lead({ name, email, budgetRange, message });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json(errors);
    }
    next(err);
  }
});

// Get Leads (Protected)
router.get('/leads', requireAuth, async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    next(err);
  }
});

// Update Lead Status (Protected)
router.patch('/leads/:id/status', requireAuth, validateStatusUpdate, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// Delete Lead (Protected)
router.delete('/leads/:id', requireAuth, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Admin Login
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.adminId = admin._id;
    res.json({ email: admin.email, id: admin._id });
  } catch (err) {
    next(err);
  }
});

// Admin Logout
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Failed to logout' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get Current Admin
router.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.session.adminId).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
