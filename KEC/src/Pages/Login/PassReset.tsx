import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoIosLock } from 'react-icons/io';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const PassReset = () => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const validate = (
    name: string,
    value: string,
    showToast: boolean = false
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};

    if (name === 'email') {
      errors.email = [];
      if (!value) {
        errors.email.push('Email is required');
        if (showToast) toast.error('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errors.email.push('Please enter a valid email address');
        if (showToast) toast.error('Please enter a valid email address');
      }
    }

    if (name === 'password') {
      errors.password = [];
      if (!value) {
        errors.password.push('Password is required');
        if (showToast) toast.error('Password is required');
      } else {
        if (!/[A-Z]/.test(value)) {
          errors.password.push('Include at least one uppercase letter');
          if (showToast) toast.error('Password must include at least one uppercase letter');
        }
        if (!/[0-9]/.test(value)) {
          errors.password.push('Include at least one number');
          if (showToast) toast.error('Password must include at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.password.push('Include one special character');
          if (showToast) toast.error('Password must include one special character');
        }
        if (value.length < 6) {
          errors.password.push('Minimum 6 characters');
          if (showToast) toast.error('Password must be at least 6 characters');
        }
      }
    }

    if (name === 'confirmPassword') {
      errors.confirmPassword = [];
      if (!value) {
        errors.confirmPassword.push('Please confirm your password');
        if (showToast) toast.error('Please confirm your password');
      } else if (value !== formData.password) {
        errors.confirmPassword.push('Passwords do not match');
        if (showToast) toast.error('Passwords do not match');
      }
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const errors = validate(name, value, false);
    setFormErrors(prev => ({
      ...prev,
      [name]: errors[name] || []
    }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused(prev => ({ ...prev, [name]: true }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused(prev => ({ ...prev, [name]: false }));
  };

  const getBorderColor = (field: string): string => {
    if (!touched[field] || isFocused[field]) {
      return 'border-[#022F40]';
    }
    return formErrors[field]?.length
      ? 'border-red-500 placeholder-red-500'
      : 'border-green-500 placeholder-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 'email') {
      const emailErrors = validate('email', formData.email, true);
      if (emailErrors.email?.length) {
        setIsLoading(false);
        return;
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Reset code sent to your email');
      setStep('reset');
    } else {
      const passErrors = validate('password', formData.password, true);
      const confirmPassErrors = validate('confirmPassword', formData.confirmPassword, true);

      if (passErrors.password?.length || confirmPassErrors.confirmPassword?.length) {
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset successful');
      navigate('/login');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="justify-center px-5 pb-18 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center"
        >
          <Link to="/" className="flex justify-center items-center relative">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="absolute w-25 object-cover top-4"
            />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mt-20">
            {step === 'email' ? 'Reset Password' : 'Create New Password'}
          </h1>

          {step === 'email' ? (
            <>
              <div
                className={`w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
                  'email'
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
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none border-[#022F40] text-md"
                />
              </div>
              {formErrors.email && formErrors.email.length > 0 && (
                <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.email.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div
                className={`relative w-[90%] mt-10 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
                  'password'
                )}`}
              >
                <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="New password"
                  className="w-full bg-transparent outline-none border-none text-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
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

              <div
                className={`relative w-[90%] mt-5 flex items-center bg-white border mx-auto rounded-md p-2 ${getBorderColor(
                  'confirmPassword'
                )}`}
              >
                <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent outline-none border-none text-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 text-[#022F40] focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.confirmPassword && formErrors.confirmPassword.length > 0 && (
                <ul className="text-left ml-5 mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.confirmPassword.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="w-[90%] mx-auto mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                'w-full p-2 rounded-md shadow text-white transition-all duration-300',
                {
                  'bg-[#022F40] border border-white hover:bg-white hover:text-[#022F40]':
                    !isLoading,
                  'bg-white text-[#022F40] border border-[#022F40] cursor-not-allowed opacity-50':
                    isLoading,
                }
              )}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin inline-block"></span>
              ) : step === 'email' ? (
                'Send Reset Code'
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div className="flex gap-2 justify-center mt-4">
            <p>Remember your password?</p>
            <Link
              to="/login"
              className="text-blue-900 underline hover:text-blue-700"
            >
              Login
            </Link>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-full object-cover h-full"
        />
      </div>
    </div>
  );
};

export default PassReset; 