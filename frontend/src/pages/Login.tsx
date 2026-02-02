import {NavLink, useNavigate} from "react-router-dom";
import {CheckSquare} from "lucide-react";
import {useState} from "react";
import Toast from "../components/ui/Toast";
import ForgotPasswordModal from "../components/ui/ForgotPasswordModal";
import Navbar from "../components/layout/Navbar";
import {API_URL} from "../config";

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if fields are empty
    if (form.email === "" || form.password === "") {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError("Invalid email or password");
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
      <section className="flex flex-col items-center justify-center gap-2 mt-2">
        <div className="gradient-bg w-12 h-12 rounded-xl mx-auto mt-14 mb-2 shadow-gray-100 shadow-2xl flex items-center justify-center">
          <CheckSquare className="w-7 h-7 text-white" />
        </div>
        <div className="text-center mb-2">
          <p className="font-semibold text-2xl mb-1">WorkSync</p>
          <p className="text-gray-500 text-sm font-light">
            Manage your task with ease
          </p>
        </div>
      </section>

      {/* Form */}
      <main className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 dark:shadow-gray-800 shadow-gray-300 shadow-lg rounded-xl">
        <form className="p-2" onSubmit={handleSubmit}>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm font-light text-gray-500">
            Enter your email and password to continue
          </p>
          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Email</label>
            <input
              onChange={handleChange}
              type="text"
              name="email"
              placeholder="admin@demo.com"
              className={`w-sm border p-3 font-md rounded-lg bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black ${
                error ? "border-red-500" : "border-gray-200"
              }`}
            />
          </div>

          <div className="flex flex-col text-sm my-4 gap-2">
            <label>Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="demo1234"
              className={`w-sm border p-3 font-md rounded-xl bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-800 dark:focus:bg-black ${
                error ? "border-red-500" : "border-gray-200"
              }`}
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 my-4 text-white text-sm p-3 w-full flex justify-center rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer">
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm text-indigo-600 hover:underline mb-2">
            Forgot Password?
          </button>
        </form>
        <div className="flex text-sm text-gray-500 dark:text-white">
          <p className="pr-2">Don't have an account?</p>
          <NavLink to="/register" className="text-indigo-600">
            Sign up
          </NavLink>
        </div>
        {error && (
          <Toast message={error} onClose={() => setError(null)} type="error" />
        )}
        <div className="bg-gray-100 w-sm border border-gray-200 text-xs p-2 text-gray-500 rounded-md my-4 dark:bg-[#1a1a1a] dark:border-gray-800 dark:text-gray-600">
          <p className="font-md my-1">Demo credentials:</p>
          <p className="font-light">Admin: admin@demo.com / demo1234</p>
          <p className="font-light">User: user@demo.com / demo1234</p>
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};
