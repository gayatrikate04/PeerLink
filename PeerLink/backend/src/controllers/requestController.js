const Request = require("../models/Request");
const User = require("../models/User");

const {
  sendConnectionRequestNotification,
} = require("../services/notificationService");

// Send a connection request
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    // Check if request already exists
    const existing = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    // Find sender and receiver
    const sender = await User.findById(senderId).select("name email");
    const receiver = await User.findById(receiverId).select("name email");


    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // Create connection request
    const request = new Request({
      sender: senderId,
      receiver: receiverId,
    });

    await request.save();

    // Send email notification
    try {
      await sendConnectionRequestNotification({
        sender,
        receiver,
      });
    } catch (emailError) {
      console.error("Connection request email failed:", emailError);
    }

    res.status(201).json({
      message: "Request sent",
      request,
    });
  } catch (err) {
    console.error("Send request error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Get pending requests received by current user
exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Request.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name email");

    res.json({ requests });
  } catch (err) {
    console.error("Get requests error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Accept or reject a connection request
exports.respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already handled",
      });
    }

    request.status = action === "accept" ? "accepted" : "rejected";

    await request.save();

    res.json({
      message: `Request ${request.status}`,
    });
  } catch (err) {
    console.error("Respond request error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Get all requests involving current user
exports.getAllRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    res.json({ requests });
  } catch (err) {
    console.error("Get all requests error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
