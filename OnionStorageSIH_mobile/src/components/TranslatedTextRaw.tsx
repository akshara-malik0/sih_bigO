import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  text: string;
}

const TranslatedTextRaw: React.FC<Props> = ({ text }) => {
  const { translateText, currentLanguage } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let mounted = true;

    if (currentLanguage.code === "en") {
      setTranslated(text);
      return;
    }

    translateText(text).then((t) => {
      if (mounted) setTranslated(t);
    });

    return () => {
      mounted = false;
    };
  }, [text, currentLanguage.code, translateText]);

  return <>{translated}</>; // IMPORTANT: NO <span>, NO HTML
};

export default TranslatedTextRaw;
