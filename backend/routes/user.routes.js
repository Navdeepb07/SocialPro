import { Router } from "express";
import { login, register, uploadProfilePicture,updateUserProfile, getUserAndProfile,updateProfileData,getAllUserProfiles,downloadResume, sendConnectionRequest,getMyConnectionRequests,whatAreMyConnections,respondToConnectionRequest,getUserProfileAndUserBasedOnUsername,getAllMyConnections} from "../controllers/user.controller.js";
import { authLimiter, uploadLimiter, readLimiter, apiLimiter } from "../middleware/rateLimiter.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload = multer({storage:storage});

// Authentication routes (strict rate limiting for security)
router.route("/register").post(authLimiter, register);
router.route("/login").post(authLimiter, login);

// Profile routes (moderate rate limiting for updates)
router.route("/update_profile_picture").post(uploadLimiter, upload.single('profile_picture'), uploadProfilePicture);
router.route("/user_update").post(apiLimiter, updateUserProfile);
router.route("/update_profile").post(apiLimiter, updateProfileData);

// Data retrieval routes (light rate limiting for reads)
router.route("/get_user_and_profile").get(readLimiter, getUserAndProfile);
router.route("/user/get_all_users").get(readLimiter, getAllUserProfiles);
router.route("/user/get_profile_username").get(readLimiter, getUserProfileAndUserBasedOnUsername);

// Connection routes (moderate rate limiting)
router.route("/user/send_connection_request").post(apiLimiter, sendConnectionRequest);
router.route("/user/getConnectionRequests").get(readLimiter, getMyConnectionRequests);
router.route("/user/user_connection-requests").get(readLimiter, whatAreMyConnections);
router.route("/user/accept_connection_request").post(apiLimiter, respondToConnectionRequest);
router.route("/user/get_all_connections").get(readLimiter, getAllMyConnections);

// Utility routes
router.route("/user/download_resume").get(downloadResume);

export default router;