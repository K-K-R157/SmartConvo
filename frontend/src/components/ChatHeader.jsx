import React from "react";

const ChatHeader = ({ selectedUser, onlineUsers }) => {
  const formatLastSeen = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `last seen ${d.toLocaleDateString([], { weekday: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 flex items-center gap-3">
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
  );
};

export default ChatHeader;