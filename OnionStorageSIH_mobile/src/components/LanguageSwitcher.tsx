import React, { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage, languages } from "../contexts/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: (typeof languages)[0]) => {
    setLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-gray-900"
      >
        <Globe className="w-4 h-4 text-gray-700" />
        <span className="text-sm font-medium">
          {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                    currentLanguage.code === language.code
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs text-gray-500">
                        {language.nativeName}
                      </div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
