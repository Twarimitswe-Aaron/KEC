import React, { ChangeEvent, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import clsx from "clsx";


import { useSignupMutation } from "../../state/api/authApi";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {

  const [signup] = useSignupMutation();
  const formRef = useRef<HTMLFormElement>(null);

  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }

  const handleGoogleLogin = () => {
    // Add subtle loading animation to Google button
    const googleButton = document.querySelector('.google-login-btn');
    if (googleButton) {
      googleButton.classList.add('animate-pulse');
      setTimeout(() => {
        googleButton.classList.remove('animate-pulse');
      }, 1000);
    }
    
    console.log("Google login clicked");
    toast.info("Google login integration pending...");
  };

  // ------------------------- States -------------------------
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormAnimating, setIsFormAnimating] = useState(false);

  // ------------------------- Validation -------------------------
  const validate = (
    name: string,
    value: string | boolean,
    showToast: boolean = false
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};

    // Email validation
    if (name === "email") {
      errors.email = [];
      if (!value) errors.email.push("Email is required.");
      else if (!/\S+@\S+\.\S+/.test(value as string))
        errors.email.push("Please enter a valid email address.");
    }

    // Password validation
    if (name === "password") {
      errors.password = [];
      if (!value) errors.password.push("Password is required.");
      else {
        const val = value as string;
        if (!/[A-Z]/.test(val))
          errors.password.push("Include at least one uppercase letter.");
        if (!/[0-9]/.test(val))
          errors.password.push("Include at least one number.");
        if (!/[!@#$%^&*(),.?\":{}|<>]/.test(val))
          errors.password.push("Include one special character.");
        if (val.length < 6) errors.password.push("Minimum 6 characters.");
      }
    }

    // Confirm password
    if (name === "confirmPassword") {
      errors.confirmPassword = [];
      if (!value) errors.confirmPassword.push("Please confirm your password.");
      else if (value !== formData.password) {
        errors.confirmPassword.push("Password does not match.");
        if (showToast) toast.error("Passwords do not match");
      }
    }

    // First and last name
    if (name === "firstName") {
      errors.firstName = [];
      if (!value) errors.firstName.push("First name is required.");
    }
    if (name === "lastName") {
      errors.lastName = [];
      if (!value) errors.lastName.push("Last name is required.");
    }

    return errors;
  };

  // ------------------------- Handlers -------------------------
  const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: true }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    const errors = validate(name, fieldValue, false);
    setFormErrors((prev) => ({ ...prev, [name]: errors[name] || [] }));
  };

  const getBorderColor = (field: string) => {
    if (!touched[field] || isFocused[field]) return "border-[#022F40]";
    return formErrors[field]?.length
      ? "border-red-500 placeholder-red-500"
      : "border-green-500 placeholder-green-500";
  };

  // Add shake animation for form errors
  const shakeForm = () => {
    if (formRef.current) {
      formRef.current.classList.add('animate-shake');
      setTimeout(() => {
        formRef.current?.classList.remove('animate-shake');
      }, 600);
    }
  };

  // Success animation
  const animateSuccess = () => {
    setIsFormAnimating(true);
    if (formRef.current) {
      formRef.current.style.transform = 'scale(0.95)';
      formRef.current.style.opacity = '0.8';
      
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.transform = 'scale(1)';
          formRef.current.style.opacity = '1';
        }
        setIsFormAnimating(false);
      }, 300);
    }
  };

  // ------------------------- Submit -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const fields = [
      "email",
      "password",
      "confirmPassword",
      "firstName",
      "lastName",
    ];
    let allErrors: { [key: string]: string[] } = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const errors = validate(field, formData[field as keyof FormData], true);
      allErrors = { ...allErrors, ...errors };
      if (errors[field]?.length) hasErrors = true;
    });

    if (hasErrors) {
      setFormErrors(allErrors);
      setIsLoading(false);
      shakeForm();
      return;
    }

    try {
      const res = await signup({ ...formData,
        //  csrfToken 
        }).unwrap();

      // Success animation
      animateSuccess();
      
      // Reset form with staggered animation
      setTimeout(() => {
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });
        setFormErrors({});
        setTouched({});
        setIsFocused({});
      }, 200);

      toast.success(res.message);
    } catch (error: any) {
      shakeForm();
      if (error.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Something went wrong. Please try again later");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- JSX -------------------------
  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-top h-full flex justify-center relative">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="justify-center px-5 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center transition-all duration-300 ease-in-out animate-slideInUp"
          style={{
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
          }}
        >
          {/* Logo */}
          <Link 
            to="/" 
            className="flex justify-center items-center relative group"
          >
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="absolute w-25 object-cover top-4 transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20 animate-fadeInUp">
            Sign Up
          </h1>

          {/* Name Fields */}
          <div className="flex gap-5 animate-slideInLeft animation-delay-200">
            {["firstName", "lastName"].map((field, i) => (
              <div
                key={field}
                className={`w-[42%] mt-5 flex items-center bg-white border rounded-md p-2 transition-all duration-300 transform hover:shadow-lg hover:scale-[1.02] ${getBorderColor(
                  field
                )} ${i === 0 ? "ml-auto" : "mr-auto"}`}
              >
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof FormData]}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={
                    field === "firstName" ? "First name" : "Last name"
                  }
                  className="w-full bg-transparent outline-none text-md transition-all duration-200"
                />
              </div>
            ))}
          </div>

          {/* Name Errors */}
          <div className="flex w-[90%] mx-auto justify-start text-start">
            {["firstName", "lastName"].map((field) =>
              formErrors[field]?.length ? (
                <ul
                  key={field}
                  className="text-left mt-4 text-sm text-red-600 w-[50%] space-y-1 animate-slideInDown"
                >
                  {formErrors[field].map((err, idx) => (
                    <li 
                      key={idx}
                      className="animate-fadeIn"
                      style={{animationDelay: `${idx * 100}ms`}}
                    >
                      {err}
                    </li>
                  ))}
                </ul>
              ) : (
                <div key={field} className="w-[50%]" />
              )
            )}
          </div>

          {/* Email */}
          <div
            className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md p-2 transition-all duration-300 transform hover:shadow-lg hover:scale-[1.02] animate-slideInRight animation-delay-300 ${getBorderColor(
              "email"
            )}`}
          >
            <MdEmail className="text-[#022F40] w-5 h-5 mr-2 transition-colors duration-200" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Email"
              className="w-full bg-transparent outline-none text-md transition-all duration-200"
            />
          </div>
          {formErrors.email?.length > 0 && (
            <ul className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5 animate-slideInDown">
              {formErrors.email.map((err, i) => (
                <li 
                  key={i}
                  className="animate-fadeIn"
                  style={{animationDelay: `${i * 100}ms`}}
                >
                  {err}
                </li>
              ))}
            </ul>
          )}

          {/* Password & Confirm Password */}
          {["password", "confirmPassword"].map((field, index) => (
            <div
              key={field}
              className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md relative p-2 transition-all duration-300 transform hover:shadow-lg hover:scale-[1.02] animate-slideInLeft ${getBorderColor(
                field
              )}`}
              style={{animationDelay: `${(index + 4) * 100}ms`}}
            >
              <IoIosLock className="text-[#022F40] w-5 h-5 mr-2 transition-colors duration-200" />
              <input
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : showConfirmPassword
                    ? "text"
                    : "password"
                }
                name={field}
                value={formData[field as keyof FormData]}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={
                  field === "password" ? "Password" : "Confirm password"
                }
                className="w-full bg-transparent outline-none text-md transition-all duration-200"
              />
              <button
                type="button"
                onClick={() =>
                  field === "password"
                    ? setShowPassword((prev) => !prev)
                    : setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 transition-all duration-200 transform hover:scale-110 active:scale-95 text-[#022F40] hover:text-slate-500"
              >
                {field === "password" ? (
                  showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )
                ) : showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
          ))}

          {/* Password Errors */}
          {["password", "confirmPassword"].map(
            (field) =>
              formErrors[field]?.length > 0 && (
                <ul
                  key={field}
                  className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5 animate-slideInDown"
                >
                  {formErrors[field].map((err, i) => (
                    <li 
                      key={i}
                      className="animate-fadeIn"
                      style={{animationDelay: `${i * 100}ms`}}
                    >
                      {err}
                    </li>
                  ))}
                </ul>
              )
          )}

          {/* Already have account */}
          <div className="flex gap-2 justify-center mt-3 animate-fadeInUp animation-delay-600">
            <p className="text-gray-600">Already have an account?</p>
            <Link
              to="/login"
              className="text-[#022F40] hover:underline transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          </div>

          {/* Submit */}
          <div className="w-[90%] mx-auto mt-4 animate-slideInUp animation-delay-700">
            <button
              type="submit"
              disabled={isLoading || isFormAnimating}
              className={clsx(
                "w-[100%] cursor-pointer flex justify-center items-center gap-2 p-2 rounded-md shadow transition-all duration-300 border transform hover:scale-105 active:scale-95",
                {
                  "text-white bg-[#022F40] border-white hover:bg-white hover:text-[#022F40] hover:shadow-lg":
                    !isLoading && !isFormAnimating,
                  "bg-white text-[#022F40] border-[#022F40] cursor-not-allowed opacity-50":
                    isLoading || isFormAnimating,
                }
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

      {/* Divider */}
      <div className="flex items-center w-[90%] mx-auto mt-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Continue with Google Section */}
          <div className="w-[90%] mx-auto mb-6 space-y-3">
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
        </form>
      </div>

      {/* Illustration */}
      <div className="hidden lg:flex sticky top-0 right-0 bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-8px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(8px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-slideInDown {
          animation: slideInDown 0.4s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-expandWidth {
          animation: expandWidth 0.8s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-900 {
          animation-delay: 0.9s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Signup;