import React from "react";
import { useLanguage, languages } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";
import TranslatedText from "./TranslatedText";

const LanguageModal: React.FC = () => {
  const {
    showLanguageModal,
    setLanguage,
    setShowLanguageModal,
    currentLanguage,
  } = useLanguage();

  if (!showLanguageModal) return null;

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setLanguage(language);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing modal by clicking backdrop on first visit
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-3 sm:mx-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-purple-100 p-2.5 sm:p-3 rounded-full">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
          <TranslatedText
            as="h2"
            text="Choose your language"
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2"
          />
          <TranslatedText
            as="p"
            text="Select your preferred language for the dashboard"
            className="text-sm sm:text-base text-gray-600"
          />
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className="w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-purple-700">
                    {language.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 group-hover:text-purple-600">
                    {language.nativeName}
                  </div>
                </div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-300 rounded-full group-hover:bg-purple-500 transition-colors duration-200"></div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <TranslatedText
            as="p"
            text="You can change this later from the navigation bar"
            className="text-[10px] sm:text-xs text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
