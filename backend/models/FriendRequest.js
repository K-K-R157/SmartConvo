import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
// 🧾 Example Friend Request:
// {
//   "_id": "123",
//   "sender": "userB_id",
//   "recipient": "userA_id",
//   "status": "pending"
// }



const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;