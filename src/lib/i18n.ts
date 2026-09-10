import type { Lang } from "./types";

export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    brand: "NER-LOGIX",
    tagline: "Smart Logistics & Accessibility Intelligence",
    login: "Enter command centre",
    overview: "Command overview",
    map: "GIS accessibility",
    routes: "Route intelligence",
    fleet: "Essential fleet",
    field: "Field reporting",
    alerts: "Alerts",
    analytics: "Bottlenecks",
    sync: "Sync offline queue",
    live: "Live NER network",
  },
  hi: {
    brand: "NER-LOGIX",
    tagline: "स्मार्ट लॉजिस्टिक्स और सुगम्यता खुफिया",
    login: "कमांड सेंटर में प्रवेश",
    overview: "कमांड सारांश",
    map: "जीआईएस सुगम्यता",
    routes: "मार्ग बुद्धिमत्ता",
    fleet: "आवश्यक बेड़ा",
    field: "क्षेत्र रिपोर्टिंग",
    alerts: "चेतावनियाँ",
    analytics: "बाधाएँ",
    sync: "ऑफ़लाइन कतार सिंक",
    live: "लाइव पूर्वोत्तर नेटवर्क",
  },
  as: {
    brand: "NER-LOGIX",
    tagline: "স্মাৰ্ট লজিষ্টিকছ আৰু সংযোগ বুদ্ধিমত্তা",
    login: "কমাণ্ড চেণ্টাৰত প্ৰৱেশ",
    overview: "কমাণ্ড অৱলোকন",
    map: "জিআইএছ সংযোগ",
    routes: "পথ বুদ্ধিমত্তা",
    fleet: "আৱশ্যকীয় বহৰ",
    field: "ক্ষেত্ৰ প্ৰতিবেদন",
    alerts: "সতৰ্কবাণী",
    sync: "অফলাইন শাৰী ছিংক",
    analytics: "বাধা",
    live: "লাইভ উত্তৰ-পূব নেটৱৰ্ক",
  },
};

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  as: "অসমীয়া",
};
