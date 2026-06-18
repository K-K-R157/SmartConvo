// do not delete this commented just for render working after you can update again


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // Save user to localStorage
      if (data && data.user) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;



// now render modification
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { signup } from "../lib/api";

// const useSignUp = () => {
//   const queryClient = useQueryClient();

//   const { mutate, isPending, error } = useMutation({
//     mutationFn: signup,
//     onSuccess: (data) => {
//       // Save user and token to localStorage
//       if (data && data.user && data.token) {
//         localStorage.setItem("authUser", JSON.stringify(data.user));
//         localStorage.setItem("token", data.token); // ✅ store token
//       }
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });

//   return { isPending, error, signupMutation: mutate };
// };

// export default useSignUp;
