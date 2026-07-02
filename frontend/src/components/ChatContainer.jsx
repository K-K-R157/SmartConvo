







// import { useEffect, useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import useAuthUser from "../hooks/useAuthUser";
// import { useSocket } from "../hooks/useSocket";
// import { useParams } from "react-router";
// import { axiosInstance } from "../lib/axios";
// import ChatHeader from "./ChatHeader";
// import VideoCall from "./VideoCall";
// import { Mic, MicOff, Send } from "lucide-react";

// const ChatContainer = () => {
//   const { id: selectedUserId } = useParams();
//   const { authUser: currentUser } = useAuthUser();
//   const socket = useSocket(currentUser?._id);

//   const {
//     messages,
//     isMessagesLoading,
//     setSelectedUser,
//     selectedUser,
//     getMessages,
//     addMessage,
//   } = useChatStore();

//   const [input, setInput] = useState("");
//   const [file, setFile] = useState(null);
//   const [showVideoCall, setShowVideoCall] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isFriendTyping, setIsFriendTyping] = useState(false);
//   const [smartReplies, setSmartReplies] = useState([]);
//   const [translationLanguage, setTranslationLanguage] = useState("english");
//   const [translations, setTranslations] = useState({});

//   const recognitionRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const handleFileChange = (e) => setFile(e.target.files[0]);

//   const uploadFile = async () => {
//     if (!file) return null;
//     const formData = new FormData();
//     formData.append("file", file);
//     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
//       method: "POST",
//       body: formData,
//     });
//     const data = await res.json();
//     setFile(null);
//     return data.url;
//   };

//   const sendMessage = async () => {
//     if ((input.trim() || file) && currentUser && selectedUser) {
//       let fileUrl = null;
//       if (file) fileUrl = await uploadFile();

//       socket.emit("sendMessage", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         text: input,
//         file: fileUrl,
//       });

//       setInput("");
//       setFile(null);
//       setSmartReplies([]);
//     }
//   };

//   const toggleListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Speech Recognition not supported.");
//       return;
//     }

//     if (!recognitionRef.current) {
//       const recognition = new SpeechRecognition();
//       recognition.lang = "en-US";
//       recognition.interimResults = false;
//       recognition.maxAlternatives = 1;

//       recognition.onresult = (e) => {
//         const transcript = e.results[0][0].transcript;
//         setInput((prev) => prev + " " + transcript);
//       };

//       recognition.onerror = () => setIsListening(false);
//       recognition.onend = () => {
//         if (isListening) recognition.start();
//       };

//       recognitionRef.current = recognition;
//     }

