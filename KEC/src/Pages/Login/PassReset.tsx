import React, { useState, useRef } from 'react';

const PassReset = () => {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for code inputs
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    code: ['', '', '', '', '', ''],
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const validate = (
    name: string,
    value: string | string[],
    showToast: boolean = false
  ): { [key: string]: string[] } => {
    const errors: { [key: string]: string[] } = {};

    if (name === 'email') {
      errors.email = [];
      if (!value) {
        errors.email.push('Email is required');
        if (showToast) alert('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(value as string)) {
        errors.email.push('Please enter a valid email address');
        if (showToast) alert('Please enter a valid email address');
      }
    }

    if (name === 'code') {
      errors.code = [];
      const codeArray = value as string[];
      const codeString = codeArray.join('');
      if (codeString.length !== 6) {
        errors.code.push('Please enter the complete 6-digit code');
        if (showToast) alert('Please enter the complete 6-digit code');
      } else if (!/^\d{6}$/.test(codeString)) {
        errors.code.push('Code must contain only numbers');
        if (showToast) alert('Code must contain only numbers');
      }
    }

    if (name === 'password') {
      errors.password = [];
      if (!value) {
        errors.password.push('Password is required');
        if (showToast) alert('Password is required');
      } else {
        if (!/[A-Z]/.test(value as string)) {
          errors.password.push('Include at least one uppercase letter');
          if (showToast) alert('Password must include at least one uppercase letter');
        }
        if (!/[0-9]/.test(value as string)) {
          errors.password.push('Include at least one number');
          if (showToast) alert('Password must include at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value as string)) {
          errors.password.push('Include one special character');
          if (showToast) alert('Password must include one special character');
        }
        if ((value as string).length < 6) {
          errors.password.push('Minimum 6 characters');
          if (showToast) alert('Password must be at least 6 characters');
        }
      }
    }

    if (name === 'confirmPassword') {
      errors.confirmPassword = [];
      if (!value) {
        errors.confirmPassword.push('Please confirm your password');
        if (showToast) alert('Please confirm your password');
      } else if (value !== formData.password) {
        errors.confirmPassword.push('Passwords do not match');
        if (showToast) alert('Passwords do not match');
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

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...formData.code];
    newCode[index] = value;
    
    setFormData(prev => ({
      ...prev,
      code: newCode
    }));

    const errors = validate('code', newCode, false);
    setFormErrors(prev => ({
      ...prev,
      code: errors.code || []
    }));

    // Auto-focus next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setFormData(prev => ({
        ...prev,
        code: newCode
      }));
      
      const errors = validate('code', newCode, false);
      setFormErrors(prev => ({
        ...prev,
        code: errors.code || []
      }));
      
      codeRefs.current[5]?.focus();
    }
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
      return 'border-slate-700';
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
      alert('Reset code sent to your email');
      setStep('code');
    } else if (step === 'code') {
      const codeErrors = validate('code', formData.code, true);
      if (codeErrors.code?.length) {
        setIsLoading(false);
        return;
      }
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Code verified successfully');
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
      alert('Password reset successful');
      setStep('email'); // Reset to first step for demo
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('New code sent to your email');
    setFormData(prev => ({
      ...prev,
      code: ['', '', '', '', '', '']
    }));
    setFormErrors(prev => ({ ...prev, code: [] }));
    codeRefs.current[0]?.focus();
    setIsLoading(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Reset Password';
      case 'code':
        return 'Enter Verification Code';
      case 'reset':
        return 'Create New Password';
      default:
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email address to receive a reset code';
      case 'code':
        return `We've sent a 6-digit code to ${formData.email}`;
      case 'reset':
        return 'Create your new password';
      default:
        return '';
    }
  };

  return (
    <div className="flex w-full justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg items-center my-auto flex justify-center relative">
        <div
          className="justify-center px-8 py-8 w-full max-w-md bg-white shadow-lg rounded-lg border border-slate-700 text-center"
        >
          {/* Logo */}
          <div className="flex justify-center items-center relative mb-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {getStepTitle()}
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            {getStepDescription()}
          </p>

          {step === 'email' ? (
            <>
              <div
                className={`w-full flex items-center bg-white border rounded-md p-3 mb-3 ${getBorderColor(
                  'email'
                )}`}
              >
                <svg className="w-5 h-5 mr-3 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
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
                  className="w-full bg-transparent outline-none text-slate-800"
                />
              </div>
              {formErrors.email && formErrors.email.length > 0 && (
                <ul className="text-left mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.email.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </>
          ) : step === 'code' ? (
            <>
              <div className="w-full mb-6">
                <div className="flex justify-center gap-3 mb-4">
                  {formData.code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { codeRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-md outline-none transition-colors ${
                        formErrors.code?.length
                          ? 'border-red-500 text-red-500'
                          : digit
                          ? 'border-green-500 text-slate-800'
                          : 'border-slate-300 text-slate-800'
                      } focus:border-blue-500`}
                    />
                  ))}
                </div>
                {formErrors.code && formErrors.code.length > 0 && (
                  <div className="text-center text-sm text-red-600 mb-3">
                    {formErrors.code.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-blue-600 text-sm underline hover:text-blue-800 disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className={`relative w-full flex items-center bg-white border rounded-md p-3 mb-3 ${getBorderColor(
                  'password'
                )}`}
              >
                <svg className="w-5 h-5 mr-3 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="New password"
                  className="w-full bg-transparent outline-none text-slate-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 text-slate-700 focus:outline-none hover:text-slate-500"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && formErrors.password.length > 0 && (
                <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.password.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              <div
                className={`relative w-full flex items-center bg-white border rounded-md p-3 mb-3 ${getBorderColor(
                  'confirmPassword'
                )}`}
              >
                <svg className="w-5 h-5 mr-3 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent outline-none text-slate-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 text-slate-700 focus:outline-none hover:text-slate-500"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && formErrors.confirmPassword.length > 0 && (
                <ul className="text-left mt-2 mb-3 text-sm text-red-600 list-disc pl-5 space-y-1">
                  {formErrors.confirmPassword.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="w-full mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full p-3 rounded-md shadow-md text-white font-semibold transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-700 hover:bg-slate-800 active:transform active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : step === 'email' ? (
                'Send Reset Code'
              ) : step === 'code' ? (
                'Verify Code'
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div className="flex gap-2 justify-center mt-6 text-sm">
            <p className="text-gray-600">Remember your password?</p>
            <button
              onClick={() => setStep('email')}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassReset;