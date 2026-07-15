import { useRef, useEffect, useState } from "react";

// ✅ VideoCall now receives socket as a prop (uses the shared app socket)
// ✅ Room-based signaling (no more broadcast to all users)
// ✅ Includes TURN servers for cross-network calls
const VideoCall = ({ currentUser, remoteUser, onClose, socket }) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();
  const [callStarted, setCallStarted] = useState(false);

  const roomId =
    currentUser && remoteUser
      ? [currentUser._id, remoteUser._id].sort().join("_")
      : "default_room";

  useEffect(() => {
    if (!socket) return;

    let localStream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.current.srcObject = stream;
        localStream = stream;

        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            // ✅ Free TURN servers from metered.ca (relay for cross-network calls)
            {
              urls: "turn:a.relay.metered.ca:80",
              username: "open",
              credential: "open",
            },
            {
              urls: "turn:a.relay.metered.ca:443",
              username: "open",
              credential: "open",
            },
            {
              urls: "turn:a.relay.metered.ca:443?transport=tcp",
              username: "open",
              credential: "open",
            },
          ],
        });

        stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

        peerConnection.current.ontrack = (event) => {
          remoteVideo.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { candidate: event.candidate, roomId });
          }
        };

        const handleIce = ({ candidate, roomId: incomingRoom }) => {
          if (incomingRoom === roomId && candidate) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        };

        const handleOffer = async ({ offer, roomId: incomingRoom }) => {
          if (incomingRoom === roomId) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit("answer", { answer, roomId });
            setCallStarted(true);
          }
        };

        const handleAnswer = async ({ answer, roomId: incomingRoom }) => {
          if (incomingRoom === roomId) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            setCallStarted(true);
          }
        };

        socket.on("ice-candidate", handleIce);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);

        // ✅ Join the room on the server for scoped signaling
        socket.emit("join-room", roomId);

        // The user with the smaller ID creates the offer (deterministic)
        if (currentUser && currentUser._id < remoteUser._id) {
          peerConnection.current.onnegotiationneeded = async () => {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit("offer", { offer, roomId });
          };
        }
      });

    return () => {
      if (localVideo.current && localVideo.current.srcObject) {
        localVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      socket.emit("leave-room", roomId);
      socket.off("ice-candidate");
      socket.off("offer");
      socket.off("answer");
    };
    // eslint-disable-next-line
  }, [currentUser, remoteUser, socket]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2">
          Video Call with {remoteUser?.fullName || "User"}
        </h2>
        <div className="flex gap-4">
          <video
            ref={localVideo}
            autoPlay
            muted
            className="w-48 h-36 bg-black rounded"
            style={{ border: "2px solid #34B7F1" }}
          />
          <video
            ref={remoteVideo}
            autoPlay
            className="w-64 h-48 bg-black rounded"
            style={{ border: "2px solid #34B7F1" }}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-error" onClick={onClose}>
            End Call
          </button>
        </div>
        {!callStarted && (
          <div className="mt-2 text-sm text-gray-500">Connecting...</div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;