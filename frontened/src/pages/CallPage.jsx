// import React from 'react'

// export const CallPage = () => {
//   return (
//     <div>CallPage</div>
//   )
// }


// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import { useQuery } from "@tanstack/react-query";
// import { getStreamToken } from "../lib/api";

// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallControls,
//   SpeakerLayout,
//   StreamTheme,
//   CallingState,
//   useCallStateHooks,
// } from "@stream-io/video-react-sdk";

// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import toast from "react-hot-toast";
// import PageLoader from "../components/PageLoader";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const CallPage = () => {
//   const { id: callId } = useParams();
//   const [client, setClient] = useState(null);
//   const [call, setCall] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(true);

//   const { authUser, isLoading } = useAuthUser();

//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!authUser,
//   });

//   useEffect(() => {
//     const initCall = async () => {
//       if (!tokenData.token || !authUser || !callId) return;

//       try {
//         console.log("Initializing Stream video client...");

//         const user = {
//           id: authUser._id,
//           name: authUser.fullName,
//           image: authUser.profilePic,
//         };

//         const videoClient = new StreamVideoClient({
//           apiKey: STREAM_API_KEY,
//           user,
//           token: tokenData.token,
//         });

//         const callInstance = videoClient.call("default", callId);

//         await callInstance.join({ create: true });

//         console.log("Joined call successfully");

//         setClient(videoClient);
//         setCall(callInstance);
//       } catch (error) {
//         console.error("Error joining call:", error);
//         toast.error("Could not join the call. Please try again.");
//       } finally {
//         setIsConnecting(false);
//       }
//     };

//     initCall();
//   }, [tokenData, authUser, callId]);

//   if (isLoading || isConnecting) return <PageLoader />;

//   return (
//     <div className="h-screen flex flex-col items-center justify-center">
//       <div className="relative">
//         {client && call ? (
//           <StreamVideo client={client}>
//             <StreamCall call={call}>
//               <CallContent />
//             </StreamCall>
//           </StreamVideo>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p>Could not initialize call. Please refresh or try again later.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const CallContent = () => {
//   const { useCallCallingState } = useCallStateHooks();
//   const callingState = useCallCallingState();

//   const navigate = useNavigate();

//   if (callingState === CallingState.LEFT) return navigate("/");

//   return (
//     <StreamTheme>
//       <SpeakerLayout />
//       <CallControls />
//     </StreamTheme>
//   );
// };

// export default CallPage;









// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import { useQuery } from "@tanstack/react-query";
// import { getStreamToken } from "../lib/api";

// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallControls,
//   SpeakerLayout,
//   StreamTheme,
//   CallingState,
//   useCallStateHooks,
// } from "@stream-io/video-react-sdk";

// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import toast from "react-hot-toast";
// import PageLoader from "../components/PageLoader";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const CallPage = () => {
//   const { id: callId } = useParams();
//   const [client, setClient] = useState(null);
//   const [call, setCall] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(true);

//   const { authUser, isLoading } = useAuthUser();

//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!authUser,
//   });

//   useEffect(() => {
//       console.log("Stream tokenData:", tokenData); // <-- Add this line

//     const initCall = async () => {
//       if (!tokenData?.token || !authUser || !callId) return;

//       try {
//         const user = {
//           id: authUser._id,
//           name: authUser.fullName,
//           image: authUser.profilePic,
//         };

//         const videoClient = new StreamVideoClient({
//           apiKey: STREAM_API_KEY,
//           user,
//           token: tokenData.token,
//         });

//         const callInstance = videoClient.call("default", callId);

//         await callInstance.join({ create: true });

//         setClient(videoClient);
//         setCall(callInstance);
//       } catch (error) {
//         console.error("Error joining call:", error);
//         toast.error("Could not join the call. Please try again.");
//       } finally {
//         setIsConnecting(false);
//       }
//     };

//     initCall();
//   }, [tokenData, authUser, callId]);

//   if (isLoading || isConnecting) return <PageLoader />;

//   return (
//     <div className="h-screen flex flex-col items-center justify-center">
//       <div className="relative">
//         {client && call ? (
//           <StreamVideo client={client}>
//             <StreamCall call={call}>
//               <CallContent />
//             </StreamCall>
//           </StreamVideo>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p>Could not initialize call. Please refresh or try again later.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const CallContent = () => {
//   const { useCallCallingState } = useCallStateHooks();
//   const callingState = useCallCallingState();

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (callingState === CallingState.LEFT) {
//       navigate("/");
//     }
//   }, [callingState, navigate]);

//   return (
//     <StreamTheme>
//       <SpeakerLayout />
//       <CallControls />
//     </StreamTheme>
//   );
// };

// export default CallPage;





import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData, isFetching, error: queryError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  if (!authUser) {
  return <div className="flex items-center justify-center h-screen text-red-500">
    Please log in to join the call.
  </div>;
}

  // Show loader while fetching or connecting
  if (isLoading || isFetching || isConnecting) return <PageLoader />;

  // Show error if token fetch failed or token is missing
  if (queryError || tokenData?.error || !tokenData?.token) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div>
          <p>
            {tokenData?.error
              ? `Stream error: ${tokenData.error}`
              : queryError
              ? "Failed to fetch Stream token."
              : "Could not get Stream token."}
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
    // Only run when tokenData, authUser, or callId changes
    // eslint-disable-next-line
  }, [tokenData, authUser, callId]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;