import jwt from "jsonwebtoken";

export const generateTokens = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("JWT_Token", token, {
		maxAge: 7 * 24 * 60 * 60 * 1000, //Maximum time till the cookie Expire. (7-Days).
		httpOnly: true, //Prvent XSS Atack Cross Site Scripting Attack.
		sameSite: "strict", //CSRF (Cross-Site Request Forgery) attacks.
		secure: process.env.NODE_ENV !== "development",
	});
	return token;
};
