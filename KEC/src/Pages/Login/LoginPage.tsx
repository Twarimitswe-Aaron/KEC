import React, { useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

const Login = () => {
  interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (
    name: string,
    value: string | boolean
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
      }
    }
    return errors;
  };

  const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const errors = validate(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name] || [],
    }));
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setIsFocused((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    const errors = validate(name, fieldValue);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name] || [],
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailErrors = validate("email", formData.email);
    const passErrors = validate("password", formData.password);

    if (emailErrors.email?.length || passErrors.password?.length) {
      setFormErrors({
        email: emailErrors.email || [],
        password: passErrors.password || [],
      });
      
      setIsLoading(false);
      return;
    }

    try {
      const {data}=await api.get('/csrf/token',{withCredentials:true})
      const csrfToken=data.csrfToken;

      

      const res=await api.post('/auth/login',{
        email:formData.email,
        password:formData.password
      },
    {
      withCredentials:true,
      headers:{
        'X-CSRF-TOKEN':csrfToken
      }
    })

      if(res.data?.access_token){
        localStorage.setItem('token',res.data.access_token)
        navigate('/dashboard')
      }


    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      
    }finally{
      setIsLoading(false)
    }
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const emailErrors = validate("email", formData.email);

    if (!emailErrors.email.length) {
      setOpen(true);
    } else {
      setFormErrors({ email: emailErrors.email });
    }
  };

  const getBorderColor = (field: string): string => {
    if (!touched[field] || isFocused[field]) {
      return "border-[#022F40]"; // blue while focused or untouched
    }

    return formErrors[field]?.length
      ? "border-red-500 placeholder-red-500"
      : "border-green-500 placeholder-green-500";
  };

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="justify-center px-5 pb-18 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center"
        >
          <div>
            <Link to="/" className="flex justify-center items-center relative">
              <img
                src="/images/Logo.svg"
                alt="Logo"
                className="absolute w-25 object-cover top-4"
              />
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20">
            Login
          </h1>

          {!open ? (
            <>
              <div
                className={`w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
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
                  className="w-full bg-transparent outline-none  border-[#022F40] text-md"
                />
              </div>
              {formErrors.email && formErrors.email.length > 0 && (
                <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.email.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              <div className="flex w-[90%] mt-3 mx-auto justify-between">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/passReset"
                  className="text-blue-900 underline hover:text-blue-700"
                >
                  Forgot Password
                </Link>
              </div>

              <div className="w-[90%] mx-auto mt-4">
                <button
                  onClick={handleContinue}
                  className="w-full p-2 cursor-pointer text-white bg-[#022F40] rounded-md shadow hover:bg-white hover:text-[#022F40] transition-all duration-300 border border-white"
                >
                  Continue
                </button>
              </div>

              <div className="flex gap-2 justify-center mt-3">
                <p>Don't have an account?</p>
                <Link
                  to="/Signup"
                  className="text-blue-900 underline hover:text-blue-700"
                >
                  Register
                </Link>
              </div>

              <div className="flex items-center my-4 justify-center w-[90%] mx-auto">
                <div className="flex-grow h-px bg-[#022F40]"></div>
                <span className="mx-4 text-[#022F40] text-sm">
                  Or with Google
                </span>
                <div className="flex-grow h-px bg-[#022F40]"></div>
              </div>

              <div className="flex justify-center">
                <div className="flex items-center cursor-pointer justify-center gap-4 w-[90%] px-2 py-2 border border-[#022F40] rounded-md hover:bg-[#022F40] hover:text-white transition-all duration-300">
                  <img src="/images/Google.png" alt="Google" className="w-6" />
                  <p>Continue With Google</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className={`relative w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
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
                  className="absolute right-3 text-[#022F40] focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.password && formErrors.password.length > 0 && (
                <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.password.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              <div className="flex w-full h-[40px] gap-3 mt-6 justify-center">
                <button
                  onClick={() => setOpen(false)}
                  className="w-[45%] p-2 border cursor-pointer rounded-md border-[#022F40] hover:text-[#022F40] hover:bg-white transition-all duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "w-[45%] cursor-pointer flex justify-center items-center gap-2 p-2 rounded-md shadow transition-all duration-300 border",
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
                    "Sign In"
                  )}
                </button>
               
              </div>
            </>
          )}
        </form>
      </div>
      <div className="hidden lg:flex bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-[100%] object-cover h-[100%]"
        />
      </div>
    </div>
  );
};

export default Login;
