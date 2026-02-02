import {API_URL as BASE_URL} from "../config";

const API_URL = `${BASE_URL}/api/users`;

export const userService = {
  // Find user by email
  findUserByEmail: async (email: string) => {
    const res = await fetch(`${API_URL}?email=${email}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    const users = data.data.users;
    if (!users || users.length === 0) {
      throw new Error("User not found");
    }
    return users[0];
  },

  updateMe: async (data: {
    bio?: string;
    name?: string;
    email?: string;
    photo?: string;
  }) => {
    const res = await fetch(`${API_URL}/updateMe`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update profile");
    }

    const resData = await res.json();
    return resData.data.user;
  },

  updatePassword: async (
    passwordCurrent: string,
    password: string,
    passwordConfirm: string,
  ) => {
    const res = await fetch(`${API_URL}/updatePassword`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        passwordCurrent,
        password,
        passwordConfirm,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update password");
    }

    const resData = await res.json();
    return resData.data.user;
  },
};
