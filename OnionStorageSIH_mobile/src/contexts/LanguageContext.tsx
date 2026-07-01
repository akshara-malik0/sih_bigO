import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

/* ===========================================================
    LANGUAGE OPTIONS
=========================================================== */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
];

/* ===========================================================
    TRANSLATION DICTIONARY (DEDUPED, CLEAN)
=========================================================== */

const translations: Record<string, Record<string, string>> = {
  /* ---------------- STORAGE BOX ---------------- */
  "Storage Box": {
    hi: "भंडारण बॉक्स",
    mr: "स्टोरेज बॉक्स",
    kn: "ಸಂಗ್ರಹಣ ಪೆಟ್ಟಿಗೆ",
  },
  "Real-time monitoring dashboard": {
    hi: "रीयल-टाइम मॉनिटरिंग डैशबोर्ड",
    mr: "रिअल-टाइम मॉनिटरिंग डॅशबोर्ड",
    kn: "ರಿಯಲ್-ಟೈಮ್ ಮೇಲ್ವಿಚಾರಣೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  },

  /* ---------------- CHART TITLES ---------------- */
  "Temperature Monitoring": {
    hi: "तापमान निगरानी",
    mr: "तापमान निरीक्षण",
    kn: "ತಾಪಮಾನ ಮೇಲ್ವಿಚಾರಣೆ",
  },
  "Humidity Monitoring": {
    hi: "आर्द्रता निगरानी",
    mr: "आर्द्रता निरीक्षण",
    kn: "ತೇವಾಂಶ ಮೇಲ್ವಿಚಾರಣೆ",
  },
  "Gas Monitoring": {
    hi: "गैस निगरानी",
    mr: "गॅस निरीक्षण",
    kn: "ಅನಿಲ ಮೇಲ್ವಿಚಾರಣೆ",
  },

  /* ---------------- METRIC LABELS ---------------- */
  Temperature: { hi: "तापमान", mr: "तापमान", kn: "ತಾಪಮಾನ" },
  Humidity: { hi: "आर्द्रता", mr: "आर्द्रता", kn: "ತೇವಾಂಶ" },
  "Gas Level": { hi: "गैस स्तर", mr: "गॅस पातळी", kn: "ಅನಿಲ ಮಟ್ಟ" },
  "Onion Health": {
    hi: "प्याज स्वास्थ्य",
    mr: "कांदा आरोग्य",
    kn: "ಈರುಳ್ಳಿ ಆರೋಗ್ಯ",
  },

  "Optimal: 15–18°C": {
    hi: "इष्टतम: 15–18°C",
    mr: "इष्टतम: 15–18°C",
    kn: "ಅತ್ಯುತ್ತಮ: 15–18°C",
  },
  "Optimal: 65–75%": {
    hi: "इष्टतम: 65–75%",
    mr: "इष्टतम: 65–75%",
    kn: "ಅತ್ಯುತ್ತಮ: 65–75%",
  },
  "Optimal: <100 ppm": {
    hi: "इष्टतम: <100 ppm",
    mr: "इष्टतम: <100 ppm",
    kn: "ಅತ್ಯುತ್ತಮ: <100 ppm",
  },

  Healthy: { hi: "स्वस्थ", mr: "निरोगी", kn: "ಆರೋಗ್ಯಕರ" },
  "All Good": { hi: "सब ठीक", mr: "सगळं ठीक", kn: "ಎಲ್ಲ ಸರಿ" },

  /* ---------------- RISK ---------------- */
  "Risk Detected": {
    hi: "जोखिम पाया गया",
    mr: "धोका आढळला",
    kn: "ಅಪಾಯ ಪತ್ತೆಯಾಯಿತು",
  },

  "Environmental conditions are outside optimal ranges. Immediate attention required.":
    {
      hi: "पर्यावरणीय स्थितियाँ इष्टतम सीमा से बाहर हैं। तुरंत ध्यान आवश्यक।",
      mr: "पर्यावरणीय परिस्थिती इष्टतम मर्यादेबाहेर आहे. तातडीने लक्ष द्या.",
      kn: "ಪರಿಸ್ಥಿತಿಗಳು ಉತ್ತಮ ಮಿತಿಗಳ ಹೊರಗೆಿವೆ. ತಕ್ಷಣ ಗಮನ ಅಗತ್ಯ.",
    },

  /* ---------------- CAMERA VIEWER ---------------- */
  "Live Camera Feed": {
    hi: "लाइव कैमरा फ़ीड",
    mr: "लाईव्ह कॅमेरा फीड",
    kn: "ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೀಡ್",
  },
  "Webcam Mode": { hi: "वेबकैम मोड", mr: "वेबकॅम मोड", kn: "ವೆಬ್‌ಕ್ಯಾಮ್ ಮೋಡ್" },
  "Start Webcam": {
    hi: "वेबकैम प्रारंभ करें",
    mr: "वेबकॅम सुरू करा",
    kn: "ವೆಬ್‌ಕ್ಯಾಮ್ ಪ್ರಾರಂಭಿಸಿ",
  },
  "Stop Camera": {
    hi: "कैमरा बंद करें",
    mr: "कॅमेरा बंद करा",
    kn: "ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ",
  },
  "Load Stream": {
    hi: "स्ट्रीम लोड करें",
    mr: "स्ट्रीम लोड करा",
    kn: "ಸ್ಟ್ರೀಮ್ ಲೋಡ್ ಮಾಡಿ",
  },
  Live: { hi: "लाइव", mr: "लाईव्ह", kn: "ಲೈವ್" },
  Offline: { hi: "ऑफलाइन", mr: "ऑफलाइन", kn: "ಆಫ್ಲೈನ್" },

  "Camera stream will appear here": {
    hi: "कैमरा स्ट्रीम यहाँ दिखाई देगी",
    mr: "कॅमेरा स्ट्रीम येथे दिसेल",
    kn: "ಕ್ಯಾಮೆರಾ ಸ್ಟ್ರೀಮ್ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
  },
  "Start the stream and click capture to save images": {
    hi: "स्ट्रीम शुरू करें और छवियाँ सहेजने के लिए कैप्चर दबाएँ",
    mr: "स्ट्रीम सुरू करा आणि प्रतिमा सेव्ह करण्यासाठी कॅप्चर दाबा",
    kn: "ಸ್ಟ್ರೀಮ್ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಚಿತ್ರ ಉಳಿಸಲು ಕ್ಯಾಪ್ಚರ್ ಒತ್ತಿ",
  },
  "Recent Captures": {
    hi: "हालिया कैप्चर",
    mr: "अलीकडील ಕॅಪ್ಚರ್",
    kn: "ಇತ್ತೀಚಿನ ಕ್ಯಾಪ್ಚರ್‌ಗಳು",
  },
  "No images captured yet": {
    hi: "अभी तक कोई छवि कैप्चर नहीं की गई",
    mr: "अजून प्रतिमा कॅಪ್ಚರ್ केलेली नाही",
    kn: "ಇನ್ನೂ ಚಿತ್ರಗಳನ್ನು ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿಲ್ಲ",
  },

  /* ---------------- CONTROLS TABLE ---------------- */
  "Manual Controls": {
    hi: "मैनुअल नियंत्रण",
    mr: "मॅन्युअಲ್ नियंत्रण",
    kn: "ಮಾನ್ಯುಯಲ್ ನಿಯಂತ್ರಣ",
  },
  "Recent Control Actions": {
    hi: "हालिया नियंत्रण कार्रवाइयाँ",
    mr: "अलीकडील नियंत्रण क्रिया",
    kn: "ಇತ್ತೀಚಿನ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು",
  },

  Time: { hi: "समय", mr: "वेळ", kn: "ಸಮಯ" },
  Action: { hi: "क्रिया", mr: "कृती", kn: "ಕ್ರಮ" },
  Parameter: { hi: "मापदंड", mr: "पॅರामीटर", kn: "ಪರಿಮಾಣ" },
  Change: { hi: "परिवर्तन", mr: "बदल", kn: "ಬದಲಾವಣೆ" },
  Status: { hi: "स्थिति", mr: "स्थिती", kn: "ಸ್ಥಿತಿ" },

  Success: { hi: "सफल", mr: "यशस्वी", kn: "ಯಶಸ್ವಿ" },
  Pending: { hi: "लंबित", mr: "प्रलंबित", kn: "ಬಾಕಿ" },
  Failed: { hi: "विफल", mr: "अयशस्वी", kn: "ವಿಫಲ" },
  Unknown: { hi: "अज्ञात", mr: "अज्ञात", kn: "ಅಜ್ಞಾತ" },

  "Temperature Adjustment": {
    hi: "तापमान समायोजन",
    mr: "तापमान समायोजन",
    kn: "ತಾಪಮಾನ ಹೊಂದಿಕೆ",
  },
  "Ventilation Control": {
    hi: "वेंटिलेशन नियंत्रण",
    mr: "वेंटिलेशन नियंत्रण",
    kn: "ಹವಾನಿಯಂತ್ರಣ ನಿಯಂತ್ರಣೆ",
  },
  "Humidity Control": {
    hi: "आर्द्रता नियंत्रण",
    mr: "आर्द्रता नियंत्रण",
    kn: "ತೇವಾಂಶ ನಿಯಂತ್ರಣ",
  },
  "System Check": {
    hi: "सिस्टम जाँच",
    mr: "सिस्टम तपासणी",
    kn: "ವ್ಯವಸ್ಥೆ ಪರಿಶೀಲನೆ",
  },
  "Fan Speed": { hi: "पंखे की गति", mr: "फॅन स्पीड", kn: "ಫ್ಯಾನ್ ವೇಗ" },

  /* ---------------- GAS MONITORING ---------------- */
  "Select Gas": { hi: "गैस चुनें", mr: "गॅस निवडा", kn: "ಅನಿಲ ಆಯ್ಕೆಮಾಡಿ" },
  "Trend Monitoring": {
    hi: "प्रवृत्ति निगरानी",
    mr: "ट्रेंड मॉनिटरिंग",
    kn: "ಪ್ರವೃತ್ತಿ ಮೇಲ್ವಿಚಾರಣೆ",
  },
  "Viewing real-time concentration levels for the selected gas": {
    hi: "चयनित गैस के वास्तविक समय सांद्रता स्तर देखना",
    mr: "निवडलेल्या गॅसचे रिअल-टाइम पातळी पहा",
    kn: "ಆಯ್ದ ಅನಿಲದ ನೈಜ-ಸಮಯ ಮಟ್ಟಗಳನ್ನು ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ",
  },
  "Last 24 Hours": {
    hi: "पिछले 24 घंटे",
    mr: "गेले 24 तास",
    kn: "ಕಳೆದ 24 ಗಂಟೆಗಳು",
  },
  "Last 7 Days": {
    hi: "पिछले 7 दिन",
    mr: "गेले 7 दिवस",
    kn: "ಕಳೆದ 7 ದಿನಗಳು",
  },
  "Last 30 Days": {
    hi: "पिछले 30 दिन",
    mr: "गेले 30 दिवस",
    kn: "ಕಳೆದ 30 ದಿನಗಳು",
  },

  "Average:": { hi: "औसत:", mr: "सरासरी:", kn: "ಸರಾಸರಿ:" },
  "Maximum:": { hi: "अधिकतम:", mr: "कमाल:", kn: "ಗರಿಷ್ಠ:" },
  "Minimum:": { hi: "न्यूनतम:", mr: "किमान:", kn: "ಕನಿಷ್ಠ:" },

  /* ---------------- BOX INFORMATION ---------------- */
  "Box Information": {
    hi: "बॉक्स जानकारी",
    mr: "बॉक्स माहिती",
    kn: "ಪೆಟ್ಟಿಗೆ ಮಾಹಿತಿ",
  },
  "Box ID": { hi: "बॉक्स आईडी", mr: "बॉक्स आयडी", kn: "ಪೆಟ್ಟಿಗೆ ಐಡಿ" },
  "Last Updated": {
    hi: "अंतिम अपडेट",
    mr: "शेवटचे अपडेट",
    kn: "ಕೊನೆಯ ನವೀಕರಣ",
  },
  "Health Score": {
    hi: "स्वास्थ्य स्कोर",
    mr: "आरोग्य स्कोर",
    kn: "ಆರೋಗ್ಯ ಸ್ಕೋರ್",
  },

  /* ---------------- GAS LABELS ---------------- */
  "Ammonia (NH₂)": {
    hi: "अमोनिया (NH₂)",
    mr: "अमोनिया (NH₂)",
    kn: "ಅಮೋನಿಯಾ (NH₂)",
  },
  "Carbon Dioxide (CO₂)": {
    hi: "कार्बन डाइऑक्साइड (CO₂)",
    mr: "कार्बन डायऑक्साइड (CO₂)",
    kn: "ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ (CO₂)",
  },
  "Hydrogen Sulfide (H₂S)": {
    hi: "हाइड्रोजन सल्फाइड (H₂S)",
    mr: "हायड्रोजन सल्फाइड (H₂S)",
    kn: "ಹೈಡ್ರೋಜನ್ ಸಲ್ಫೈಡ್ (H₂S)",
  },

  "All Conditions Optimal": {
    hi: "सभी स्थितियाँ इष्टतम हैं",
    mr: "सर्व स्थिती इष्टतम आहेत",
    kn: "ಎಲ್ಲಾ ಪರಿಸ್ಥಿತಿಗಳು ಉತ್ತಮವಾಗಿವೆ",
  },

  "Temperature, humidity, and gas levels are within ideal safe limits.": {
    hi: "तापमान, आर्द्रता और गैस स्तर सुरक्षित सीमा के भीतर हैं।",
    mr: "तापमान, आर्द्रता आणि गॅस पातळी सुरक्षित मर्यादेत आहेत.",
    kn: "ತಾಪಮಾನ, ತೇವಾಂಶ ಮತ್ತು ಅನಿಲ ಮಟ್ಟಗಳು ಸುರಕ್ಷಿತ ಮಿತಿಗಳಲ್ಲಿವೆ.",
  },

  "Spoilage Detected": {
    hi: "सड़न पाई गई",
    mr: "सडण्याचे निदान",
    kn: "ಹಾಳಾಗುವಿಕೆ ಕಂಡುಬಂದಿದೆ",
  },

  /* ---------------- CAMERA CAPTURE ---------------- */
  "All Sensors": {
    hi: "सभी सेंसर",
    mr: "सर्व सेन्सर",
    kn: "ಎಲ್ಲ ಸೆನ್ಸರ್ಗಳು",
  },

  "ESP32-CAM Viewer": {
    hi: "ESP32-CAM व्यूअर",
    mr: "ESP32-CAM दर्शक",
    kn: "ESP32-CAM ವೀಕ್ಷಕ",
  },

  "Monitor storage area with live camera feed": {
    hi: "लाइव कैमरा फ़ीड के साथ भंडारण क्षेत्र की निगरानी करें",
    mr: "लाईव्ह कॅमेरा फीडसह साठवण क्षेत्रावर नजर ठेवा",
    kn: "ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೀಡ್ನೊಂದಿಗೆ ಸಂಗ್ರಹಣ ಪ್ರದೇಶವನ್ನು ನಿಗಾದ್ದಿಡಿ",
  },

  "Ammonia (NH₃)": {
    hi: "अमोनिया (NH₃)",
    mr: "अमोनिया (NH₃)",
    kn: "ಅಮೋನಿಯಾ (NH₃)",
  },

  "ESP32-CAM Surveillance": {
    hi: "ESP32-CAM निगरानी",
    mr: "ESP32-CAM निरीक्षण",
    kn: "ESP32-CAM ಮೇಲ್ವಿಚಾರಣೆ",
  },

  Standby: {
    hi: "स्टैंडबाय",
    mr: "स्टँडबाय",
    kn: "ಸ್ಟ್ಯಾಂಡ್‌ಬೈ",
  },

  NORMAL: {
    hi: "सामान्य",
    mr: "सामान्य",
    kn: "ಸಾಮಾನ್ಯ",
  },

  "Automatically captures when conditions exceed safe limits": {
    hi: "स्थिति सुरक्षित सीमा से अधिक होने पर स्वचालित रूप से कैप्चर करता है",
    mr: "स्थिती सुरक्षित मर्यादा ओलांडल्यास स्वयंचलितपणे कॅप्चर करते",
    kn: "ಪರಿಸ್ಥಿತಿಗಳು ಸುರಕ್ಷಿತ ಮಿತಿಗಳನ್ನು ಮೀರಿದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹಿಡಿಯುತ್ತದೆ",
  },

  "Alert Captures": {
    hi: "अलर्ट कैप्चर",
    mr: "अलर्ट कॅಪ्चर",
    kn: "ಎಚ್ಚರಿಕೆ ಕ್ಯಾಪ್ಚರ್‌ಗಳು",
  },

  "No alerts captured yet": {
    hi: "अभी तक कोई अलर्ट कैप्चर नहीं हुआ",
    mr: "अजून कोणतेही अलर्ट कॅಪ्चर झाले नाहीत",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ಎಚ್ಚರಿಕೆ ಹಿಡಿಯಲಾಗಿಲ್ಲ",
  },

  "Camera will automatically capture when conditions go out of range": {
    hi: "स्थिति सीमा से बाहर होने पर कैमरा स्वचालित रूप से कैप्चर करेगा",
    mr: "स्थिती मर्यादेबाहेर गेल्यावर कॅमेरा स्वयंचलಿತपणे कॅಪ್ಚರ್ करेल",
    kn: "ಪರಿಸ್ಥಿತಿಗಳು ಮಿತಿಯನ್ನು ಮೀಳಿದಾಗ ಕ್ಯಾಮೆರಾ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹಿಡಿಯುತ್ತದೆ",
  },

  "{count} alerts captured": {
    hi: "{count} अलर्ट कैप्चर किए गए",
    mr: "{count} अलर्ट कॅಪ्चर झाले",
    kn: "{count} ಎಚ್ಚರಿಕೆಗಳು ಹಿಡಿಯಲ್ಪಟ್ಟಿವೆ",
  },

  "{count} images": {
    hi: "{count} छवियाँ",
    mr: "{count} प्रतिमा",
    kn: "{count} ಚಿತ್ರಗಳು",
  },

  images: {
    hi: "छवियाँ",
    mr: "प्रतिमा",
    kn: "ಚಿತ್ರಗಳು",
  },

  Active: {
    hi: "सक्रिय",
    mr: "सक्रिय",
    kn: "ಸಕ್ರಿಯ",
  },

  "OUT OF RANGE": {
    hi: "सीमा से बाहर",
    mr: "मर्यादेबाहेर",
    kn: "ಮಿತಿಯ ಹೊರಗೆ",
  },

  "Camera Triggered": {
    hi: "कैमरा ट्रिगर हुआ",
    mr: "कॅमेरा ट्रिगರ್ झाला",
    kn: "ಕ್ಯಾಮೆರಾ ಪ್ರಚೋದಿತವಾಯಿತು",
  },

  "Temperature too low": {
    hi: "तापमान बहुत कम",
    mr: "तापमान खूप कमी",
    kn: "ತಾಪಮಾನ ತುಂಬಾ ಕಡಿಮೆ",
  },

  "Temperature too high": {
    hi: "तापमान बहुत अधिक",
    mr: "तापमान खूप जास्त",
    kn: "ತಾಪಮಾನ ತುಂಬಾ ಹೆಚ್ಚು",
  },

  "Humidity too low": {
    hi: "आर्द्रता बहुत कम",
    mr: "आर्द्रता खूप कमी",
    kn: "ತೇವಾಂಶ ತುಂಬಾ ಕಡಿಮೆ",
  },

  "Humidity too high": {
    hi: "आर्द्रता बहुत अधिक",
    mr: "आर्द्रता खूप जास्त",
    kn: "ತೇವಾಂಶ ತುಂಬಾ ಹೆಚ್ಚು",
  },

  "Gas level too high": {
    hi: "गैस स्तर बहुत अधिक",
    mr: "गॅस पातळी खूप जास्त",
    kn: "ಅನಿಲ ಮಟ್ಟ ತುಂಬಾ ಹೆಚ್ಚು",
  },

  "Alert captured": {
    hi: "अलर्ट कैप्चर किया गया",
    mr: "अलर्ट कॅಪ्चर केला",
    kn: "ಎಚ್ಚರಿಕೆ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ",
  },

  "offline mode": {
    hi: "ऑफलाइन मोड",
    mr: "ऑफलाइन मोड",
    kn: "ಆಫ್ಲೈನ್ ಮೋಡ್",
  },

  /* ---------------- GRIDVIEW ---------------- */
  "Storage Grid Overview": {
    hi: "भंडारण ग्रिड अवलोकन",
    mr: "स्टोरेज ग्रिड विहंगावलोकन",
    kn: "ಸಂಗ್ರಹಣ ಗ್ರಿಡ್ ಅವಲೋಕನ",
  },

  "Welcome back": {
    hi: "वापस स्वागत है",
    mr: "पुन्हा स्वागत",
    kn: "ಮತ್ತೆ ಸ್ವಾಗತ",
  },

  "About to Rot": {
    hi: "सड़ने वाला",
    mr: "सडण्याच्या मार्गावर",
    kn: "ಕೊಳೆಯುವ ಹಂತದಲ್ಲಿ",
  },

  "Storage Boxes": {
    hi: "भंडारण बॉक्स",
    mr: "स्टोरेज बॉक्सेस",
    kn: "ಸಂಗ್ರಹಣ ಪೆಟ್ಟಿಗೆಗಳು",
  },

  Showing: {
    hi: "दिखा रहा है",
    mr: "दाखवत आहे",
    kn: "ತೋರಿಸಲಾಗುತ್ತಿದೆ",
  },

  of: {
    hi: "में से",
    mr: "पैकी",
    kn: "ರಲ್ಲಿ",
  },

  "No matching boxes found": {
    hi: "कोई मिलान बॉक्स नहीं मिला",
    mr: "कोणतेही जुळणारे बॉक्स सापडले नाहीत",
    kn: "ಹೊಂದಾಣಿಕೆಯ ಪೆಟ್ಟಿಗೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
  },

  Alert: {
    hi: "अलर्ट",
    mr: "सावधान",
    kn: "ಎಚ್ಚರಿಕೆ",
  },

  "Total Boxes": {
    hi: "कुल बॉक्स",
    mr: "एकूण बॉक्स",
    kn: "ಒಟ್ಟು ಪೆಟ್ಟಿಗೆಗಳು",
  },

  Spoilage: {
    hi: "सड़न",
    mr: "दुर्गंध / खराब होणे",
    kn: "ಹಾಳಾಗುವಿಕೆ",
  },

  "Search Box ID": {
    hi: "बॉक्स आईडी खोजें",
    mr: "बॉक्स आयडी शोधा",
    kn: "ಪೆಟ್ಟಿಗೆ ಐಡಿ ಹುಡುಕಿ",
  },

  "My Account": {
    hi: "मेरा खाता",
    mr: "माझं खाते",
    kn: "ನನ್ನ ಖಾತೆ",
  },

  Logout: {
    hi: "लॉग आउट",
    mr: "लॉग आउट",
    kn: "ಲಾಗ್ ಔಟ್",
  },

  All: {
    hi: "सभी",
    mr: "सर्व",
    kn: "ಎಲ್ಲಾ",
  },

  "Select Gas:": {
    hi: "गैस चुनें:",
    mr: "गॅस निवडा:",
    kn: "ಅನಿಲ ಆಯ್ಕೆಮಾಡಿ:",
  },

  /* ---------------- MY ACCOUNT ---------------- */
  "Onion Storage Logo": {
    hi: "प्याज भंडारण लोगो",
    mr: "कांदा साठवण लोगो",
    kn: "ಈರುಳ್ಳಿ ಸಂಗ್ರಹ ಲೋಗೋ",
  },

  "Manage your profile and preferences": {
    hi: "अपनी प्रोफ़ाइल और प्राथमिकताएँ प्रबंधित करें",
    mr: "आपला प्रोफाइल व प्राधान्ये व्यवस्थापित करा",
    kn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆಯ್ಕೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
  },

  "Profile Information": {
    hi: "प्रोफ़ाइल जानकारी",
    mr: "प्रोफाइल माहिती",
    kn: "ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ",
  },

  Edit: { hi: "संपादित करें", mr: "संपादित करा", kn: "ಸಂಪಾದಿಸಿ" },

  Name: { hi: "नाम", mr: "नाव", kn: "ಹೆಸರು" },

  Email: { hi: "ईमेल", mr: "ईमेल", kn: "ಇಮೇಲ್" },

  Phone: { hi: "फ़ोन", mr: "फोन", kn: "ಫೋನ್" },

  "Not provided": {
    hi: "प्रदान नहीं किया गया",
    mr: "पुरवलेले नाही",
    kn: "ಒದಗಿಸಲಾಗಿಲ್ಲ",
  },

  "Quick Actions": {
    hi: "त्वरित क्रियाएँ",
    mr: "जलद क्रिया",
    kn: "ವೇಗವಾದ ಕ್ರಮಗಳು",
  },

  "View My Grid": {
    hi: "मेरा ग्रिड देखें",
    mr: "माझे ग्रीड पहा",
    kn: "ನನ್ನ ಗ್ರಿಡ್ ವೀಕ್ಷಿಸಿ",
  },

  "Add Box": {
    hi: "बॉक्स जोड़ें",
    mr: "बॉक्स जोडा",
    kn: "ಬಾಕ್ಸ್ ಸೇರಿಸಿ",
  },

  "Manage Devices": {
    hi: "डिवाइस प्रबंधित करें",
    mr: "डिव्हाइसेस व्यवस्थापित करा",
    kn: "ಉಪಕರಣಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
  },

  "Connected Boxes": {
    hi: "कनेक्टेड बॉक्स",
    mr: "जोडलेले बॉक्स",
    kn: "ಸಂಪರ್ಕಿತ ಬಾಕ್ಸ್‌ಗಳು",
  },

  "Health Score": {
    hi: "स्वास्थ्य स्कोर",
    mr: "आरोग्य गुण",
    kn: "ಆರೋಗ್ಯ ಅಂಕ",
  },

  "Recent Activity": {
    hi: "हाल की गतिविधि",
    mr: "अलीकडील क्रियाकलाप",
    kn: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
  },

  "No recent activity": {
    hi: "कोई हाल की गतिविधि नहीं",
    mr: "काही अलीकडील क्रियाकलाप नाहीत",
    kn: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ ಇಲ್ಲ",
  },

  Preferences: {
    hi: "प्राथमिकताएँ",
    mr: "प्राधान्ये",
    kn: "ಆಯ್ಕೆಗಳು",
  },

  Language: { hi: "भाषा", mr: "भाषा", kn: "ಭಾಷೆ" },

  Notifications: {
    hi: "सूचनाएँ",
    mr: "सूचना",
    kn: "ಅಧಿಸೂಚನೆಗಳು",
  },

  "Push Notifications": {
    hi: "पुश सूचनाएँ",
    mr: "पुश सूचना",
    kn: "ಪುಷ್ ಅಧಿಸೂಚನೆಗಳು",
  },

  "Email Alerts": {
    hi: "ईमेल अलर्ट",
    mr: "ईमेल अलर्ट",
    kn: "ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳು",
  },

  "SMS Alerts": {
    hi: "एसएमएस अलर्ट",
    mr: "एसएमएस अलर्ट",
    kn: "ಎಸ್‌ಎಂಎಸ್ ಎಚ್ಚರಿಕೆಗಳು",
  },

  "Account Actions": {
    hi: "खाता क्रियाएँ",
    mr: "खातेच्या क्रिया",
    kn: "ಖಾತೆ ಕ್ರಮಗಳು",
  },
};

/* ===========================================================
    Make dictionary available globally for Chart Sync
=========================================================== */
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__translationsCache = translations;
}

