import React, { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { IoIosLock } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyResetMutation,
} from "../../state/api/authApi";

const ForgotPass = () => {
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const [requestReset] = useRequestPasswordResetMutation();
  const [verifyCode] = useVerifyResetMutation();
  const [resetPassword] = useResetPasswordMutation();

  // Refs for code inputs
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    code: ["", "", "", "", "", ""],
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  // Smooth step transition with animation
  const transitionToStep = (newStep: "email" | "code" | "reset") => {
    setIsTransitioning(true);
    
    // Add exit animation
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.transform = "translateX(-20px)";
    }

    setTimeout(() => {
      setStep(newStep);
      
      // Add entrance animation
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
        containerRef.current.style.transform = "translateX(0)";
      }
      
      setIsTransitioning(false);
      
      // Focus management for better UX
      setTimeout(() => {
        if (newStep === "code" && codeRefs.current[0]) {
          codeRefs.current[0].focus();
        }
      }, 100);
    }, 300);
  };

  const handleForgotPassword = async (email: string) => {
    // const csrfToken = await getToken();
    const message = await requestReset({
      email,
      // csrfToken: csrfToken!,
    }).unwrap();
    if (!message) {
      return;
    }
    return message;
  };

  const handleVerify = async (email: string, code: string) => {
    // const csrfToken = await getToken();
    const res = await verifyCode({ email, code,
      //  csrfToken: csrfToken! 
      });
    return res.data?.email;
  };

  const handleResetPassword = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    // const csrfToken = await getToken();
    const message = await resetPassword({
      email,
      password: password,
      confirmPassword,
      // csrfToken: csrfToken!,
    });
    return message?.data?.message;
  };

  const validate = (
    name: string,
    value: string | string[],
    showToast: boolean = false
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};

    if (name === "email") {
      errors.email = [];
      if (!value) {
        errors.email.push("Email is required");
        if (showToast) toast.error("Email is required");
      } else if (!/\S+@\S+\.\S+/.test(value as string)) {
        errors.email.push("Please enter a valid email address");
        if (showToast) toast.error("Please enter a valid email address");
      }
    }

    if (name === "code") {
      errors.code = [];
      const codeArray = value as string[];
      const codeString = codeArray.join("");
      if (codeString.length !== 6) {
        errors.code.push("Please enter the complete 6-digit code");
        if (showToast) toast.error("Please enter the complete 6-digit code");
      } else if (!/^\d{6}$/.test(codeString)) {
        errors.code.push("Code must contain only numbers");
        if (showToast) toast.error("Code must contain only numbers");
      }
    }

    if (name === "password") {
      errors.password = [];
      if (!value) {
        errors.password.push("Password is required");
        if (showToast) toast.error("Password is required");
      } else {
        if (!/[A-Z]/.test(value as string)) {
          errors.password.push("Include at least one uppercase letter");
          if (showToast)
            toast.error("Password must include at least one uppercase letter");
        }
        if (!/[0-9]/.test(value as string)) {
          errors.password.push("Include at least one number");
          if (showToast)
            toast.error("Password must include at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value as string)) {
          errors.password.push("Include one special character");
          if (showToast)
            toast.error("Password must include one special character");
        }
        if ((value as string).length < 6) {
          errors.password.push("Minimum 6 characters");
          if (showToast) toast.error("Password must be at least 6 characters");
        }
      }
    }

    if (name === "confirmPassword") {
      errors.confirmPassword = [];
      if (!value) {
        errors.confirmPassword.push("Please confirm your password");
        if (showToast) toast.error("Please confirm your password");
      } else if (value !== formData.password) {
        errors.confirmPassword.push("Passwords do not match");
        if (showToast) toast.error("Passwords do not match");
      }
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const errors = validate(name, value, false);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name] || [],
    }));
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...formData.code];
    newCode[index] = value;

    setFormData((prev) => ({
      ...prev,
      code: newCode,
    }));

    const errors = validate("code", newCode, false);
    setFormErrors((prev) => ({
      ...prev,
      code: errors.code || [],
    }));

    // Auto-focus next input with smooth transition
    if (value && index < 5) {
      setTimeout(() => {
        codeRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      setTimeout(() => {
        codeRefs.current[index - 1]?.focus();
      }, 50);
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setFormData((prev) => ({
        ...prev,
        code: newCode,
      }));

      const errors = validate("code", newCode, false);
      setFormErrors((prev) => ({
        ...prev,
        code: errors.code || [],
      }));

      setTimeout(() => {
        codeRefs.current[5]?.focus();
      }, 100);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: true }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));
  };

  const getBorderColor = (field: string): string => {
    if (!touched[field] || isFocused[field]) {
      return "border-[#022F40]";
    }
    return formErrors[field]?.length
      ? "border-red-500 placeholder-red-500"
      : "border-green-500 placeholder-green-500";
  };

  const normalizeCode = (codeInput: string[] | string): string => {
    if (Array.isArray(codeInput)) {
      return codeInput.join("");
    }
    return codeInput;
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    // Add subtle loading animation
    const button = document.querySelector('.resend-button');
    if (button) {
      button.classList.add('animate-pulse');
    }

    try {
      const response = await handleForgotPassword(formData.email);
      setFormErrors((prev) => ({ ...prev, code: [] }));
      if (response?.message) {
        toast.success(`New code is resent to ${formData.email}`);
        transitionToStep("code");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  
    

    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === "email") {
      try {
        const response = await handleForgotPassword(formData.email);
        console.log(response);
        if (response?.message) {
          toast.success(response.message);
          transitionToStep("code");
        }
      } catch (err: any) {
        toast.error(err?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    } else if (step === "code") {
      const codeErrors = validate("code", formData.code, true);
      if (codeErrors.code?.length) {
        setIsLoading(false);
        return;
      }
      const code = normalizeCode(formData.code);

      try {
        const email = await handleVerify(formData.email, code);
        if (email === formData.email) {
          toast.success("Code verified successfully");
          transitionToStep("reset");
        }
      } catch (error: any) {
        toast.error(error?.data?.message);
      }
    } else {
      const passErrors = validate("password", formData.password, true);
      const confirmPassErrors = validate(
        "confirmPassword",
        formData.confirmPassword,
        true
      );

      if (
        passErrors.password?.length ||
        confirmPassErrors.confirmPassword?.length
      ) {
        setIsLoading(false);
        return;
      }

      try {
        const message = await handleResetPassword(
          formData.email,
          formData.password,
          formData.confirmPassword
        );
        if (message) {
          toast.success("Password reset successful");
          navigate("/login");
        }
      } catch (error: any) {
        toast.error(error.data?.message);
      }
    }
    setIsLoading(false);
  };



  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Reset Password";
      case "code":
        return "Enter Verification Code";
      case "reset":
        return "Create New Password";
      default:
        return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "email":
        return "Enter your email address to receive a reset code";
      case "code":
        return `We've sent a 6-digit code to ${formData.email}`;
      case "reset":
        return "Create your new password";
      default:
        return "";
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case "email":
        return 1;
      case "code":
        return 2;
      case "reset":
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <div 
          ref={containerRef}
          className="justify-center px-5 py-8 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center transition-all duration-300 ease-in-out transform"
          style={{
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
          }}
        >
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      num <= getStepNumber()
                        ? "bg-[#022F40] text-white transform scale-110"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-8 h-0.5 transition-colors duration-500 ${
                        num < getStepNumber() ? "bg-[#022F40]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center cursor-pointer items-center relative mb-8 transform hover:scale-105 transition-transform duration-200">
            <img src="/images/Logo.svg" onClick={() => navigate("/")} alt="" />
          </div>

          <div className="overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mb-2 animate-fadeInUp">
              {getStepTitle()}
            </h1>

            <p className="text-sm text-gray-600 mb-8 animate-fadeInUp animation-delay-100">
              {getStepDescription()}
            </p>
          </div>

          {step === "email" ? (
            <div className="animate-slideInLeft">
              <div
                className={`w-[90%]  flex items-center bg-white border mx-auto rounded-md p-2 transition-all duration-300 transform hover:shadow-lg ${getBorderColor(
                  "email"
                )}`}
              >
                <svg
                  className="w-5 h-5 mr-3 text-[#022F40] transition-colors duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none text-[#022F40] transition-all duration-200"
                />
              </div>
              {formErrors.email && formErrors.email.length > 0 && (
                <ul className="text-left mt-2 text-sm text-red-600 list-disc pl-9 space-y-1 animate-slideInDown">
                  {formErrors.email.map((err, i) => (
                    <li key={i} className="animate-fadeIn" style={{animationDelay: `${i * 100}ms`}}>
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : step === "code" ? (
            <div className="animate-slideInRight">
              <div className="w-[90%] mx-auto mb-6">
                <div className="flex justify-center gap-3 mb-4">
                  {formData.code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        codeRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className={`w-10 h-10 text-center text-lg font-bold border-2 rounded-md outline-none transition-all duration-300 text-[#022F40] border-slate-300 focus:border-blue-500 focus:scale-110 focus:shadow-lg transform animate-bounceIn`}
                      style={{animationDelay: `${index * 100}ms`}}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="resend-button text-[#022F40] text-sm cursor-pointer hover:underline disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Resend code
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-slideInLeft">
              <div
                className={`relative w-[90%]  flex items-center bg-white border mx-auto rounded-md p-2 transition-all duration-300 transform hover:shadow-lg ${getBorderColor(
                  "password"
                )}`}
              >
                <IoIosLock className="text-[#022F40] w-5 h-5 mr-2 transition-colors duration-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="New password"
                  className="w-full bg-transparent outline-none border-none text-md pr-10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-[#022F40] focus:outline-none hover:text-slate-500 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.password && formErrors.password.length > 0 && (
                <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-5 space-y-1 animate-slideInDown">
                  {formErrors.password.map((err, i) => (
                    <li key={i} className="animate-fadeIn" style={{animationDelay: `${i * 100}ms`}}>
                      {err}
                    </li>
                  ))}
                </ul>
              )}

              <div
                className={`relative w-[90%] mt-5 flex items-center bg-white border mx-auto rounded-md p-2 transition-all duration-300 transform hover:shadow-lg ${getBorderColor(
                  "confirmPassword"
                )}`}
              >
                <IoIosLock className="text-[#022F40] w-5 h-5 mr-2 transition-colors duration-200" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent outline-none text-[#022F40] pr-10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 text-[#022F40] focus:outline-none hover:text-slate-500 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.confirmPassword &&
                formErrors.confirmPassword.length > 0 && (
                  <ul className="text-left ml-5 mt-2 mb-3 text-sm text-red-600 list-disc pl-5 space-y-1 animate-slideInDown">
                    {formErrors.confirmPassword.map((err, i) => (
                      <li key={i} className="animate-fadeIn" style={{animationDelay: `${i * 100}ms`}}>
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          <div className="w-[90%] mx-auto mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isTransitioning}
              className={`w-full p-2 cursor-pointer text-white bg-[#022F40] rounded-md shadow transition-all duration-300 transform hover:scale-105 active:scale-95 border border-[#022F40] hover:border-[#022F40] ${
                isLoading || isTransitioning
                  ? "bg-[#022F40] text-[white] border border-[#022F40] cursor-not-allowed opacity-50"
                  : "bg-[#022F40] border border-white hover:bg-white hover:text-[#022F40] hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">

                  <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : step === "email" ? (
                "Send Reset Code"
              ) : step === "code" ? (
                "Verify Code"
              ) : (
                "Reset Password"
              )}
            </button>
          </div>

          <div className="flex gap-2 justify-center mt-4 text-sm animate-fadeInUp animation-delay-200">
            <p className="text-gray-600">Remember your password?</p>
            <button
              onClick={() => navigate("/login")}
              className="text-[#022F40] cursor-pointer hover:underline transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-[100%] object-cover h-[100%] transition-all duration-500 hover:scale-105"
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

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
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

        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ForgotPass;