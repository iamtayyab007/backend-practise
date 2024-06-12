import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadDir from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = asyncHandler(async (res, req) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};
  } catch (error) {
    throw ApiError(
      500,
      "Something wen't wrong while generating access and refresh token"
    );
  }
});

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "OK",
  // });
  // get user details from frontend
  // validation- not empty
  // check if user already exists: username, email
  // check for images, and check for avatar
  //upload to cloudinary, avatar
  // create user object- create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const {fullName, email, username, password} = req.body;

  // if (fullName === "") { // tradition if else statement
  //   throw ApiError(400, "Fullname is required");
  // }

  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw ApiError(400, "Fullname is required");
  }

  const existedUser = await User.findOne({
    $or: [{username}, {email}],
  });
  if (existedUser) {
    throw new ApiError(409, "the username and email already existed.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(avatarLocalPath);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadDir(avatarLocalPath);
  const coverImage = await uploadDir(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("Something wen't wrong when registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  // username or email
  //find the user
  //check the password
  //access and refresh token
  // send cookie

  const {email, username, password} = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.find({$or: [{email}, {password}]});

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password, -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {user: loggedInUser, accessToken, refreshToken},
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (res, req) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"));
});

export {registerUser, loginUser, logoutUser};
