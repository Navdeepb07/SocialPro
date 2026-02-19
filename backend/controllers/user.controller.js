import User from "../models/user.models.js";
import Profile from "../models/profile.models.js";
import ConnectionRequest from "../models/connection.models.js";
import { createNotification } from "./notification.controller.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataToPDF = async(userData)=>{
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(32).toString("hex")+ ".pdf";
  const stream = fs.createWriteStream("uploads/"+outputPath);
  doc.pipe(stream);

  // Add profile picture if it exists
  if (userData.userId.profilePicture) {
    try {
      doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 100, height: 100 });
    } catch (error) {
      console.log("Profile picture not found, skipping...");
    }
  }
  
  doc.fontSize(14).text(`Name:  ${userData.userId.name}`);
  doc.fontSize(14).text(`Email:  ${userData.userId.email}`);
  doc.fontSize(14).text(`Username:  ${userData.userId.username}`);
  doc.fontSize(14).text(`Bio:  ${userData.bio || 'N/A'}`);
  doc.fontSize(14).text(`Current Position:  ${userData.currentPost || 'N/A'}`);
  
  doc.fontSize(14).text("Past Work: ");
  if (userData.pastWork && userData.pastWork.length > 0) {
    userData.pastWork.forEach((work, index) => {
      doc.fontSize(12).text(`Company Name: ${work.company}`);
      doc.fontSize(12).text(`Position: ${work.position}`);
      doc.fontSize(12).text(`Years: ${work.years}`);
      doc.moveDown();
    });
  } else {
    doc.fontSize(12).text("No past work experience listed.");
  }

  // Always end the document properly
  doc.end();

  // Return a promise that resolves when the PDF is fully written
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(outputPath);
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

