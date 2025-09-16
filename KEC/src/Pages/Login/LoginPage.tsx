import React, { useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import clsx from "clsx";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { useCsrfToken } from "../../hooks/useCsrfToken";
import { useLoginMutation } from "../../state/api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const { getToken } = useCsrfToken();
  const [login] = useLoginMutation();

  interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stepPassword, setStepPassword] = useState(false);

  // Validation function
  const validate = (
    name: string,
    value: string | boolean
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};
    if (name === "email") {
      errors.email = [];
      if (!value) errors.email.push("Email is required.");
      else if (!/\S+@\S+\.\S+/.test(value as string))
        errors.email.push("Please enter a valid email address.");
    }
    if (name === "password") {
      errors.password = [];
      if (!value) errors.password.push("Password is required.");
    }
    return errors;
  };

  // Handlers for focus, blur, change
  const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    // Validate only if user has started typing (value is not empty)
    if (fieldValue !== "" || formData[name as keyof FormData] !== "") {
      const errors = validate(name, fieldValue);
      setFormErrors((prev) => ({ ...prev, [name]: errors[name] || [] }));
    }
  };

  // Button to continue after email
  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const emailErrors = validate("email", formData.email);
    if (emailErrors.email?.length) {
      setFormErrors({ email: emailErrors.email });
    } else {
      setFormErrors({});
      setStepPassword(true);
    }
  };

  // Handle going back to email step
  const handleBack = () => {
    setStepPassword(false);
    setFormErrors({});
  };

  // Google login handler
  const handleGoogleLogin = () => {
    // Your Google OAuth integration logic here
    console.log("Google login clicked");
    toast.info("Google login integration pending...");
  };

  // Submit password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const passErrors = validate("password", formData.password);
    if (passErrors.password?.length) {
      setFormErrors({ password: passErrors.password });
      setIsLoading(false);
      return;
    }

    // Fetch CSRF token
    const csrfToken = await getToken();
    if (!csrfToken) {
      toast.error("CSRF token not found. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      
      }).unwrap();
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getBorderColor = (field: string) => {
    if (isFocused[field]) return "border-[#022F40]";
    if (formData[field as keyof FormData] === "") return "border-[#022F40]";
    return formErrors[field]?.length ? "border-red-500" : "border-green-500";
  };

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="justify-center px-5 pb-8 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center"
        >
          <Link to="/" className="flex justify-center items-center relative">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="absolute w-25 object-cover top-4"
            />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20">
            Login
          </h1>

          <div className="transition-all duration-500 ease-in-out">
            {!stepPassword ? (
              <div className="animate-fadeIn">
                <div
                  className={`w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 transition-colors duration-200 ${getBorderColor(
                    "email"
                  )}`}
                >
                  <HiOutlineMail className="text-[#022F40] w-5 h-5 mr-2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className="w-full bg-transparent outline-none text-md"
                  />
                </div>
                {formErrors.email?.length > 0 && (
                  <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1 animate-slideDown">
                    {formErrors.email.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Forgot Password Link for Email Step */}
                <div className="w-[90%] justify-between flex mx-auto mt-3 ">
                  <Link
                    to="/forgotPass"
                    className="text-center text-sm text-[#022F40] hover:text-[#034a5c] hover:underline transition-all duration-200"
                  >
                    Forgot Password?
                  </Link>
                  <Link
                    to="/passReset"
                    className="text-sm text-[#022F40] hover:text-[#034a5c] hover:underline transition-all duration-200"
                  >
                    Reset Password
                  </Link>
                </div>

                <div className="w-[90%] mx-auto mt-4">
                  <button
                    onClick={handleContinue}
                    className="w-full p-2 cursor-pointer text-white bg-[#022F40] rounded-md shadow hover:bg-white hover:text-[#022F40] transition-all duration-300 border border-[#022F40] hover:border-[#022F40]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div
                  className={`relative w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 transition-colors duration-200 ${getBorderColor(
                    "password"
                  )}`}
                >
                  <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    className="w-full bg-transparent outline-none border-none text-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-[#022F40] focus:outline-none hover:text-[#034a5c] transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password?.length > 0 && (
                  <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1 animate-slideDown">
                    {formErrors.password.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Forgot Password Link for Password Step */}
                <div className="w-[90%] mx-auto mt-3 text-right">
                  <Link
                    to="/forgotPass"
                    className="text-sm text-[#022F40] hover:text-[#034a5c] hover:underline transition-all duration-200"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="flex w-full h-[40px] gap-3 mt-4 justify-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-[45%] p-2 border cursor-pointer rounded-md border-[#022F40] text-[#022F40] hover:bg-[#022F40] hover:text-white transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={clsx(
                      "w-[45%] cursor-pointer flex justify-center items-center gap-2 p-2 rounded-md shadow transition-all duration-300 border",
                      {
                        "text-white bg-[#022F40] border-[#022F40] hover:bg-white hover:text-[#022F40] hover:border-[#022F40]":
                          !isLoading,
                        "bg-gray-400 text-white border-gray-400 cursor-not-allowed":
                          isLoading,
                      }
                    )}
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center w-[90%] mx-auto mt-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Continue with Google Section */}
          <div className="w-[90%] mx-auto space-y-3">
            <p className="text-sm text-gray-600">Quick sign in with</p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 p-2.5 cursor-pointer text-[#022F40] bg-white border border-[#022F40] rounded-md shadow hover:bg-[#022F40] hover:text-white transition-all duration-300 group"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Additional Options */}
          <div className="w-[90%] mx-auto mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2.5 text-sm">
              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/Signup"
                  className="text-[#022F40] hover:text-[#034a5c] hover:underline transition-all duration-200 font-medium"
                >
                  Create Account
                </Link>
              </div>

              <Link
                to="/help"
                className="text-center text-gray-500 hover:text-[#022F40] hover:underline transition-all duration-200"
              >
                Need Help?
              </Link>
            </div>
          </div>
        </form>
      </div>
      <div className="hidden lg:flex bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-[100%] object-cover h-[100%]"
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
