import { FaLocationArrow } from "react-icons/fa6";
import MagicButton from "./MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GridGlobe from "./ui/GridGlobe";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("selectedLanguage", language);
    setIsDropdownOpen(false);
  };

  return (
    <div className="pb-20 pt-36 relative bg-gradient-to-br from-[#000000] via-[#000000] 60% via-[#4a0012] to-[#800020]">
      <style jsx>{`
        .text-burgundy {
          color: #800020;
        }

        .tilted-image {
          transform: rotate(-355deg);
          margin-top: -50px;
        }
      `}</style>
      <div className="flex justify-between items-center w-full px-4 md:px-10 absolute top-4 left-0 z-20">
        <div className="flex items-center">
          <img src="/logo1.png" alt="Logo" className="h-12 md:h-16" />
        </div>
        <div className="relative">
          <button
            className="flex items-center space-x-2 text-gray-800"
            onClick={toggleDropdown}
          >
            <img
              src={`/${i18n.language}.png`}
              alt="Current Language"
              className="h-6 w-7 md:h-8 md:w-9"
            />
            <span className="hidden md:inline">
              {i18n.language.toUpperCase()}
            </span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 md:w-40 bg-white border border-gray-300 rounded shadow-lg">
              <ul>
                <li
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => closeDropdown("en")}
                >
                  <img
                    src="/en.png"
                    alt="English"
                    className="h-6 w-7 md:h-8 md:w-9 mr-2"
                  />
                  <span className="text-black">EN</span>
                </li>
                <li
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => closeDropdown("ru")}
                >
                  <img
                    src="/ru.png"
                    alt="Russian"
                    className="h-6 w-7 md:h-8 md:w-9 mr-2"
                  />
                  <span className="text-black">RU</span>
                </li>
                <li
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => closeDropdown("zh")}
                >
                  <img
                    src="/zh.png"
                    alt="Chinese"
                    className="h-6 w-7 md:h-8 md:w-9 mr-2"
                  />
                  <span className="text-black">ZH</span>
                </li>
                <li
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => closeDropdown("kk")}
                >
                  <img
                    src="/kk.png"
                    alt="Kazakh"
                    className="h-6 w-7 md:h-8 md:w-9 mr-2"
                  />
                  <span className="text-black">KK</span>
                </li>
                <li
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => closeDropdown("ar")}
                >
                  <img
                    src="/ar.png"
                    alt="Arabic"
                    className="h-6 w-7 md:h-8 md:w-9 mr-2"
                  />
                  <span className="text-black">AR</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="h-screen w-full absolute top-0 left-0 flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center relative my-20 z-10 px-4 md:px-10">
        <div className="max-w-full md:max-w-2xl lg:max-w-[60vw] flex flex-col items-start justify-center">
          <TextGenerateEffect
            words={t("prepare_message")}
            className="text-left text-3xl md:text-5xl lg:text-6xl text-burgundy"
          />
          <a
            href={`/main?lang=${i18n.language}`}
            className="scroll-smooth mt-10"
          >
            <MagicButton
              title={t("master_ielts")}
              icon={<FaLocationArrow />}
              position="right"
              otherClasses="bg-burgundy border-burgundy"
            />
          </a>
        </div>
        <GridGlobe />
      </div>
    </div>
  );
};

export default Hero;
