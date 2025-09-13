import React, { ChangeEvent, useState } from 'react';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa6';
import { IoIosLock } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Email & Current Password, Step 2: New Password & Confirm
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
 const navigate=useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{
    email: string[];
    currentPassword: string[];
    newPassword: string[];
    confirmPassword: string[];
  }>({
    email: [],
    currentPassword: [],
    newPassword: [],
    confirmPassword: []
  });
  const [touched, setTouched] = useState({
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [isFocused, setIsFocused] = useState({
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const validate = (
    name: keyof typeof formData,
    value: string,
    showToast = false
  ) => {
    const errors: {
      email?: string[];
      currentPassword?: string[];
      newPassword?: string[];
      confirmPassword?: string[];
    } = {};

    if (name === 'email') {
      errors.email = [];
      if (!value) {
        errors.email.push('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errors.email.push('Please enter a valid email address');
      }
    }

    if (name === 'currentPassword') {
      errors.currentPassword = [];
      if (!value) {
        errors.currentPassword.push('Current password is required');
      }
    }

    if (name === 'newPassword') {
      errors.newPassword = [];
      if (!value) {
        errors.newPassword.push('New password is required');
      } else {
        if (!/[A-Z]/.test(value)) {
          errors.newPassword.push('Include at least one uppercase letter');
        }
        if (!/[0-9]/.test(value)) {
          errors.newPassword.push('Include at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.newPassword.push('Include one special character');
        }
        if (value.length < 6) {
          errors.newPassword.push('Minimum 6 characters');
        }
        if (value === formData.currentPassword) {
          errors.newPassword.push('New password must be different from current password');
        }
      }
    }

    if (name === 'confirmPassword') {
      errors.confirmPassword = [];
      if (!value) {
        errors.confirmPassword.push('Please confirm your new password');
      } else if (value !== formData.newPassword) {
        errors.confirmPassword.push('Passwords do not match');
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

    const errors = validate(name as keyof typeof formData, value, false);
    setFormErrors(prev => ({
      ...prev,
      [name]: errors[name as keyof typeof errors] || []
    }));
  };

  const handleFocus = (e:ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused(prev => ({ ...prev, [name]: true }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e:ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setIsFocused(prev => ({ ...prev, [name]: false }));
  };

  const getBorderColor = (field: keyof typeof formErrors) => {
    if (!touched[field] || isFocused[field]) {
      return 'border-[#022F40]';
    }
    return formErrors[field]?.length
      ? 'border-red-500 placeholder-red-500'
      : 'border-green-500 placeholder-green-500';
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate step 1 fields
    const emailErrors = validate('email', formData.email, true);
    const currentPassErrors = validate('currentPassword', formData.currentPassword, true);

    const step1Errors = {
      email: emailErrors.email || [],
      currentPassword: currentPassErrors.currentPassword || [],
      newPassword: [],
      confirmPassword: []
    };

    setFormErrors(step1Errors);

    const hasErrors = Object.values(step1Errors).some(errorArray => errorArray.length > 0);

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call to verify current credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start transition
      setIsTransitioning(true);
      
      // Wait for fade out
      setTimeout(() => {
        setCurrentStep(2);
        setIsTransitioning(false);
      }, 300);
      
    } catch (error) {
      alert('Failed to verify credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate step 2 fields
    const newPassErrors = validate('newPassword', formData.newPassword, true);
    const confirmPassErrors = validate('confirmPassword', formData.confirmPassword, true);

    const step2Errors = {
      email: [],
      currentPassword: [],
      newPassword: newPassErrors.newPassword || [],
      confirmPassword: confirmPassErrors.confirmPassword || []
    };

    setFormErrors(step2Errors);

    const hasErrors = Object.values(step2Errors).some(errorArray => errorArray.length > 0);

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert('Password reset successful!');
      
      // Reset form and go back to step 1
      setFormData({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({
        email: [],
        currentPassword: [],
        newPassword: [],
        confirmPassword: []
      });
      setTouched({
        email: false,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
      setCurrentStep(1);
      
    } catch (error) {
      alert('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(1);
      setIsTransitioning(false);
      setFormErrors({
        email: [],
        currentPassword: [],
        newPassword: [],
        confirmPassword: []
      }); // Clear step 2 errors when going back
    }, 300);
  };

  const handleLoginNavigation = () => {
    console.log('Navigate to login');
    // In your actual app, replace with: navigate('/login')
  };

  return (
    <div className="flex overflow-y-auto w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <div className="justify-center px-5 py-8 sm:w-[390px] sm:top-3 mt-10 w-[320px] h-auto border rounded-md border-[#022F40] text-center">
          {/* Logo */}
          <div className="flex justify-center cursor-pointer items-center relative mb-8">
            <img src="/images/Logo.svg" alt="Logo" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#022F40] mb-2">
            Reset Password
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            {currentStep === 1 
              ? "Verify your current credentials" 
              : "Set your new password"
            }
          </p>

          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep === 1 ? 'bg-[#022F40] text-white' : 'bg-green-500 text-white'
              }`}>
                {currentStep === 1 ? '1' : '✓'}
              </div>
              <div className="w-12 h-1 bg-gray-300">
                <div className={`h-full bg-[#022F40] transition-all duration-500 ${
                  currentStep === 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep === 2 ? 'bg-[#022F40] text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            {currentStep === 1 ? (
              // Step 1: Email and Current Password
              <>
                {/* Email Input */}
                <div className={`w-[90%] mx-auto mb-3 flex items-center bg-white border rounded-md p-2 transition-colors duration-200 ${getBorderColor('email')}`}>
                  <svg className="w-5 h-5 mr-3 text-[#022F40]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className="w-full bg-transparent outline-none text-[#022F40]"
                  />
                </div>
                {formErrors.email && formErrors.email.length > 0 && (
                  <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-9 space-y-1">
                    {formErrors.email.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Current Password Input */}
                <div className={`relative w-[90%] flex items-center bg-white border mx-auto rounded-md p-2 transition-colors duration-200 ${getBorderColor('currentPassword')}`}>
                  <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Current password"
                    className="w-full bg-transparent outline-none border-none text-md pr-10 text-[#022F40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                    className="absolute right-3 text-[#022F40] focus:outline-none hover:text-slate-500"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.currentPassword && formErrors.currentPassword.length > 0 && (
                  <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-9 space-y-1">
                    {formErrors.currentPassword.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Continue Button */}
                <div className="w-[90%] mx-auto mt-6">
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isLoading}
                    className={`w-full p-2 cursor-pointer text-white bg-[#022F40] rounded-md shadow hover:bg-white hover:text-[#022F40] transition-all duration-300 border border-[#022F40] hover:border-[#022F40] ${
                      isLoading 
                        ? 'bg-white text-[#022F40] border border-[#022F40] cursor-not-allowed opacity-50'
                        : 'bg-[#022F40] border border-white hover:bg-white hover:text-[#022F40]'
                    }`}
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Step 2: New Password and Confirm Password
              <>
                {/* New Password Input */}
                <div className={`relative w-[90%] mx-auto mb-3 flex items-center bg-white border rounded-md p-2 ${getBorderColor('newPassword')}`}>
                  <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="New password"
                    className="w-full bg-transparent outline-none border-none text-md pr-10 text-[#022F40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 text-[#022F40] focus:outline-none hover:text-slate-500"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.newPassword && formErrors.newPassword.length > 0 && (
                  <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-9 space-y-1">
                    {formErrors.newPassword.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Confirm Password Input */}
                <div className={`relative w-[90%] mx-auto mb-3 flex items-center bg-white border rounded-md p-2 ${getBorderColor('confirmPassword')}`}>
                  <IoIosLock className="text-[#022F40] w-5 h-5 mr-2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Confirm new password"
                    className="w-full bg-transparent outline-none text-[#022F40] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 text-[#022F40] focus:outline-none hover:text-slate-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && formErrors.confirmPassword.length > 0 && (
                  <ul className="text-left ml-5 mt-2 mb-3 text-sm text-red-600 list-disc pl-5 space-y-1">
                    {formErrors.confirmPassword.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}

                {/* Action Buttons */}
                <div className="w-[90%] h-10 mx-auto flex gap-2 mt-6 space-y-3">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-[50%] p-2 cursor-pointer
                     flex h-full items-center justify-center gap-2 text-[#022F40] bg-white border border-[#022F40] rounded-md hover:bg-gray-50 transition-all duration-300"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-[50%]  h-full  cursor-pointer text-white bg-[#022F40] rounded-md shadow hover:bg-white hover:text-[#022F40] transition-all duration-300 border border-[#022F40] hover:border-[#022F40] ${
                      isLoading 
                        ? 'bg-white text-[#022F40] border border-[#022F40] cursor-not-allowed opacity-50'
                        : 'bg-[#022F40] border border-white hover:bg-white hover:text-[#022F40]'
                    }`}
                  >
                    {isLoading ? (
                      <span className=" border-2 border-dashed border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                    ) : (
                      'Update'
                    )}
                  </button>
                  
                
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-center mt-6 text-sm">
            <p className="text-gray-600">Remember your password?</p>
            <button onClick={()=>navigate('/login')} className="text-[#022F40] cursor-pointer hover:underline">
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex overflow-y-hidden bg-[#022F40] w-[680px] h-screen items-center justify-center">
        <img
          src="/images/Login.png"
          alt="Login Illustration"
          className="w-[100%] object-cover h-[100%]"
        />
      </div>
    </div>
  );
};

export default PasswordReset;