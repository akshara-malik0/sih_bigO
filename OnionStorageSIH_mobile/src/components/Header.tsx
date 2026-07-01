import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import TranslatedText from "./TranslatedText";

const Header: React.FC = () => {
  return (
    <header className="bg-[#7E3285] shadow-md border-b border-gray-600 sticky top-0 z-50">
      <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 px-3 sm:px-4 lg:px-6">
        {/* Logo + Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <img
            src="/onion.png"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0"
            alt="Onion Logo"
          />

          <div className="min-w-0 flex-1">
            <TranslatedText
              as="h1"
              text="Smart Onion Storage Dashboard"
              className="text-sm sm:text-lg md:text-2xl lg:text-3xl text-white font-exo truncate"
            />
            <TranslatedText
              as="p"
              text="Real-time monitoring"
              className="font-oxanium text-[10px] sm:text-xs md:text-sm text-white truncate"
            />
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center ml-2 sm:ml-4 flex-shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
