
import express from 'express';


import { userRegister } from '../controllers/user.js';
import { userLogin } from '../controllers/user.js';
import { userLogout } from '../controllers/user.js';
import { resetpassword } from '../controllers/passswordreset.js';
import { otpGenerate } from '../controllers/otp.js';
import { varifyotp } from '../controllers/otp.js';
// import {categories} from '../controllers/categories.js';
import { getCategories } from '../controllers/categories.js';
const router = express.Router();

// Route for user registration
router.post('/register', userRegister );
router.post('/login',userLogin);
router.get('/logout',userLogout);
router.post('/reset-password', resetpassword)
router.post('/generate-otp',otpGenerate);
router.post('/verify-otp', varifyotp);
router.get('/v1/categories', getCategories);

export default router;
