const express = require('express');
const router = express.Router();
const {
  viewUser,
  updateProfile,
  updatePassword,
  makeOwner,
  banUser
} = require('../controllers/userController');

const protectRoute = require('../middlewares/authMiddleware');
const restrictTo=require('../middlewares/roleMiddleware');
// 🔐 Protect ALL routes below
router.use(protectRoute);

// USER ROUTES
router.get('/me', viewUser);
router.put('/update-profile', updateProfile);
router.put('/update-password', updatePassword);

// ADMIN ONLY
router.patch('/ban/:id',restrictTo('owner'), banUser);
router.patch('/make-owner/:id', restrictTo('owner'), makeOwner);

module.exports = router;
