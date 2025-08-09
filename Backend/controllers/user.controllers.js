import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Failed to get current user" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("updateAssistant error:", error);
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);
    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res
        .status(400)
        .json({ response: "Sorry, I can't understand that." });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const { type, userInput, response: aiResponse } = gemResult;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput,
          response: `This month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput,
          response: aiResponse,
        });

      default:
        return res
          .status(400)
          .json({ response: "I didn't understand that command." });
    }
  } catch (error) {
    console.error("askToAssistant error:", error);
    return res.status(500).json({ response: "Assistant error occurred" });
  }
};
