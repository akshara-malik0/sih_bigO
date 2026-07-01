import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  text: string;
  values?: Record<string, string | number>; // ✔ supports {placeholders}
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const TranslatedText: React.FC<Props> = ({
  text,
  values,
  as = "span",
  className,
}) => {
  const { translateText, currentLanguage } = useLanguage();

  const [translated, setTranslated] = useState<string>(() => {
    // Synchronous cache (used for charts/tooltips)
    if (typeof window !== "undefined" && (window as any).__translationsCache) {
      try {
        const cache = (window as any).__translationsCache as Record<
          string,
          Record<string, string>
        >;
        const entry = cache[text];
        if (entry && entry[currentLanguage.code]) {
          return entry[currentLanguage.code];
        }
      } catch {}
    }
    return text;
  });

  useEffect(() => {
    let mounted = true;

    if (!text || currentLanguage.code === "en") {
      setTranslated(text);
      return;
    }

    (async () => {
      try {
        const t = await translateText(text);
        if (mounted && typeof t === "string") setTranslated(t);
      } catch {
        if (mounted) setTranslated(text);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [text, currentLanguage.code, translateText]);

  // ✔ Replace {placeholders} with actual values
  let finalText = translated;
  if (values) {
    Object.keys(values).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      finalText = finalText.replace(regex, String(values[key]));
    });
  }

  const Component = as as any;
  return <Component className={className}>{finalText}</Component>;
};

export default TranslatedText;
