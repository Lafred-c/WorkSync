import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {CheckSquare} from "lucide-react";
import Toast from "../components/ui/Toast";
import {API_URL} from "../config";

export const ResetPassword = () => {
  const {token} = useParams<{token: string}>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link");
        setValidating(false);
        return;
      }

      // For now, we'll assume token is valid
      // In production, you might want to validate with backend first
      setTokenValid(true);
      setValidating(false);
    };

    validateToken();
  }, [token]);

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

    // Validation
    if (form.password === "" || form.passwordConfirm === "") {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users/reset-password/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Validating reset link...
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please try to login again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <section className="flex flex-col items-center justify-center gap-2">
        <div className="gradient-bg w-12 h-12 rounded-xl mx-auto mt-14 mb-2 shadow-gray-100 shadow-2xl flex items-center justify-center">
          <CheckSquare className="w-7 h-7 text-white" />
        </div>
        <div className="text-center mb-6">
          <p className="font-semibold text-2xl mb-1">Reset Password</p>
          <p className="text-gray-500 text-sm font-light">
            Enter your new password
          </p>
        </div>
      </section>

      {/* Form */}
      <main className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 shadow-gray-300 shadow-lg rounded-xl">
        <form className="p-2 w-80" onSubmit={handleSubmit}>
          <div className="flex flex-col text-sm my-4 gap-2">
            <label className="text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter new password"
              className={`w-full border p-3 font-md rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-800 ${
                error
                  ? "border-red-500"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            />
          </div>

          <div className="flex flex-col text-sm my-4 gap-2">
            <label className="text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="passwordConfirm"
              placeholder="Confirm new password"
              className={`w-full border p-3 font-md rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-800 ${
                error
                  ? "border-red-500"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 my-4 text-white text-sm p-3 w-full flex justify-center rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {error && (
          <Toast message={error} onClose={() => setError(null)} type="error" />
        )}
      </main>
    </div>
  );
};
