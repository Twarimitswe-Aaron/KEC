import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import clsx from 'clsx';

interface VerificationProps {
  email?: string;
}


const Verification: React.FC<VerificationProps> = ({ email }) => {
  const [step, setStep] = useState<'login' | 'verify'>('verify'); // Start at verify since email is passed
  const [loading, setLoading] = useState(false);

  const handleResendCode = () => console.log('Resending code...');

  const handleSubmitVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    // Proceed with verification logic
  };
  if (!email) {
    // If no email is passed, redirect back to sign up or home
    return <Navigate to="/signup" replace />;
  }

  return (
    <div className="flex w-full justify-center font-robot gap-0">
      <div className="w-[690px] items-center my-auto h-full flex justify-center relative">
        <form
          onSubmit={handleSubmitVerification}
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
            Verify
          </h1>

          <p className="text-sm text-[#022F40] mt-4 font-semibold">Confirmation</p>
          <p className="text-sm mt-2 text-black font-medium px-2">
            Please type the verification code sent to<br />
            <span className="font-bold">{email}</span>
          </p>

          <div className="flex justify-center gap-4 mt-6 mb-4">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-10 h-10 text-center border-b-2 border-gray-400 text-lg outline-none focus:border-[#022F40]"
              />
            ))}
          </div>

          <button
            type="button"
            className="text-sm text-[#022F40] underline hover:text-blue-800 mb-6"
            onClick={handleResendCode}
          >
            Resend code
          </button>

          <button
            type="submit"
            className={clsx(
              'w-full p-2 rounded-md shadow text-white transition-all duration-300',
              loading
                ? 'bg-white text-[#022F40] border border-[#022F40] cursor-not-allowed opacity-50'
                : 'bg-[#022F40] border border-white hover:bg-white hover:text-[#022F40] hover:border-[#022F40]'
            )}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin inline-block"></span>
            ) : (
              'Confirm'
            )}
          </button>
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

export default Verification;
