import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		// Finding Out All the Active Users To Display On SideBar.
		const loggedInUserId = req.user._id;
		// [$ne = Not Equal], It Gives the List of all Users Except the Current User
		const filterUsers = await User.find({
			_id: { $ne: loggedInUserId },
		}).select("-password");
		res.status(200).json(filterUsers);
	} catch (error) {
		console.log("Error in Message Controller: " + error.message);
		return res.status(400).json({ message: "Internal Server Error." });
	}
};

export const getMessages = async (req, res) => {
	try {
		// Renaming the [id] to [userToChatId].
		const { id: userToChatId } = req.params;
		const myId = req.user._id;

		const messages = await Message.find({
			// Catching all the message Where Sender is me OR reciever is other User OR Vise Versa.
			$or: [
				{ senderId: myId, recieverId: userToChatId },
				{ senderId: userToChatId, recieverId: myId },
			],
		});
		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in get Message Controller: " + error.message);
		return res.status(500).json({ message: "ERROR: nternal Server Error." });
	}
};

export const sendMessages = async (req, res) => {
	try {
		const { text, image } = req.body;
		const { id: recieverId } = req.params;
		const senderId = req.user._id;

		let imageUrl;
		if (image) {
			let uploadResponse = await cloudinary.uploader.upload(image);
			imageUrl = uploadResponse.secure_url;
		}
		const newMessage = new Message({
			senderId,
			recieverId,
			text,
			image: imageUrl,
		});
		await newMessage.save();

		// todo: Real Time Functionality Goes Here => Socket.io
		const receiverSocketId = getReceiverSocketId(recieverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}
		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in send Message Controller: ", error.message);
		return res.status(500).json({ message: "Internal Server Error." });
	}
};
