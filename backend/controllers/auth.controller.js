import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../db/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../db/emailTemplates.js";

dotenv.config();

export const register = async (req, res) => {
  // get date from the frontent
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(404).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // cheak email already exist or not in database

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    // password ko hashed karo jo password user de rha hai
    const hashedPassword = await bcrypt.hash(password, 10);

    //naya user create karo  with hashed password
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // new usercreate kiya hua user ko save methods se save karo  database me
    await user.save();

    // jwt token generate karo
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      sameSite:  "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // send welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to developer Group",
      text: `Welcome to developer group. your account has been created in our team with your email ${email}. Let's build somthing new`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    console.log("Registration error:", error); // ADD THIS
    res.status(401).json({
      success: false,
      message: "user register unsuccessful",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: true,
      sameSite:  "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User LoggedIn",
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User LoggedOut",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// send verification OTP to your User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      res.json({ success: false, message: "Account already verified" });
    }

    // generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOTP = otp;
    user.verifyOTPexpiryAt = Date.now() + 24 * 60 * 60 * 1000;

    // console.log(otp);

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      // text: `Your OTP is ${otp}. Verify your account using this OTP`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOption);

    res.json({
      success: true,
      message: "Verification OTP sent to your email",
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "send verification otp failed",
    });
  }
};

// verify email otp after putting in the verification blank
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Missing details..",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found ",
      });
    }

    if (user.verifyOTP === "" || user.verifyOTP !== otp) {
      return res.json({
        success: false,
        message: "Invalid otp",
      });
    }

    if (user.verifyOTPexpiryAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    user.isVerified = true;
    user.verifyOTP = "";
    user.verifyOTPexpiryAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Error in Verification Otp filling",
    });
  }
};

//cheak user authenticate or not

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "User Authennticate failed",
    });
  }
};

// send password reset OTP

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000;

    
    await user.save();
    
    console.log(otp);
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP",
      // text: `Your OTP for reseting your password is ${otp}.Use this OTP to proceed with resetting your password`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    // console.log(mailOption);
    
    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "OTP send to your Email",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "reset password setOTP failed",
    });
  }
};

// Reset user password

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, newPassword are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }


    if (user.resetOTP === "" || user.resetOTP !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOTPExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = "";
    user.resetOTPExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "reset password failed",
    });
  }
};
