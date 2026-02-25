import {Router} from "express";
import { 
  activeCheck, 
  CreatePost,
  getAllPosts,
  getAllPostsPaginated,
  getAllPostsCursor,
  deletePost,
  commentPost,
  getComments,
  getCommentsPaginated,
  deleteCommentsByPostId,
  increment_likes, 
  getPostsByUsername,
  getPostsByUsernamePaginated
} from "../controllers/post.controller.js";
import { postLimiter, uploadLimiter, readLimiter } from "../middleware/rateLimiter.js";
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
router.route("/post").post(postLimiter, uploadLimiter, upload.single("media"), CreatePost);

// Post retrieval routes (original + paginated versions)
router.route("/posts").get(readLimiter, getAllPosts);
router.route("/posts/paginated").get(readLimiter, getAllPostsPaginated);
router.route("/posts/feed").get(readLimiter, getAllPostsCursor);

router.route("/posts_by_username").get(readLimiter, getPostsByUsername);
router.route("/posts_by_username/paginated").get(readLimiter, getPostsByUsernamePaginated);

router.route("/delete_post").delete(deletePost);

// Comment operations
router.route("/comment_post").post(commentPost);
router.route("/get_comments").get(readLimiter, getComments);
router.route("/get_comments/paginated").get(readLimiter, getCommentsPaginated);
router.route("/delete_comments").delete(deleteCommentsByPostId);

// Post interactions
router.route("/increment_likes").post(increment_likes);

export default router;