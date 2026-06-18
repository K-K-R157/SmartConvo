// import React from "react";

// const ChatHeader = ({ selectedUser, onlineUsers }) => {
//   // Format last seen like WhatsApp
//   const formatLastSeen = (date) => {
//     if (!date) return "";
//     const d = new Date(date);
//     return `last seen ${d.toLocaleDateString([], { weekday: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
//   };

//   if (!selectedUser) return null;

//   return (
//     <div className="p-2.5 border-b border-base-300 bg-base-100 sticky top-0 z-10">
//       <div className="flex items-center gap-3">
//         <div className="avatar">
//           <div className="size-10 rounded-full relative">
//             <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
//           </div>
//         </div>
//         <div>
//           <h3 className="font-medium">{selectedUser.fullName}</h3>
//           <p className="text-sm text-base-content/70">
//             {onlineUsers?.includes(selectedUser._id)
//               ? <span className="text-green-500">Online</span>
//               : formatLastSeen(selectedUser.lastSeen)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;











import React from "react";
import { Video } from "lucide-react";
import { useNavigate } from "react-router-dom";


const ChatHeader = ({ selectedUser, onlineUsers,onVideoCall }) => {
  const navigate = useNavigate();

  // Format last seen like WhatsApp
  const formatLastSeen = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `last seen ${d.toLocaleDateString([], { weekday: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100 sticky top-0 z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="size-10 rounded-full relative">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>
        <div>
          <h3 className="font-medium">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {onlineUsers?.includes(selectedUser._id)
              ? <span className="text-green-500">Online</span>
              : formatLastSeen(selectedUser.lastSeen)}
          </p>
        </div>
      </div>
      {/* 🎥 Video Call Button */}
      <button
        className="btn btn-circle btn-ghost"
        title="Start Video Call"
        // onClick={() => navigate(`/call/${selectedUser._id}`)}//*************** */
        onClick={onVideoCall}
      >
        <Video className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatHeader;