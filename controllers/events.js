import Event from "../models/event.js";
import cloudinary from '../utils/cloudinary.js';
import upload from '../middlewares/multer.js';
import User from '../models/user.js';
import UserProfile from '../models/profile .js';

export const createEvent = async (req, res) => {
  upload.array('eventimages', 10)(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading files' });
    }

    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    const { eventType, eventCategory, eventSubcategory, venueName, venueAddress, date, time, description, fees, interests } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const userProfile = await UserProfile.findOne({ userId: req.user.id });
      if (!userProfile) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        })
      );

      const interestsArray = Array.isArray(interests) ? interests : [interests];

      const newEvent = new Event({
        eventType,
        eventCategory,
        eventSubcategory,
        venueName,
        venueAddress,
        date,
        time,
        images: imageUrls,
        description,
        fees,
        interests: interestsArray,
        createdBy: user.fullName,
        creatorProfilePic: userProfile.profilePicUrl,
        creatorId: user._id,
      });

      await newEvent.save();

      res.status(201).json({ success: true, event: newEvent });
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ success: false, message: 'Error creating event' });
    }
  });
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate({
      path: 'creatorId',
      select: 'fullName profilePicUrl'
    }).select('creatorId eventType eventCategory eventSubcategory venueName venueAddress date time images description fees interests');

    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
};
