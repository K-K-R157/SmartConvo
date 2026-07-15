import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../hooks/useSocket";
import { useParams, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import VideoCall from "./VideoCall";
import { Mic, MicOff, Send, Video, PhoneCall } from "lucide-react";

const ChatContainer = () => {
  const { id: selectedUserId } = useParams();
  const { authUser: currentUser } = useAuthUser();
  const socket = useSocket(currentUser?._id);
  const navigate = useNavigate();

  const {
    messages,
    isMessagesLoading,
    hasMore,
    setSelectedUser,
    selectedUser,
    getMessages,
    addMessage,
    markMessagesAsRead,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [translationLanguage, setTranslationLanguage] = useState("english");
  const [translations, setTranslations] = useState({});

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // ✅ For infinite scroll
  const typingTimeoutRef = useRef(null);
  const isInitialLoad = useRef(true); // ✅ Track initial load for scroll behavior

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFile(null);
    return data.url;
  };

  const sendMessage = async () => {
    if ((input.trim() || file) && currentUser && selectedUser) {
      let fileUrl = null;
      if (file) fileUrl = await uploadFile();

      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: input,
        file: fileUrl,
      });

      setInput("");
      setFile(null);
      setSmartReplies([]);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && currentUser && selectedUser) {
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: true,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }, 1500);
    }
  };

  // ✅ Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // When scrolled to the top and there are more messages to load
    if (container.scrollTop === 0 && hasMore && !isMessagesLoading && messages.length > 0) {
      const previousScrollHeight = container.scrollHeight;
      const oldestMessageId = messages[0]?._id;

      getMessages(currentUser._id, { before: oldestMessageId }).then(() => {
        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        });
      });
    }
  }, [hasMore, isMessagesLoading, messages, currentUser, getMessages]);

  // Load selected user info
  useEffect(() => {
    if (!selectedUserId) return;
    axiosInstance.get(`/users/${selectedUserId}`).then((res) => {
      setSelectedUser(res.data);
    });
  }, [selectedUserId, setSelectedUser]);

  // Load initial messages
  useEffect(() => {
    if (currentUser && selectedUser) {
      isInitialLoad.current = true;
      getMessages(currentUser._id);
    }
  }, [currentUser, selectedUser, getMessages]);

  // ✅ Mark messages as read when chat opens or new messages arrive
  useEffect(() => {
    if (socket && currentUser && selectedUser) {
      // Tell the server to mark all messages from selectedUser as read
      socket.emit("markAsRead", {
        senderId: selectedUser._id,
        receiverId: currentUser._id,
      });
    }
  }, [socket, currentUser, selectedUser, messages]);

  // Socket events: receive messages, typing, read receipts
  useEffect(() => {
    if (!socket) return;

    const handleReceive = async (msg) => {
      const isCurrentChat =
        (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id);

      if (isCurrentChat) {
        addMessage(msg);

        // ✅ If it's from the other user, mark as read immediately
        if (msg.senderId === selectedUser?._id) {
          socket.emit("markAsRead", {
            senderId: selectedUser._id,
            receiverId: currentUser._id,
          });
        }

        // Only for friend's latest message with text
        if (msg.senderId === selectedUser?._id && msg.text) {
          // 1. Smart Reply Suggestions
          try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gemini/suggest-replies`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: msg.text }),
            });
            const data = await res.json();
            setSmartReplies(data.suggestions || []);
          } catch (err) {
            console.error("Smart reply error:", err);
          }

          // 2. Translation (only if language is different)
          if (translationLanguage !== "english") {
            try {
              const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: msg.text, targetLang: translationLanguage }),
              });
              const data = await res.json();
              setTranslations((prev) => ({
                ...prev,
                [msg._id]: data.translated || "",
              }));
            } catch (err) {
              console.error("Translation error:", err);
            }
          }
        }
      }
    };

    const handleTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUser?._id) setIsFriendTyping(isTyping);
    };

    // ✅ When the other user reads our messages, update status in store
    const handleMessagesRead = ({ readBy }) => {
      if (readBy === selectedUser?._id) {
        markMessagesAsRead(currentUser._id);
      }
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, currentUser, selectedUser, translationLanguage, addMessage, markMessagesAsRead]);

  const handleVideoCall = () => {
    socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
    setShowVideoCall(true);
  };

  const handleStreamVideoCall = () => {
    if (selectedUser) {
      navigate(`/call/${selectedUser._id}`);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleIncomingCall = ({ from }) => {
      if (selectedUser && from === selectedUser._id) setShowVideoCall(true);
    };
    socket.on("incoming-call", handleIncomingCall);
    return () => socket.off("incoming-call", handleIncomingCall);
  }, [socket, selectedUser]);

  // Auto-scroll to bottom on initial load and new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoad.current = false;
    } else if (!isInitialLoad.current) {
      // Only auto-scroll for new messages (not when loading older ones)
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages]);

  if (!currentUser || !selectedUser) return null;

  // ✅ Helper to render tick marks for sent messages
  const renderStatus = (message) => {
    if (message.senderId !== currentUser._id) return null;
    switch (message.status) {
      case "read":
        return <span className="text-blue-500 ml-1" title="Read">✓✓</span>;
      case "delivered":
        return <span className="opacity-60 ml-1" title="Delivered">✓✓</span>;
      case "sent":
      default:
        return <span className="opacity-40 ml-1" title="Sent">✓</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300 flex items-center justify-between">
          <ChatHeader selectedUser={selectedUser} />
          {/* Video Call Buttons */}
          <div className="flex gap-2 pr-4">
            <button
              className="btn btn-sm btn-secondary gap-1"
              onClick={handleVideoCall}
              title="Quick peer-to-peer video call (WebRTC)"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Call</span>
            </button>
            <button
              className="btn btn-sm btn-accent gap-1"
              onClick={handleStreamVideoCall}
              title="HD video call with screen sharing (Stream)"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">HD Call</span>
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="p-2 border-b border-base-300 bg-base-100">
          <label className="text-sm mr-2">🌐 Translate to:</label>
          <select
            className="select select-bordered select-sm"
            value={translationLanguage}
            onChange={(e) => setTranslationLanguage(e.target.value)}
          >
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="bengali">Bengali</option>
            <option value="french">French</option>
          </select>
        </div>

        {/* ✅ Chat Messages — with infinite scroll */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
        >
          {/* Loading spinner at top for infinite scroll */}
          {isMessagesLoading && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <span className="loading loading-spinner loading-sm" />
            </div>
          )}

          {isMessagesLoading && messages.length === 0 ? (
            <div>⏳ Loading...</div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message, idx) => (
                <div
                  key={message._id || idx}
                  className={`flex ${
                    message.senderId === currentUser._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
                      message.senderId === currentUser._id
                        ? "bg-green-200 text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    {message.text && (
                      <div>
                        <span>{message.text}</span>
                        {message.senderId === selectedUser._id &&
                          translations[message._id] &&
                          translationLanguage !== "english" && (
                            <div className="text-xs text-blue-600 mt-1 italic">
                              🌐 {translationLanguage.toUpperCase()}: {translations[message._id]}
                            </div>
                          )}
                      </div>
                    )}

                    {message.file && (
                      <a href={message.file} target="_blank" rel="noopener noreferrer">
                        {message.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={message.file} alt="file" style={{ maxWidth: 200, marginTop: 8 }} />
                        ) : (
                          <span className="text-blue-500 underline block mt-2">
                            📎 Download file
                          </span>
                        )}
                      </a>
                    )}

                    {/* ✅ Time + Read Status */}
                    <span className="flex items-center justify-end text-xs mt-1 gap-0.5">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {renderStatus(message)}
                    </span>
                  </div>
                </div>
              ))}
              {isFriendTyping && (
                <div className="text-sm text-gray-500 mt-2">
                  {selectedUser.fullName} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div>💬 No messages yet.</div>
          )}
        </div>

        {/* Smart Replies */}
        {smartReplies.length > 0 && (
          <div className="p-2 flex gap-2 bg-base-100 border-t border-base-300 overflow-x-auto">
            {smartReplies.map((reply, idx) => (
              <button
                key={idx}
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setInput(reply);
                  setSmartReplies([]);
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input Section */}
        <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100 items-center">
          <input type="file" onChange={handleFileChange} className="file-input file-input-bordered" />
          <input
            className="input input-bordered flex-1"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message"
          />
          <button
            className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start voice typing"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button className="btn btn-primary" onClick={sendMessage} title="Send message">
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* ✅ VideoCall now receives socket as prop (no more duplicate connection) */}
        {showVideoCall && (
          <VideoCall
            currentUser={currentUser}
            remoteUser={selectedUser}
            onClose={() => setShowVideoCall(false)}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;