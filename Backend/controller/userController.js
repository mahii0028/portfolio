import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../model/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar And Resume Are Required!", 400));
  }
  const { avatar, resume } = req.files;

  const cloudinaryResForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "AVATARS" }
  );
  if (!cloudinaryResForAvatar || cloudinaryResForAvatar.error) {
    console.log(
      "Cloudinary Error:",
      cloudinaryResForAvatar.error || "Unknown Cloudinary Error"
    );
  }

  const cloudinaryResForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "RESUME" }
  );
  if (!cloudinaryResForResume || cloudinaryResForResume.error) {
    console.log(
      "Cloudinary Error:",
      cloudinaryResForResume.error || "Unknown Cloudinary Error"
    );
  }
  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    linkedInURL,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    linkedInURL,
    avatar: {
      public_id: cloudinaryResForAvatar.public_id,
      url: cloudinaryResForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResForResume.public_id,
      url: cloudinaryResForResume.secure_url,
    },
  });

  generateToken(user, "User Registered", 201, res);
});

export const userLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password are Required!"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or password!"));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or password!"));
  }
  generateToken(user, "LoggedIn Successfully", 200, res);
});

export const userLogout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    password: req.body.password,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    linkedInURL: req.body.linkedInURL,
  };

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResForAvatar = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "AVATARS" }
    );
    newUserData.avatar = {
      public_id: cloudinaryResForAvatar.public_id,
      url: cloudinaryResForAvatar.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const cloudinaryResForResume = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "RESUME" }
    );
    newUserData.resume = {
      public_id: cloudinaryResForResume.public_id,
      url: cloudinaryResForResume.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updates!",
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNePassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNePassword) {
    return next(new ErrorHandler("Please Fill All Fields!", 400));
  }
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (isPasswordMatched) {
    return next(new ErrorHandler("Incorrect  Current Password", 400));
  }
  if (newPassword !== confirmNePassword) {
    return next(
      new ErrorHandler(
        "New Password And Confirm New Password Do Not Matched!!",
        400
      )
    );
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated!",
  });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "";
  const user = await User.findById(id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you've 
  not request for this please ignore it.`;

  try {
    await sendEmail({
      emai: user.email,
      subject: "Personal Portfolio Dashboard Recovery Password",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
});
