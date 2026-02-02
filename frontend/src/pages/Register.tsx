import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {CheckSquare} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import {API_URL} from "../config";

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <div className="fixed top-0 w-full mb-10">
        <Navbar showNotifications={false} />
      </div>
      <section className="flex flex-col items-center justify-center gap-2 mt-4">
        <div className="gradient-bg w-12 h-12 rounded-xl mx-auto mt-14 mb-2 shadow-gray-100 shadow-2xl flex items-center justify-center">
          <CheckSquare className="w-7 h-7 text-white" />
        </div>
        <div className="text-center mb-2">
          <p className="font-semibold text-2xl mb-1">Create your account</p>
        </div>
      </section>

      {/* Form */}
      <main className="flex flex-col items-center justify-center p-4 mb-10 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 dark:shadow-gray-800 shadow-gray-300 shadow-lg rounded-xl">
        <form className="p-2" onSubmit={handleSubmit}>
          <h1 className="text-xl font-semibold">Sign up</h1>
          <p className="text-sm font-light text-gray-500">
            Enter your details to create an account
          </p>
          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              placeholder="John Doe"
              className="w-sm border border-gray-200 p-3 font-md rounded-lg bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black"
            />
          </div>

          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Email</label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-sm border border-gray-200 p-3 font-md rounded-xl bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black"
            />
          </div>

          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="*******"
              className="w-sm border border-gray-200 p-3 font-md rounded-xl bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black"
            />
          </div>

          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              onChange={handleChange}
              placeholder="*******"
              className="w-sm border border-gray-200 p-3 font-md rounded-xl bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 my-4 text-white text-sm p-3 w-full flex justify-center rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer">
            Sign in
          </button>
        </form>
        <div className="flex text-sm text-gray-500 dark:text-white">
          <p className="pr-2 font-light">Already have an account?</p>
          <NavLink to="/login" className="text-indigo-600">
            Sign in
          </NavLink>
        </div>
      </main>
    </div>
  );
};
