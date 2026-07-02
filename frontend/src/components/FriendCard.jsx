
// import { useNavigate } from "react-router";
// import { LANGUAGE_TO_FLAG } from "../constants";
// import { useChatStore } from "../store/useChatStore";

// const FriendCard = ({ friend }) => {
//   const setSelectedUser = useChatStore((s) => s.setSelectedUser);
//   const navigate = useNavigate();

//   return (
//     <div className="card bg-base-200 hover:shadow-md transition-shadow">
//       <div className="card-body p-4">
//         {/* USER INFO */}
//         <div className="flex items-center gap-3 mb-3">
//           <div className="avatar size-12">
//             <img src={friend.profilePic} alt={friend.fullName} />
//           </div>
//           <h3 className="font-semibold truncate">{friend.fullName}</h3>
//         </div>

//         <div className="flex flex-wrap gap-1.5 mb-3">
//           <span className="badge badge-secondary text-xs">
//             {getLanguageFlag(friend.nativeLanguage)}
//             Native: {friend.nativeLanguage}
//           </span>
//           <span className="badge badge-outline text-xs">
//             {getLanguageFlag(friend.learningLanguage)}
//             Learning: {friend.learningLanguage}
//           </span>
//         </div>

//         <button
//           className="btn btn-outline w-full"
//           onClick={() => {
//             setSelectedUser(friend);
//             navigate(`/chat/${friend._id}`);
//           }}
//         >
//           Message
//         </button>
//       </div>
//     </div>
//   );
// };
// export default FriendCard;

// export function getLanguageFlag(language) {
//   if (!language) return null;

//   const langLower = language.toLowerCase();
//   const countryCode = LANGUAGE_TO_FLAG[langLower];

//   if (countryCode) {
//     return (
//       <img
//         src={`https://flagcdn.com/24x18/${countryCode}.png`}
//         alt={`${langLower} flag`}
//         className="h-3 mr-1 inline-block"
//       />
//     );
//   }
//   return null;
// }



import { useNavigate } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useChatStore } from "../store/useChatStore";

const FriendCard = ({ friend, isOnline }) => { // <-- ADDED isOnline prop
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12 relative">
            <img src={friend.profilePic} alt={friend.fullName} />
            {/* --- ADDED: Online indicator --- */}
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                title="Online"
              />
            )}
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <button
          className="btn btn-outline w-full"
          onClick={() => {
            setSelectedUser(friend);
            navigate(`/chat/${friend._id}`);
          }}
        >
          Message
        </button>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}