import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Signup
export const register = async (req, res) => {
  try {
    const { name, surname, email, phone, password } = req.body;

    if (!name || !surname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      surname,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.jWT_SECRET, {
      expiresIn: "1d",
    });

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Vercel = production
      sameSite: "None", // allow cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --- Add to Watchlist --- */
export const addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { id } = req.body; // Get the movie/series ID from body

    // Check if already in watchlist
    const alreadyExists = user.watch_list.some(item => String(item.id) === String(id));
    if (alreadyExists) {
      return res.status(400).json({ message: "Already in watchlist" });
    }

    // Add to watchlist
    user.watch_list.push(req.body);
    await user.save();

    res.json({ message: "Added to watchlist", watchlist: user.watch_list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --- Remove from Watchlist --- */
export const removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Movie ID is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const beforeLength = user.watch_list.length;
    user.watch_list = user.watch_list.filter(item => String(item.id) !== String(id));

    if (user.watch_list.length === beforeLength) {
      return res.status(404).json({ message: "Movie not found in watchlist" });
    }

    await user.save();

    res.json({
      message: "Removed from watchlist",
      watch_list: user.watch_list,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --- Add to Favourites --- */
export const addToFavourites = async (req, res) => {
  try {
    const { id } = req.body; // Extract id from the request body

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already in favourites
    const alreadyExists = user.favourites.some(item => String(item.id) === String(id));
    if (alreadyExists) {
      return res.status(400).json({ message: "Already in favourites" });
    }

    user.favourites.push(req.body);
    await user.save();

    res.json({ message: "Added to favourites", favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* --- Remove from Favourites --- */
export const removeFromFavourites = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Movie ID is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const beforeLength = user.favourites.length;
    user.favourites = user.favourites.filter(item => String(item.id) !== String(id));

    if (user.favourites.length === beforeLength) {
      return res.status(404).json({ message: "Movie not found in favourites" });
    }

    await user.save();

    res.json({ message: "Removed from favourites", favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --- Get Favourites --- */
export const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favourites");
    res.json(user?.favourites || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* --- Get Watchlist --- */
export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("watch_list");
    res.json(user?.watch_list || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// GET USER INFO API
export const  getuser = async (req, res) => {
  try {

      const user = await User.findById(req.userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Send complete user info
      res.status(200).json({
          id: user._id,
          name: user.name,
          surname:user.surname,
          email: user.email,
          favourites: user.favourites || [],
          watchlist: user.watch_list || []
      });

  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};
