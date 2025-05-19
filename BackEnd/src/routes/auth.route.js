import express from "express";
import {
  signUp,
  LogOut,
  Login,
  UpdateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.protectRoute.js";

const router = express.Router();

// Use consistent lowercase route names (/routeName) and appropriate HTTP methods.
router.post("/signup", signUp);
router.post("/login", Login);
router.post("/logout", LogOut);

// First Authorise using miidleware [protectedRoute()] Then Call the [UpdateProfile()]
router.put("/update-profile", protectedRoute, UpdateProfile);
router.get("/check", protectedRoute, checkAuth);

export default router;
