import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { BookOpen, Loader } from "lucide-react";

const LoginPage = () => {
  const dispatch = useDispatch();

  const { isLoggingIn, authUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // password regex (minimum 8 characters)
    const passwordRegex = /^.{8,}$/;

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    dispatch(login(data));
  };

  useEffect(() => {
    if (authUser) {
      switch (formData.role) {
        case "Student":
          navigate("/student");

          break;
        case "Teacher":
          navigate("/teacher");

          break;
        case "Admin":
          navigate("/admin");

          break;

        default:
          navigate("/login");
      }
    }
  }, [authUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Educational Project Management
          </h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            {/* Role Selection */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Select Role
              </label>

              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="
        w-full
        rounded-lg
        border
        border-gray-300
        bg-white
        px-4
        py-2.5
        text-gray-800
        outline-none
        transition
        duration-200
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-500/20
        appearance-none
        cursor-pointer
      "
                >
                  <option value="" disabled>
                    -- Select your role --
                  </option>
                  <option value="Student">🎓 Student</option>
                  <option value="Teacher">📚 Teacher</option>
                  <option value="Admin">🛡️ Admin</option>
                </select>

                {/* Custom dropdown icon */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Emial Address */}

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* forgot password link */}
            <div className="text-right">
              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />{" "}
                  signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
