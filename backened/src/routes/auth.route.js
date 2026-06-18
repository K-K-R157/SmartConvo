import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { signup, login,logout,onboard } from '../controllers/auth.controller.js';

const router=express.Router();

// noob way to create routes
// router.get('/signup', (req, res) => {
//     res.send('Signup route');
// });
// better way to create routes
router.post('/signup',signup)
router.post('/login', login);
router.post('/logout', logout);

router.post("/onboarding",protectRoute,onboard);


//  in future we can add more routes like forgot password, reset password, reset email and so on


// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