//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   const handleInputChange = (e) => {
//     setInput(e.target.value);
//     if (socket && currentUser && selectedUser) {
//       socket.emit("typing", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         isTyping: true,
//       });
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("typing", {
//           senderId: currentUser._id,
//           receiverId: selectedUser._id,
//           isTyping: false,
//         });
//       }, 1500);
//     }
//   };

//   useEffect(() => {
//     if (!selectedUserId) return;
//     axiosInstance.get(`/users/${selectedUserId}`).then((res) => {
//       setSelectedUser(res.data);
//     });
//   }, [selectedUserId, setSelectedUser]);

//   useEffect(() => {
//     if (currentUser && selectedUser) getMessages(currentUser._id);
//   }, [currentUser, selectedUser, getMessages]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleReceive = async (msg) => {
//       const isCurrentChat =
//         (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
//         (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id);

//       if (isCurrentChat) {
//         addMessage(msg);

//         // Only for friend's latest message with text
//         if (msg.senderId === selectedUser?._id && msg.text) {
//           // 1. Smart Reply Suggestions
//           try {
//             const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gemini/suggest-replies`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ message: msg.text }),
//             });
//             const data = await res.json();
//             setSmartReplies(data.suggestions || []);
//           } catch (err) {
//             console.error("Smart reply error:", err);
//           }

//           // 2. Translation (only if language is different)
//           if (translationLanguage !== "english") {
//             try {
//               const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/translate`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ text: msg.text, targetLang: translationLanguage }),
//               });
//               const data = await res.json();
//               setTranslations((prev) => ({
//                 ...prev,
//                 [msg._id]: data.translated || "",
//               }));
//             } catch (err) {
//               console.error("Translation error:", err);
//             }
//           }
//         }
//       }
//     };

//     const handleTyping = ({ senderId, isTyping }) => {
//       if (senderId === selectedUser?._id) setIsFriendTyping(isTyping);
//     };

//     socket.on("receiveMessage", handleReceive);
//     socket.on("typing", handleTyping);

//     return () => {
//       socket.off("receiveMessage", handleReceive);
//       socket.off("typing", handleTyping);
//     };
//   }, [socket, currentUser, selectedUser, translationLanguage, addMessage]);

//   const handleVideoCall = () => {
//     socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
//     setShowVideoCall(true);
//   };

//   useEffect(() => {
//     if (!socket) return;
//     const handleIncomingCall = ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setShowVideoCall(true);
//     };
//     socket.on("incoming-call", handleIncomingCall);
//     return () => socket.off("incoming-call", handleIncomingCall);
//   }, [socket, selectedUser]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (!currentUser || !selectedUser) return null;

//   return (
//     <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
//       <div className="relative flex flex-col h-full">
//         {/* Header */}
//         <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300">
//           <ChatHeader selectedUser={selectedUser} onVideoCall={handleVideoCall} />
//         </div>

//         {/* Language Selector */}
//         <div className="p-2 border-b border-base-300 bg-base-100">
//           <label className="text-sm mr-2">🌐 Translate to:</label>
//           <select
//             className="select select-bordered select-sm"
//             value={translationLanguage}
//             onChange={(e) => setTranslationLanguage(e.target.value)}
//           >
//             <option value="hindi">Hindi</option>
//             <option value="english">English</option>
//             <option value="spanish">Spanish</option>
//             <option value="bengali">Bengali</option>
//             <option value="french">French</option>
//           </select>
//         </div>

//         {/* Chat Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
//           {isMessagesLoading ? (
//             <div>⏳ Loading...</div>
//           ) : messages.length > 0 ? (
//             <>
//               {messages.map((message, idx) => (
//                 <div
//                   key={message._id || idx}
//                   className={`flex ${
//                     message.senderId === currentUser._id ? "justify-end" : "justify-start"
//                   }`}
//                   ref={idx === messages.length - 1 ? messagesEndRef : null}
//                 >
//                   <div
//                     className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
//                       message.senderId === currentUser._id
//                         ? "bg-green-200 text-black"
//                         : "bg-white text-black"
//                     }`}
//                   >
//                     {message.text && (
//                       <div>
//                         <span>{message.text}</span>
//                         {message.senderId === selectedUser._id &&
//                           translations[message._id] &&
//                           translationLanguage !== "english" && (
//                             <div className="text-xs text-blue-600 mt-1 italic">
//                               🌐 {translationLanguage.toUpperCase()}: {translations[message._id]}
//                             </div>
//                           )}
//                       </div>
//                     )}

//                     {message.file && (
//                       <a href={message.file} target="_blank" rel="noopener noreferrer">
//                         {message.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={message.file} alt="file" style={{ maxWidth: 200, marginTop: 8 }} />
//                         ) : (
//                           <span className="text-blue-500 underline block mt-2">
//                             📎 Download file
//                           </span>
//                         )}
//                       </a>
//                     )}
//                     <span className="block text-xs text-right mt-1">
//                       {new Date(message.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               {isFriendTyping && (
//                 <div className="text-sm text-gray-500 mt-2">
//                   {selectedUser.fullName} is typing...
//                 </div>
//               )}
//             </>
//           ) : (
//             <div>💬 No messages yet.</div>
//           )}
//         </div>

//         {/* Smart Replies */}
//         {smartReplies.length > 0 && (
//           <div className="p-2 flex gap-2 bg-base-100 border-t border-base-300 overflow-x-auto">
//             {smartReplies.map((reply, idx) => (
//               <button
//                 key={idx}
//                 className="btn btn-sm btn-outline"
//                 onClick={() => {
//                   setInput(reply);
//                   setSmartReplies([]);
//                 }}
//               >
//                 {reply}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Input Section */}
//         <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100 items-center">
//           <input type="file" onChange={handleFileChange} className="file-input file-input-bordered" />
//           <input
//             className="input input-bordered flex-1"
//             value={input}
//             onChange={handleInputChange}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             placeholder="Type a message"
//           />
//           <button
//             className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
//             onClick={toggleListening}
//             title={isListening ? "Stop listening" : "Start voice typing"}
//           >
//             {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//           </button>
//           <button className="btn btn-primary" onClick={sendMessage} title="Send message">
//             <Send className="w-4 h-4" />
//           </button>
//         </div>

//         {showVideoCall && (
//           <VideoCall
//             currentUser={currentUser}
//             remoteUser={selectedUser}
//             onClose={() => setShowVideoCall(false)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatContainer;











import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../hooks/useSocket";
import { useParams, useNavigate } from "react-router"; // <-- Added useNavigate
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import VideoCall from "./VideoCall";
import { Mic, MicOff, Send, Video, VideoIcon } from "lucide-react"; // <-- Added Video, VideoIcon

const ChatContainer = () => {
  const { id: selectedUserId } = useParams();
  const { authUser: currentUser } = useAuthUser();
  const socket = useSocket(currentUser?._id);
  const navigate = useNavigate(); // <-- For navigation to Stream call

  const {
    messages,
    isMessagesLoading,
    setSelectedUser,
    selectedUser,
    getMessages,
    addMessage,
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
  const typingTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (!selectedUserId) return;
    axiosInstance.get(`/users/${selectedUserId}`).then((res) => {
      setSelectedUser(res.data);
    });
  }, [selectedUserId, setSelectedUser]);

  useEffect(() => {
    if (currentUser && selectedUser) getMessages(currentUser._id);
  }, [currentUser, selectedUser, getMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = async (msg) => {
      const isCurrentChat =
        (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id);

      if (isCurrentChat) {
        addMessage(msg);

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

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
    };
  }, [socket, currentUser, selectedUser, translationLanguage, addMessage]);

  const handleVideoCall = () => {
    socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
    setShowVideoCall(true);
  };

  // Stream Video Call handler
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser || !selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300 flex items-center justify-between">
          <ChatHeader selectedUser={selectedUser} onVideoCall={handleVideoCall} />
          {/* --- Video Call Buttons --- */}
          <div className="flex gap-2 pr-4">
            {/* Existing WebRTC Video Call Button */}
            <button
              className="btn btn-secondary"
              onClick={handleVideoCall}
              title="Start WebRTC Video Call"
            >
              <VideoIcon className="w-5 h-5" />
            </button>
            {/* Stream Video Call Button (NEW) */}
            <button
              className="btn btn-accent"
              onClick={handleStreamVideoCall}
              title="Start Stream Video Call"
            >
              <Video className="w-5 h-5" />
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
          {isMessagesLoading ? (
            <div>⏳ Loading...</div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message, idx) => (
                <div
                  key={message._id || idx}
                  className={`flex ${
                    message.senderId === currentUser._id ? "justify-end" : "justify-start"
                  }`}
                  ref={idx === messages.length - 1 ? messagesEndRef : null}
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
                    <span className="block text-xs text-right mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isFriendTyping && (
                <div className="text-sm text-gray-500 mt-2">
                  {selectedUser.fullName} is typing...
                </div>
              )}
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

        {showVideoCall && (
          <VideoCall
            currentUser={currentUser}
            remoteUser={selectedUser}
            onClose={() => setShowVideoCall(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;