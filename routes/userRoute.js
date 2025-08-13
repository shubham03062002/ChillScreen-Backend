import express from "express";
import { 
    login,
    register,
    addToFavourites,
    removeFromFavourites,
    addToWatchlist,
    removeFromWatchlist,
    getFavourites,
    getWatchlist,
    getuser
} from "../controllers/user.js";
import { authMiddleware } from "../auth/auth.js";

const router = express.Router(); 

router.post("/login", login);
router.post("/register", register);
router.put("/addtofav", authMiddleware, addToFavourites);
router.put("/addtowatch", authMiddleware, addToWatchlist);
router.put("/rmfav", authMiddleware, removeFromFavourites);
router.put("/rmwatch", authMiddleware, removeFromWatchlist);
router.get("/getfav", authMiddleware, getFavourites);
router.get("/getwatch", authMiddleware, getWatchlist);
router.get("/getuser", authMiddleware, getuser);

export default router;
