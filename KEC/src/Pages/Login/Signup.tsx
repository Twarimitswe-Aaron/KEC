import React, { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import clsx from "clsx";
import { api } from "../../utils/api";

const Signup = () => {
  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [login, setLogin] = useState(false);

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const validate = (
    name: string,
    value: string | boolean,
    showToast: boolean = false
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};

    if (name === "email") {
      errors.email = [];
      if (!value) {
        errors.email.push("Email is required.");
      } else if (!/\S+@\S+\.\S+/.test(value as string)) {
        errors.email.push("Please enter a valid email address.");
      }
    }

    if (name === "password") {
      errors.password = [];
      if (!value) {
        errors.password.push("Password is required.");
      } else {
        const val = value as string;
        if (!/[A-Z]/.test(val)) {
          errors.password.push("Include at least one uppercase letter.");
        }
        if (!/[0-9]/.test(val)) {
          errors.password.push("Include at least one number.");
        }
        if (!/[!@#$%^&*(),.?\":{}|<>]/.test(val)) {
          errors.password.push("Include one special character.");
        }
        if (val.length < 6) {
          errors.password.push("Minimum 6 characters.");
        }
      }
    }

    if (name === "confirmPassword") {
      errors.confirmPassword = [];
      if (!value) {
        errors.confirmPassword.push("Please confirm your password.");
      } else if (value !== formData.password) {
        errors.confirmPassword.push("Password does not match.");
        if (showToast) toast.error("Passwords do not match");
      }
    }

    if (name === "firstName") {
      errors.firstName = [];
      if (!value) {
        errors.firstName.push("First name is required.");
      }
    }

    if (name === "lastName") {
      errors.lastName = [];
      if (!value) {
        errors.lastName.push("Last name is required.");
      }
    }

    return errors;
  };

  // const goToVerification = () => {
  //   const emailErrors = validate("email", formData.email, true);
  //   const passErrors = validate("password", formData.password, true);
  //   const confirmPassErrors = validate(
  //     "confirmPassword",
  //     formData.confirmPassword,
  //     true
  //   );
  //   const firstNameErrors = validate("firstName", formData.firstName, true);
  //   const lastNameErrors = validate("lastName", formData.lastName, true);

  //   const allErrors = {
  //     ...emailErrors,
  //     ...passErrors,
  //     ...confirmPassErrors,
  //     ...firstNameErrors,
  //     ...lastNameErrors,
  //   };

  //   const hasErrors = Object.values(allErrors).some(
  //     (arr) => arr && arr.length > 0
  //   );

  //   if (hasErrors) {
  //     return;
  //   }

  //   toast.success("go to your email to verify your account");

  //   setTimeout(() => {
  //     navigate(
  //       `/signup/verification?email=${encodeURIComponent(formData.email)}`
  //     );
  //   }, 1500);
  // };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));
  };

  const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: true }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    const errors = validate(name, fieldValue, false);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name] || [],
    }));
  };

  const getBorderColor = (field: string): string => {
    if (!touched[field] || isFocused[field]) {
      return "border-[#022F40]";
    }
    return formErrors[field]?.length
      ? "border-red-500 placeholder-red-500"
      : "border-green-500 placeholder-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailErrors = validate("email", formData.email, true);
    const passErrors = validate("password", formData.password, true);
    const confirmPasswordErrors = validate(
      "confirmPassword",
      formData.confirmPassword,
      true
    );
    const firstNameErrors = validate("firstName", formData.firstName, true);
    const lastNameErrors = validate("lastName", formData.lastName, true);

    const allErrors = {
      ...emailErrors,
      ...passErrors,
      ...confirmPasswordErrors,
      ...firstNameErrors,
      ...lastNameErrors,
    };

    const hasErrors = Object.values(allErrors).some(
      (arr) => arr && arr.length > 0
    );

    if (hasErrors) {
      setFormErrors(allErrors);
      setIsLoading(false);
      return;
    }



    try {
      const response = await api.post("/student/create", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

     

      toast.success(response.data.message);

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
      });
  
      // Clear errors and touched states if needed
      setFormErrors({});
      setTouched({});
      setIsFocused({});
      // Navigate to verification page after short delay
      // setTimeout(() => {
      //   navigate(`/signup/verification?email=${encodeURIComponent(formData.email)}`);
      // }, 1500);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later");
      }
    } finally {
      setIsLoading(false);
    }

    // Navigate to verification with email
    // navigate(
    //   `/signup/verification?email=${encodeURIComponent(formData.email)}`
    // );
  };

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-top  h-full flex justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="justify-center mx:auto px-5 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center"
        >
          <Link to="/" className="flex justify-center items-center relative">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="absolute w-25 object-cover top-4"
            />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20">
            Sign Up
          </h1>

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
                  placeholder={
                    field === "firstName" ? "First name" : "Last name"
                  }
                  className="w-full bg-transparent outline-none text-md"
                />
              </div>
            ))}
          </div>

          <div className="flex w-[90%] mx-auto justify-start text-start">
            {["firstName", "lastName"].map((field, i) =>
              formErrors[field] && formErrors[field].length > 0 ? (
                <ul
                  key={field}
                  className={`text-left mt-4 text-sm text-red-600 w-[50%] space-y-1`}
                >
                  {formErrors[field].map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              ) : (
                <div key={field} className="w-[50%]" />
              )
            )}
          </div>

          {/* Email Input */}
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

          {formErrors.email && formErrors.email.length > 0 && (
            <ul className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5">
              {formErrors.email.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {/* Password Input */}
          <div
            className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md relative p-2 ${getBorderColor(
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
              placeholder="Password"
              className="w-full bg-transparent outline-none text-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.password && formErrors.password.length > 0 && (
            <ul className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5">
              {formErrors.password.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {/* Confirm Password */}
          <div
            className={`w-[90%] my-5 flex items-center bg-white border mx-auto rounded-md relative p-2 ${getBorderColor(
              "confirmPassword"
            )}`}
          >
            <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Confirm password"
              className="w-full bg-transparent outline-none text-md"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {formErrors.confirmPassword &&
            formErrors.confirmPassword.length > 0 && (
              <ul className="text-left items-center ml-5 mt-4 text-sm text-red-600 list-disc pl-5">
                {formErrors.confirmPassword.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

          <div className="flex gap-2 justify-center mt-3">
            <p>Already have an account</p>
            <Link
              to="/login"
              className="text-blue-900 underline hover:text-blue-700"
            >
              Login
            </Link>
          </div>

          <div className="w-[90%] mx-auto mt-4">
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-[100%] cursor-pointer flex justify-center items-center gap-2 p-2 rounded-md shadow transition-all duration-300 border",
                {
                  "text-white bg-[#022F40] border-white hover:bg-white hover:text-[#022F40]":
                    !isLoading,

                  "bg-white text-[#022F40] border-[#022F40] hover:bg-[#022F40] hover:text-white":
                    isLoading,

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

          <div className="flex items-center my-4 justify-center w-[90%] mx-auto">
            <div className="flex-grow h-px bg-[#022F40]"></div>
            <span className="mx-4 text-[#022F40] text-sm">Or with Google</span>
            <div className="flex-grow h-px bg-[#022F40]"></div>
          </div>

          <div className="flex mb-10 justify-center">
            <div className="flex items-center justify-center cursor-pointer gap-4 w-[90%] px-2 py-2 border border-[#022F40] rounded-md hover:bg-[#022F40] hover:text-white transition-all duration-300">
              <img src="/images/Google.png" alt="Google" className="w-6" />
              <p>Continue With Google</p>
            </div>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex sticky top-0 right-0 bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Signup;
