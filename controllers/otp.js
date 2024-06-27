

import OTP from '../models/otp.js';
import nodemailer from 'nodemailer';
import User from '../models/user.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: '',
    pass: '',
  },
});

export const otpGenerate = async (req, res) => {
  try {
    const { email } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    let existingOTP = await OTP.findOne({ email });

   
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    if (existingOTP) {
      
      existingOTP.code = otpCode;
      existingOTP.expireIn = Date.now() + 600000; 
    } else {
     
      existingOTP = new OTP({
        email,
        code: otpCode,
        expireIn: Date.now() + 600000, 
      });
    }

 
    const mailOptions = {
      from: '',
      to: email,
      subject: 'Verification Code',
      text: `Your OTP is: ${otpCode}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    
    const savedOTP = await existingOTP.save();
    console.log('OTP saved to database:', savedOTP);

    return res.status(200).send('OTP sent and saved successfully');
  } catch (err) {
    console.error('Error generating OTP:', err);
    return res.status(500).json({ message: 'Error generating OTP', error: err.message });
  }
};

export const varifyotp = async (req, res) => {
  try {
    const { otpCode } = req.body;

   
    const otpRecord = await OTP.findOne({ code: otpCode, expireIn: { $gt: Date.now() } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP code or OTP expired' });
    }

 

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ message: 'Error verifying OTP', error: err.message });
  }
};
