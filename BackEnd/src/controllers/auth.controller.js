import { generateTokens } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
	// Validate req.body
	if (!req.body) {
		return res.status(400).json({ message: "Request body is missing." });
	}

	const { fullName, email, password } = req.body;

	// Validate individual fields
	if (!fullName || !email || !password) {
		return res.status(400).json({ message: "All fields are required." });
	}

	try {
		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password Must Be At Least 6 Characters" });
		}

		// Check if User already exists with Same Email ID.
		const user = await User.findOne({ email });
		if (user) return res.status(400).json({ message: "Email Already Exists." });

		// Password Hashing.
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Creating New User
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
		});

		await newUser.save();

		// Generate JWT Token Here.
		generateTokens(newUser._id, res);

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			email: newUser.email,
		});
	} catch (error) {
		console.log("Error in SignUp Controller: " + error.message);
		return res.status(500).json({ message: "Internal Server Error." });
	}
};

export const Login = async (req, res) => {
	const { email, password } = req.body;

	try {
		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required." });
		}
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "Invalid Credentials." });
		}

		const isPasswordCorrect = bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid Credentials." });
		}

		generateTokens(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error In Login Controller: " + error.message);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

export const LogOut = (req, res) => {
	// Delete / Remove the Cookie to make Sure that user have to logIn Next time.
	try {
		// Setting [MaxAge: 0] to make sure cookie removes.
		res.cookie("JWT_Token", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged Out Succesfully." });
	} catch (error) {
		console.log("Error In LogOut Controller: " + error);
		res.status(500).json({ message: "Facing Error While Logging Out." });
	}
};

export const UpdateProfile = async (req, res) => {
	try {
		const { profilePic } = req.body;
		// Since [UpdateProfile] is the Next function and is being called inside the [protectedRoute] So the User is Already Defined inside [protectedRoute].

		const userId = req.user._id;

		if (!profilePic) {
			return res.status(400).json({ message: "Profile Pic Is Required." });
		}

		console.log("Profile Log: ", profilePic);

		// Uploading the Pic to CloudInary.
		const uploadResponse = await cloudinary.uploader.upload(profilePic);
		console.log("uploadResponse: ", uploadResponse);

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ profilePic: uploadResponse.secure_url },
			{ new: true }
		);

		res.status(200).json({ updatedUser });
	} catch (error) {
		console.log("Error In UpdateProfile Controller: " + error);
		return res.status(500).json({ message: "Internal Server Error." });
	}
};

export const checkAuth = (req, res) => {
	try {
		return res.status(200).json(req.user);
	} catch (error) {
		console.log("Error in CheckAuth Controller: " + error);
		return res.status(500).json({ message: "Internal Server Error." });
	}
};
