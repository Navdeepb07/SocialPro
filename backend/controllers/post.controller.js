import Profile from "../models/profile.models.js";
import User from "../models/user.models.js";
import Post from "../models/post.models.js";
import Comment from "../models/comments.models.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

export const CreatePost = async (req, res) => {
  try {
    const { token} = req.body; 
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    })

    await post.save();
    return res.status(201).json({ message: "Post created successfully"});
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  } 
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name username email ProfilePicture");
    return res.status(200).json(posts);

  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const deletePost = async (req, res) => {
  try {
    const {token,postId} = req.body;
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId, userId: user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or you are not authorized to delete this post" });
    }

    if(post.userId.toString() !== user._id.toString()){
      return res.status(401).json({ message: "You are not authorized to delete this post" });
    }

    await Post.deleteOne({ _id: postId });
    return res.status(200).json({ message: "Post deleted successfully" });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const commentPost = async (req, res) => {
  try {
    const { token, postId, comment } = req.body;
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = new Comment({
      postId: post._id,
      userId: user._id,
      body: comment
    });
    await newComment.save();
    return res.status(201).json({ message: "Comment added successfully" });
  }

  catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getComments = async (req, res) => {
  try {
    const { postId } = req.query;
    const comments = await Comment.find({ postId: postId }).populate("userId", "name username ProfilePicture");
    return res.status(200).json({ comments: comments.reverse() });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const deleteCommentsByPostId = async (req,res) => {
  try {
    const{token,commentId} = req.body;
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if(comment.userId.toString() !== user._id.toString()){
      return res.status(401).json({ message: "You are not authorized to delete this comment" });
    }
    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ message: "Comment deleted successfully" });
  } 
  catch (err) {   
    return res.status(500).json({ message: err.message });
  }
}

export const increment_likes = async (req,res) => {
  try {
    const {postId} = req.body;
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes += 1;
    await post.save();
    return res.status(200).json({ message: "Likes incremented", likes: post.likes });
  }
  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export const getPostsByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ userId: user._id })
      .populate("userId", "name username email ProfilePicture")
      .sort({ createdAt: -1 });
    
    return res.status(200).json(posts);
  }
  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}