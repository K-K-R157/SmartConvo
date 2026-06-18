
// async means that the function will return a promise and do not wait for it to finish and other tasks can be executed in that time

import { upsertStreamUser } from '../lib/stream.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


// // do not signup just for rendering

export  async function signup(req, res) {
    // res.send('User signed up successfully');
    const {email, password, fullName,username} = req.body;
// Allow frontend to send either "fullName" or "username"
const name = fullName || username;

    try {
      if(!email || !password || !name){
        return res.status(400).json({ message: 'Please fill all the fields' });
      }
      if(password.length < 6){
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

     try {
      await upsertStreamUser({
        // 📩 Calls the upsertStreamUser() function you created earlier.

        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token =jwt.sign({userId:newUser._id}, process.env.JWT_SECRET, {
      expiresIn: '30d', // Token will expire in 30 days
    })

    res.cookie("jwt" , token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie will expire in 30 days
      sameSite: 'strict', // Helps prevent CSRF attacks
    });

        res.status(201).json({ success: true, user: newUser });

  } 

  catch(error){
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

} 

// do not signup

// export async function signup(req, res) {
//   const { email, password, fullName, username } = req.body;
//   const name = fullName || username;

//   try {
//     if (!email || !password || !name) {
//       return res.status(400).json({ message: "Please fill all the fields" });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters long" });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "Email already exists, please use a different one" });
//     }

//     const idx = Math.floor(Math.random() * 100) + 1;
//     const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

//     const newUser = await User.create({
//       email,
//       fullName: name,   // ✅ use name (fullName || username)
//       password,
//       profilePic: randomAvatar,
//     });

//     try {
//       await upsertStreamUser({
//         id: newUser._id.toString(),
//         name: newUser.fullName,
//         image: newUser.profilePic || "",
//       });
//       console.log(`Stream user created for ${newUser.fullName}`);
//     } catch (error) {
//       console.log("Error creating Stream user:", error);
//     }

//     const token = jwt.sign(
//       { userId: newUser._id },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "30d" }
//     );

//     res.cookie("jwt", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//       sameSite: "strict",
//     });

//     res.status(201).json({ success: true, user: newUser });
//   } catch (error) {
//     console.error("Error during signup:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    // matchPassword is a method defined in the User model to compare the entered password with the hashed password
    // If the password is not correct, return an error
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("jwt", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}


export async function onboard(req, res) {
  try {
    const userId = req.user._id;
// This means the user is already logged in and verified.
//✅ Get user ID from the token (already decoded and stored by middleware):


    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      // see User written means it is mongoose model used to interact with the database and update the user information based on the userId that we got from the token
      userId,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        isOnboarded: true, // Set isOnboarded to true
      },
      { new: true } // Return the updated user document
    );
// during signup this information is not provided so we need to update it later in database you can check it when you signup a new user this information is not provided and show empty 

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // update the user info in stream
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

