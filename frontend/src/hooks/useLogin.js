
// do not delete this this is working fine commented for render deployment work propler so 

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Save user to localStorage
      if (data && data.user) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { isPending, error, loginMutation: mutate };
};
export default useLogin;



// now rendering part
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { login } from "../lib/api";

// const useLogin = () => {
//   const queryClient = useQueryClient();

//   const { mutate, isPending, error } = useMutation({
//     mutationFn: login,
//    onSuccess: (data) => {
//   if (data && data.user && data.token) {
//     localStorage.setItem("authUser", JSON.stringify(data.user));
//     localStorage.setItem("token", data.token); // ✅ save token
//   }
//   queryClient.invalidateQueries({ queryKey: ["authUser"] });
// },

//   });

//   return { isPending, error, loginMutation: mutate };
// };
// export default useLogin;





// 🎯 What is This File Doing?
// This file creates a helper function called useLogin.

// 🧠 Its job is:

// To log a user into the app, and after that, refresh the user data so the app knows who is now logged in.

// It uses a magic tool called React Query to do this easily.

