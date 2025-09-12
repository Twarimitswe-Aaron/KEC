import React, { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import clsx from "clsx";

import { useCsrfToken } from "../../hooks/useCsrfToken";
import { useSignupMutation } from "../../state/api/authApi";

const Signup = () => {
  const navigate = useNavigate();
  const { getToken } = useCsrfToken(); // ✅ Hook at top level
  const [signup] = useSignupMutation();

  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }

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
        if (!/[A-Z]/.test(val)) errors.password.push("Include at least one uppercase letter.");
        if (!/[0-9]/.test(val)) errors.password.push("Include at least one number.");
        if (!/[!@#$%^&*(),.?\":{}|<>]/.test(val)) errors.password.push("Include one special character.");
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

  // ------------------------- Submit -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const fields = ["email", "password", "confirmPassword", "firstName", "lastName"];
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
      return;
    }

    // Fetch CSRF token
    const csrfToken = await getToken();
    if (!csrfToken) {
      toast.error("Could not fetch CSRF token. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // Signup request
      await signup({ ...formData, csrfToken }).unwrap();

      // Reset form
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
      toast.success("Account created successfully! Please verify your email.");

      // Optionally navigate to verification page
      // navigate(`/signup/verification?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      if (error.response?.data?.message) toast.error(error.response.data.message);
      else toast.error("Something went wrong. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- JSX -------------------------
  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-top h-full flex justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="justify-center px-5 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center"
        >
          {/* Logo */}
          <Link to="/" className="flex justify-center items-center relative">
            <img src="/images/Logo.svg" alt="Logo" className="absolute w-25 object-cover top-4" />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20">Sign Up</h1>

          {/* Name Fields */}
          <div className="flex gap-5">
            {["firstName", "lastName"].map((field, i) => (
              <div
                key={field}
                className={`w-[42%] mt-5 flex items-center bg-white border rounded-md p-2 ${getBorderColor(
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
                  placeholder={field === "firstName" ? "First name" : "Last name"}
                  className="w-full bg-transparent outline-none text-md"
                />
              </div>
            ))}
          </div>

          {/* Name Errors */}
          <div className="flex w-[90%] mx-auto justify-start text-start">
            {["firstName", "lastName"].map((field) =>
              formErrors[field]?.length ? (
                <ul key={field} className="text-left mt-4 text-sm text-red-600 w-[50%] space-y-1">
                  {formErrors[field].map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              ) : (
                <div key={field} className="w-[50%]" />
              )
            )}
          </div>

          {/* Email */}
          <div
            className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
              "email"
            )}`}
          >
            <MdEmail className="text-[#022F40] w-5 h-5 mr-2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Email"
              className="w-full bg-transparent outline-none text-md"
            />
          </div>
          {formErrors.email?.length > 0 && (
            <ul className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5">
              {formErrors.email.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {/* Password & Confirm Password */}
          {["password", "confirmPassword"].map((field) => (
            <div
              key={field}
              className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md relative p-2 ${getBorderColor(
                field
              )}`}
            >
              <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
              <input
                type={field === "password" ? (showPassword ? "text" : "password") : showConfirmPassword ? "text" : "password"}
                name={field}
                value={formData[field as keyof FormData]}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={field === "password" ? "Password" : "Confirm password"}
                className="w-full bg-transparent outline-none text-md"
              />
              <button
                type="button"
                onClick={() =>
                  field === "password"
                    ? setShowPassword((prev) => !prev)
                    : setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3"
              >
                {field === "password"
                  ? showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                  : showConfirmPassword
                  ? <FaEyeSlash />
                  : <FaEye />}
              </button>
            </div>
          ))}

          {/* Password Errors */}
          {["password", "confirmPassword"].map(
            (field) =>
              formErrors[field]?.length > 0 && (
                <ul key={field} className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5">
                  {formErrors[field].map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )
          )}

          {/* Already have account */}
          <div className="flex gap-2 justify-center mt-3">
            <p>Already have an account?</p>
            <Link to="/login" className="text-blue-900 underline hover:text-blue-700">
              Login
            </Link>
          </div>

          {/* Submit */}
          <div className="w-[90%] mx-auto mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-[100%] cursor-pointer flex justify-center items-center gap-2 p-2 rounded-md shadow transition-all duration-300 border",
                {
                  "text-white bg-[#022F40] border-white hover:bg-white hover:text-[#022F40]": !isLoading,
                  "bg-white text-[#022F40] border-[#022F40] hover:bg-[#022F40] hover:text-white": isLoading,
                  "disabled:opacity-50 disabled:cursor-not-allowed": true,
                }
              )}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4 justify-center w-[90%] mx-auto">
            <div className="flex-grow h-px bg-[#022F40]"></div>
            <span className="mx-4 text-[#022F40] text-sm">Or with Google</span>
            <div className="flex-grow h-px bg-[#022F40]"></div>
          </div>

          {/* Google Signin */}
          <div className="flex mb-10 justify-center">
            <div className="flex items-center justify-center cursor-pointer gap-4 w-[90%] px-2 py-2 border border-[#022F40] rounded-md hover:bg-[#022F40] hover:text-white transition-all duration-300">
              <img src="/images/Google.png" alt="Google" className="w-6" />
              <p>Continue With Google</p>
            </div>
          </div>
        </form>
      </div>

      {/* Illustration */}
      <div className="hidden lg:flex sticky top-0 right-0 bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img src="/images/Login.png" alt="Login Illustration" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Signup;
