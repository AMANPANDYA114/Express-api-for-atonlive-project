import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import UserProfile from '../models/profile .js';
import cloudinary from '../utils/cloudinary.js';
import upload from '../middlewares/multer.js';

export const uploadProfilePic = (req, res) => {



  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1]; 

  upload.single('image')(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading file' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Upload the image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      const imageUrl = result.secure_url;

     
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;

     
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: userId },
        { profilePicUrl: imageUrl },
        { new: true, upsert: true }
      );

      if (!updatedProfile) {
        console.log("Profile image URL not saved to database");
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      console.log("Profile image URL saved to database");

      res.status(200).json({ success: true, message: 'Profile picture uploaded successfully', user: updatedProfile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error uploading profile picture' });
    }
  });
};

export const uploadBackgroundImage = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1]; 

  upload.single('image')(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading file' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      
      const result = await cloudinary.uploader.upload(req.file.path);
      const imageUrl = result.secure_url;

    
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;

 
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: userId },
        { backgroundImage: imageUrl },
        { new: true, upsert: true }
      );

      if (!updatedProfile) {
        console.log("Background image URL not saved to database");
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      console.log("Background image URL saved to database");

      res.status(200).json({ success: true, message: 'Background image uploaded successfully', user: updatedProfile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error uploading background image' });
    }
  });
};



export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, username, profilePicUrl, bio, role, backgroundImage } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUserFields = {};
    if (fullName) {
      updatedUserFields.fullName = fullName;
    } else {
      updatedUserFields.fullName = currentUser.fullName || "Default Full Name";
    }
    if (username) {
      updatedUserFields.username = username;
    } else {
      updatedUserFields.username = currentUser.username || "default_username";
    }
    if (profilePicUrl) {
      updatedUserFields.profilePicUrl = profilePicUrl;
    }

    const updatedProfileFields = { ...updatedUserFields };
    if (bio) {
      updatedProfileFields.userBio = bio;
    }
    if (role) {
      updatedProfileFields.userRole = role;
    }
   
    if (backgroundImage) {
      updatedProfileFields.backgroundImage = backgroundImage;
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      updatedProfileFields,
      { new: true, upsert: true }
    );

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserFields, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};




export const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

   
    let userProfile = await UserProfile.findOne({ userId });

    if (!userProfile || !userProfile.fullName || !userProfile.username) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    
      return res.status(200).json({ success: true, user: { fullName: user.fullName, username: user.username, profilePicUrl: userProfile ? userProfile.profilePicUrl : user.profilePicUrl, backgroundImage: userProfile ? userProfile.backgroundImage : null } });
    }

    
    const { fullName, username, profilePicUrl, userBio, userRole, backgroundImage } = userProfile;
    res.status(200).json({ success: true, user: { fullName, username, profilePicUrl, userBio, userRole, backgroundImage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};