/* ===========================================================
    NORMALIZE KEY
=========================================================== */
function normalizeKey(text: string): string {
  if (!text) return "";
  return text.replace(/-/g, "–").replace(/\s+/g, " ").trim().toLowerCase();
}

/* ===========================================================
    CONTEXT SETUP
=========================================================== */
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside provider");
  return ctx;
};

/* ===========================================================
    PROVIDER
=========================================================== */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages[0]
  );
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  /* LOAD SAVED LANGUAGE */
  useEffect(() => {
    const saved = localStorage.getItem("selectedLanguage");
    if (saved) {
      const lang = languages.find((l) => l.code === saved);
      if (lang) setCurrentLanguage(lang);
    } else {
      setShowLanguageModal(true);
    }
  }, []);

  /* SAVE LANGUAGE */
  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem("selectedLanguage", lang.code);
    setShowLanguageModal(false);
  };

  /* ===========================================================
      SMART TRANSLATION ENGINE
  ============================================================ */
  const translateText = useCallback(
    async (text: string): Promise<string> => {
      if (!text || currentLanguage.code === "en") return text;

      const normalized = normalizeKey(text);

      try {
        setIsTranslating(true);

        /* DIRECT MATCH */
        if (translations[text]?.[currentLanguage.code]) {
          return translations[text][currentLanguage.code];
        }

        /* Search keys */
        for (const key in translations) {
          const normKey = normalizeKey(key);

          if (normalized === normKey) {
            return translations[key][currentLanguage.code];
          }

          const isMultiWord = key.trim().split(" ").length > 1;

          if (!isMultiWord && normalized.startsWith(normKey)) {
            const prefix = translations[key][currentLanguage.code];
            if (prefix) {
              const suffix = text.substring(key.length).trim();
              return `${prefix} ${suffix}`.trim();
            }
          }
        }

        console.warn("Missing translation:", text);
        return text;
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage.code]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        showLanguageModal,
        setShowLanguageModal,
        translateText,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
