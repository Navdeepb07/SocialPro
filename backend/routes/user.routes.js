import { Router } from "express";
import { login, register, uploadProfilePicture,updateUserProfile, getUserAndProfile,updateProfileData,getAllUserProfiles,downloadResume, sendConnectionRequest,getMyConnectionRequests,whatAreMyConnections,respondToConnectionRequest,getUserProfileAndUserBasedOnUsername,getAllMyConnections} from "../controllers/user.controller.js";
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

// Authentication routes
router.route("/register").post(register);
router.route("/login").post(login);

// Profile routes
router.route("/update_profile_picture").post(upload.single('profile_picture'), uploadProfilePicture);
router.route("/user_update").post(updateUserProfile);
router.route("/update_profile").post(updateProfileData);

// Data retrieval routes
router.route("/get_user_and_profile").get(getUserAndProfile);

router.route("/user/get_all_users").get(getAllUserProfiles);

router.route("/user/get_profile_username").get(getUserProfileAndUserBasedOnUsername);

// Connection routes
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(getMyConnectionRequests);
router.route("/user/user_connection-requests").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(respondToConnectionRequest);
router.route("/user/get_all_connections").get(getAllMyConnections);

// Utility routes
router.route("/user/download_resume").get(downloadResume);

export default router;