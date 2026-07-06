import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);
// const socket = io("https://c7d3-2409-40e5-11e6-731b-1878-7d8-9556-91d9.ngrok-free.app");


const VideoCall = ({ currentUser, remoteUser, onClose }) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();
  const [callStarted, setCallStarted] = useState(false);

  const roomId =
    currentUser && remoteUser
      ? [currentUser._id, remoteUser._id].sort().join("_")
      : "default_room";

  useEffect(() => {
    let localStream;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localVideo.current.srcObject = stream;
      localStream = stream;
peerConnection.current = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});
      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = event => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      peerConnection.current.onicecandidate = event => {
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

      socket.emit("join-room", roomId);

      if (currentUser && currentUser._id < remoteUser._id) {
        peerConnection.current.onnegotiationneeded = async () => {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId });
        };
      }
    })

    return () => {
      if (localVideo.current && localVideo.current.srcObject) {
        localVideo.current.srcObject.getTracks().forEach(track => track.stop());
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
  }, [currentUser, remoteUser]);

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