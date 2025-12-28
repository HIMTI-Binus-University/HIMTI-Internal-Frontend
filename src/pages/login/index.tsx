import { useState, useEffect } from "react";
import { GoogleLogo } from "@/components/icons/GoogleLogo";
import HimtiLogo from "@/components/icons/HimtiLogo";
import { useLoginWithGoogle } from "@/hooks/auth-user/query";

const TypingHelloAnimation = () => {
  const greetings = [
    "Hello",
    "你好",
    "Hola",
    "नमस्ते",
    "Ciao",
    "أهلاً",
    "Olá",
    "こんにちは",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentGreeting = greetings[currentIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentGreeting.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentGreeting.slice(0, displayText.length + 1));
        }, 150);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentIndex, greetings]);

  return (
    <h2 className="text-left text-3xl text-grayscale-700 flex font-extralight items-center">
      {displayText}
      <span className="animate-pulse">|</span>,
    </h2>
  );
};

export const LoginPage = () => {
  const loginWithGoogle = useLoginWithGoogle();

  const handleGoogleLogin = () => {
    loginWithGoogle.mutate({
      provider: "google",
      callbackURL: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* GRADIENT */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-primary-500 to-primary-800 h-full">
        <div className="z-10 flex h-full flex-col items-center justify-center space-y-4"></div>

        <div className="absolute -top-0 right-0 h-[800px] w-[800px] blur-[100px] rounded-full bg-grayscale-50/30  animate-smoothGradient1"></div>
      </div>

      {/* CARD */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8  py-8">
        <div className="bg-white max-w-xs w-full py-8 px-10 rounded-sm">
          <div className="mb-6 flex items-center flex-col">
            <div className="w-16 flex items-center mb-6">
              <HimtiLogo width={64} height={75} className="bg-red" />
            </div>
          </div>

          <TypingHelloAnimation />

          <h3 className="text-left text-4xl font-extrabold text-grayscale-900 mb-3">
            Welcome
          </h3>

          <p className="text-left text-md text-grayscale-800 mb-10">
            We're glad you're here! Sign in to get started and discover more.
          </p>

          <button
            className="w-full flex items-center  justify-center  bg-[#F5F5F5] text-[#8F8F8F] hover:text-white px-4 py-2 rounded-sm hover:bg-primary-500 transition duration-200"
            onClick={handleGoogleLogin}
          >
            <div className="w-5 h-5">
              <GoogleLogo />
            </div>
            <div className="w-3"></div>
            <span className="text-base font-bold hidden sm:inline">
              Sign in with Google
            </span>
            <span className="text-base font-bold sm:hidden">Sign in</span>
          </button>
          <div className="flex items-center text-grayscale-700 justify-center gap-1 text-center text-sm font-normal mt-6">
            <span className="">Can't sign in?</span>
            <a
              href="https://teams.microsoft.com/l/chat/0/0?users=abraham.sudjatmoko@binus.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold"
            >
              Contact us
            </a>
          </div>
        </div>
        {/* Footer */}
        <div className="relative z-10 text-center text-white text-sm pt-12">
          <h1 className="text-xs -bottom-0 sm:text-md sm:-bottom-5 -right-48 absolute w-96">
            © 2025 HIMTI. All Rights Reserved.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
