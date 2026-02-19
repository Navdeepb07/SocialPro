import {Router} from "express";
import { activeCheck, CreatePost,getAllPosts,deletePost,commentPost,getComments,deleteCommentsByPostId,increment_likes, getPostsByUsername} from "../controllers/post.controller.js";
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

// Health check
router.route("/").get(activeCheck);

// Post CRUD operations
router.route("/post").post(upload.single("media"), CreatePost);

router.route("/posts").get(getAllPosts);

router.route("/posts_by_username").get(getPostsByUsername);

router.route("/delete_post").delete(deletePost);

// Comment operations
router.route("/comment_post").post(commentPost);
router.route("/get_comments").get(getComments);
router.route("/delete_comments").delete(deleteCommentsByPostId);

// Post interactions
router.route("/increment_likes").post(increment_likes);

export default router;