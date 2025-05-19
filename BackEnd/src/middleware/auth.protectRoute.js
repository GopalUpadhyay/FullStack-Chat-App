import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// [next: UpdateProfile] is used that if the 'protectedRouted' works fine then the next function will bw called i.e. [UpdateProfile].

export const protectedRoute = async (req, res, next) => {
	try {
		// {JWT_Token} is the Name of the Cookies.
		const token = req.cookies.JWT_Token;
		if (!token) {
			return res
				.status(401)
				.json({ message: "Unorthorised - No Token Provided." });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res
				.status(400)
				.json({ message: "Unauthorised - No Token Provided." });
		}
		// Use FindById to find User IN DB, because FindOne ask Object as input.
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User Not Found." });
		}

		// Attaching the User to the request Objects so other files can access it with just using the ProtectedRoute Middleware.
		req.user = user;
		// Calls the [UpdateProfile] Function.
		next();
	} catch (error) {
		console.log("Error In Protected Route Controller: " + error);
		return res.status(404).json({ message: "Internal Server Error" });
	}
};