export const register = async(req,res)=>{
  try{
    const {name,email,username,password} = req.body;
    if(!name || !email || !username || !password) return res.status(400).json({message:"All fields are required"});

    const user = await User.findOne({
      email:email
    })

    if(user) return res.status(400).json({message:"User already exists"});

    const  hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({
      name,
      email,
      password:hashedPassword,
      username
    });

    await newUser.save();

    const profile = new Profile({
      userId:newUser._id
    })

    await profile.save();

    return res.status(201).json({message:"User registered successfully"});
  }
  catch(err){
    return err.status(500).json({message:err.message});
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Save token in DB
    await User.updateOne(
      { _id: user._id },
      { token },
      { new: true }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfilePicture = async(req,res)=>{
  const {token} = req.body;
  try{

    const user = await User.findOne({token:token});

    if(!user) return res.status(404).json({message:"User not found"});
    user.profilePicture = req.file.filename;

    await user.save();

    return res.status(200).json({message:"Profile picture updated"});

  }
  catch(err){
    return res.status(500).json({message:err.message});
  }
}

export const updateUserProfile = async(req,res)=>{
  try{
    const {token,...newUserData} = req.body;

    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});

    const {username,email} = newUserData;
    const existingUser = await User.findOne({$or:[{username},{email}]});
    if(existingUser){
      if(existingUser || String(existingUser._id)!== String(user._id)){
        return res.status(400).json({message:"User already exists"});
      }
    }
    Object.assign(user,newUserData);
    await user.save();

    return res.status(200).json({message:"User updated"});
  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}

export const getUserAndProfile = async(req,res)=>{
  try{
    const {token} = req.query;
    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});

    const userProfile = await Profile.findOne({userId:user._id})
    .populate('userId','name email username profilePicture');

    return res.json(userProfile);

  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}

export const updateProfileData = async(req,res)=>{
  try{
    const {token,...newProfileData} = req.body;

    const userProfile = await User.findOne({token:token});
    if(!userProfile) return res.status(404).json({message:"User not found"}); 

    const profile = await Profile.findOne({userId:userProfile._id});
    if(!profile) return res.status(404).json({message:"Profile not found"});    

    Object.assign(profile,newProfileData);
    await profile.save();
    return res.status(200).json({message:"Profile updated"});
  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}


export const getAllUserProfiles = async(req,res)=>{
  try{
    const profiles = await Profile.find()
    .populate('userId','name email username profilePicture');
    return res.status(200).json(profiles);
  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}


export const downloadResume = async(req,res)=>{
  try{
    const user_id = req.query.id;
    const profile = await Profile.findOne({userId:user_id})
    .populate('userId','name email username profilePicture');

    if(!profile) return res.status(404).json({message:"Profile not found"});

    let outputPath = await convertUserDataToPDF(profile);

    return res.status(200).json({url:outputPath});

  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}

export const sendConnectionRequest = async(req,res)=>{
  try{
    const {token,connectToUserId} = req.body; 

    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});

    const connectionUser = await User.findOne({_id:connectToUserId});
    if(!connectionUser) return res.status(404).json({message:"Connection User not found"});

    const existingRequest = await ConnectionRequest.findOne({
      userId:user._id,
      connectionId:connectToUserId
    })
    if(existingRequest){
      return res.status(400).json({message:"Connection request already sent"});
    }

    const request = new ConnectionRequest({
      userId:user._id,
      connectionId:connectToUserId,
    });
    await request.save();
    
    // Create notification for the person receiving the request
    try {
      await createNotification(
        connectToUserId,
        user._id,
        'connection_request',
        'New Connection Request',
        `${user.name} wants to connect with you`,
        { requestId: request._id }
      );
    } catch (notificationError) {
      console.error('Failed to create connection request notification:', notificationError);
    }
    
    return res.status(200).json({message:"Connection request sent"});
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}


export const getMyConnectionRequests = async(req,res)=>{
  try{
    const {token} = req.query;
    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});  

    const requests = await ConnectionRequest.find({userId:user._id})
    .populate('connectionId','name email username profilePicture');

    return res.status(200).json(requests);
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}

export const whatAreMyConnections = async(req,res)=>{
  try{
    const {token} = req.query;
    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});  

    // Get connection requests sent TO me (where I am the connectionId)
    const connections = await ConnectionRequest.find({connectionId:user._id})
    .populate('userId','name email username profilePicture');
    return res.status(200).json(connections);
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}

export const respondToConnectionRequest = async(req,res)=>{
  try{
    const {token,requestId,accept} = req.body;
    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});

    const connectionRequest = await ConnectionRequest.findOne({_id:requestId})
      .populate('userId', 'name email username profilePicture');
    if(!connectionRequest) return res.status(404).json({message:"Connection request not found"});

    if(accept === "accept"){
      connectionRequest.status = true;
      await connectionRequest.save();
      
      // Create notification for the person who sent the request
      try {
        await createNotification(
          connectionRequest.userId._id,
          user._id,
          'connection_accepted',
          'Connection Accepted',
          `${user.name} accepted your connection request`,
          { connectionId: connectionRequest._id }
        );
      } catch (notificationError) {
        console.error('Failed to create connection accepted notification:', notificationError);
      }
      
      return res.status(200).json({message:"Connection request accepted"});
    }
    else if(accept === "reject"){
      await ConnectionRequest.deleteOne({_id:requestId});
      return res.status(200).json({message:"Connection request rejected"});
    }
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}

export const getAllMyConnections = async(req,res)=>{
  try{
    const {token} = req.query;
    const user = await User.findOne({token:token});
    if(!user) return res.status(404).json({message:"User not found"});  

    // Get all connections where I am involved (both directions)
    const sentRequests = await ConnectionRequest.find({userId:user._id})
    .populate('connectionId','name email username profilePicture');
    
    const receivedRequests = await ConnectionRequest.find({connectionId:user._id})
    .populate('userId','name email username profilePicture');

    return res.status(200).json({
      sentRequests: sentRequests,
      receivedRequests: receivedRequests
    });
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}

export const getUserProfileAndUserBasedOnUsername = async(req,res)=>{
  try{
    const {username} = req.query;
    const user = await User.findOne({username:username}); 
    if(!user) return res.status(404).json({message:"User not found"});

    const userProfile = await Profile.findOne({userId:user._id})
    .populate('userId','name email username profilePicture'); 
    return res.status(200).json(userProfile);

  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}

// Debug endpoint to check all connections
export const debugAllConnections = async(req,res)=>{
  try{
    const allConnections = await ConnectionRequest.find({})
    .populate('userId','name email username')
    .populate('connectionId','name email username');
    
    console.log("All connections in database:", allConnections);
    return res.status(200).json({
      total: allConnections.length,
      connections: allConnections
    });
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
}