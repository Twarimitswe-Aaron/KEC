import React, { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import clsx from 'clsx';

const Verification = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(false);

  const handleResendCode = () => {
    console.log('Resending code...');
  };

  const handleSubmitVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    // Handle actual verification logic
  };

  if (!email) return <Navigate to="/signup" replace />;

  return (
    <div className="flex w-full min-h-screen font-sans bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmitVerification}
          className="w-[360px]  space-y-5 border rounded-xl shadow-md px-8 py-10"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/">
              <img src="/images/Logo.svg" alt="Logo" className="w-24" />
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mt-6">
            <Link to="/signup">
              <IoIosArrowBack className="text-2xl text-gray-700" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Verify</h1>
            <FaLock className="text-2xl text-gray-700" />
          </div>

          {/* Instruction */}
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Confirmation</p>
            <p className="text-sm text-gray-700">
              Please type the verification code sent to:
              <br />
              <span className="font-semibold text-[#022F40]">{email}</span>
            </p>
          </div>

          {/* Code input boxes */}
          <div className="flex justify-between gap-2 mt-4">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-10 capitalize h-10 text-2xl items-center font-bold text-center border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#022F40] justify-center transition"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="text-start">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm cursor-pointer text-[#022F40] underline hover:text-blue-900 transition"
            >
              Resend code
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full py-2 cursor-pointer text-white font-semibold rounded-lg transition-all duration-300',
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#022F40] hover:bg-white hover:text-[#022F40] border border-[#022F40]'
            )}
          >
            {loading ? (
              <span className="w-5 justify-center items-center h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              'Confirm'
            )}
          </button>
        </form>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex w-1/2 bg-[#022F40] items-center justify-center">
        <img src="/images/Login.png" alt="Login Illustration" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Verification;
