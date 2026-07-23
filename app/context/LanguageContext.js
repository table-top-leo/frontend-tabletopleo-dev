"use client";
// app/context/LanguageContext.js
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/axiosInterceptor";

const LanguageContext = createContext({
  languageCode: "en",
  languageName: "English",
  setLanguage:  () => {},
  t:            (key) => key,
});

// ── Translations — Settings page only (add more pages later) ─
const TRANSLATIONS = {
  en: {
    // Nav
    profile:"Profile", account:"Account & Security", notifications:"Notifications",
    appearance:"Appearance", language:"Language", qr:"QR Code", plan:"Upgrade Plan",
    support:"Support & Help", danger:"Danger Zone", "customize-menu":"Customize Menu",
    settings:"Settings",
    // Profile section
    profile_picture:"Profile Picture", profile_picture_desc:"Your account photo shown across the dashboard",
    upload_photo:"Upload Photo", change_photo:"Change Photo",
    account_details:"Account Details", account_details_desc:"Your registered account information",
    full_name:"Full Name", email_address:"Email Address",
    // Password section
    change_password:"Change Password", change_password_desc:"Use a strong password to keep your account safe",
    current_password:"Current Password", new_password:"New Password", confirm_new_password:"Confirm New Password",
    update_password:"Update Password", updating:"Updating...",
    enter_current_password:"Enter your current password", min_8_chars:"Min 8 chars with special char",
    re_enter_password:"Re-enter new password",
    // Account info
    account_information:"Account Information", account_info_desc:"Your current login details",
    admin_id:"Admin ID", member_since:"Member Since", current:"Current",
    // Security
    security:"Security", security_desc:"Extra layers of protection for your account",
    two_factor:"Two-Factor Authentication", two_factor_on:"2FA is enabled", two_factor_off:"Add an extra layer of security",
    trusted_devices:"Trusted Devices", trusted_devices_desc:"Manage devices with access to your account",
    active_sessions:"Active Sessions", this_device:"This Device", location:"Location",
    // Notifications
    notif_preferences:"Notification Preferences", notif_desc:"Choose what you want to be notified about",
    new_order:"New Order Alerts", new_order_desc:"When customers place new orders",
    order_status:"Order Status Updates", order_status_desc:"When orders are confirmed, prepared or delivered",
    low_stock:"Low Stock Alerts", low_stock_desc:"When menu item stock is running low",
    daily_report:"Daily Report", daily_report_desc:"Summary of daily orders and revenue",
    payment_alert:"Payment Alerts", payment_alert_desc:"When payments are received or fail",
    customer_review:"Customer Reviews", customer_review_desc:"When customers leave feedback",
    promotions:"Promotions & Offers", promotions_desc:"Special deals and promotional updates",
    system_updates:"System Updates", system_updates_desc:"New features and maintenance notices",
    // Appearance
    theme:"Theme", theme_desc:"Switch between light and dark mode",
    dark_mode:"Dark Mode", light_mode:"Light Mode",
    accent_color:"Accent Color", accent_color_desc:"Pick your preferred interface color",
    display_density:"Display Density", display_density_desc:"Adjust how compact the UI looks",
    compact:"Compact", comfortable:"Comfortable", spacious:"Spacious",
    language_region:"Language & Region",
    // QR
    qr_title:"Your Order QR Code", qr_desc:"Share this QR so customers can scan and place orders directly",
    download_qr:"Download QR", copy_link:"Copy Link", copied:"Copied!",
    qr_settings:"QR Code Settings", custom_branding:"Custom Branding", custom_branding_desc:"Add your logo to the QR code",
    analytics:"QR Analytics", analytics_desc:"Track how many customers scan your QR",
    // Plan
    current_plan:"Current Plan", choose_plan:"Choose the plan that fits your business",
    most_popular:"Most Popular", upgrade_to:"Upgrade to", contact_sales:"Contact Sales",
    // Support
    support_help:"Support & Help", documentation:"Documentation", documentation_desc:"Step-by-step guides to set up and manage your account",
    read_docs:"Read Docs",
    contact_support:"Contact Support", contact_support_desc:"Talk to our team for personalized help",
    send_message:"Send Message",
    community:"Community Forum", community_desc:"Get help from other TableTop Leo users",
    join_community:"Join Community",
    system_status:"System Status", all_systems:"All Systems Operational",
    // Danger
    danger_zone:"Danger Zone", delete_account:"Delete Account",
    delete_account_desc:"Once deleted, all your data, menu items, and orders will be permanently removed.",
    delete_warning:"This action cannot be undone.",
    type_to_confirm:"Type delete my account to confirm",
    cancel:"Cancel", save:"Save Changes", reset:"Reset", enabled:"Enabled", disabled:"Disabled",
    // Language
    select_language:"Select Language", current_language:"Current Language",
    language_desc:"Choose the language for your admin dashboard",
    search_language:"Search languages...", reset_english:"Reset to English",
    language_saved:"Language saved!", save_language:"Save Language",
    all_regions:"All Regions",
  },
  te: {
    profile:"ప్రొఫైల్", account:"ఖాతా & భద్రత", notifications:"నోటిఫికేషన్లు",
    appearance:"రూపురేఖలు", language:"భాష", qr:"QR కోడ్", plan:"ప్లాన్ అప్‌గ్రేడ్",
    support:"సహాయం", danger:"ప్రమాద జోన్", "customize-menu":"మెనూ అనుకూలీకరించు",
    settings:"సెట్టింగులు",
    profile_picture:"ప్రొఫైల్ చిత్రం", profile_picture_desc:"డాష్‌బోర్డ్‌లో చూపబడే మీ ఖాతా ఫోటో",
    upload_photo:"ఫోటో అప్‌లోడ్ చేయి", change_photo:"ఫోటో మార్చు",
    account_details:"ఖాతా వివరాలు", account_details_desc:"మీ నమోదిత ఖాతా సమాచారం",
    full_name:"పూర్తి పేరు", email_address:"ఇమెయిల్ చిరునామా",
    change_password:"పాస్‌వర్డ్ మార్చు", change_password_desc:"మీ ఖాతాను సురక్షితంగా ఉంచడానికి బలమైన పాస్‌వర్డ్ వాడండి",
    current_password:"ప్రస్తుత పాస్‌వర్డ్", new_password:"కొత్త పాస్‌వర్డ్", confirm_new_password:"కొత్త పాస్‌వర్డ్ నిర్ధారించండి",
    update_password:"పాస్‌వర్డ్ అప్‌డేట్ చేయి", updating:"అప్‌డేట్ అవుతోంది...",
    enter_current_password:"ప్రస్తుత పాస్‌వర్డ్ నమోదు చేయండి", min_8_chars:"కనీసం 8 అక్షరాలు", re_enter_password:"పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి",
    account_information:"ఖాతా సమాచారం", account_info_desc:"మీ ప్రస్తుత లాగిన్ వివరాలు",
    admin_id:"అడ్మిన్ ID", member_since:"సభ్యత్వం నుండి", current:"ప్రస్తుత",
    security:"భద్రత", security_desc:"మీ ఖాతాకు అదనపు రక్షణ",
    two_factor:"రెండు-కారక ప్రమాణీకరణ", two_factor_on:"2FA సక్రియంగా ఉంది", two_factor_off:"అదనపు భద్రత జోడించండి",
    trusted_devices:"విశ్వసనీయ పరికరాలు", trusted_devices_desc:"మీ ఖాతాకు యాక్సెస్ ఉన్న పరికరాలు నిర్వహించండి",
    active_sessions:"సక్రియ సెషన్లు", this_device:"ఈ పరికరం", location:"స్థానం",
    notif_preferences:"నోటిఫికేషన్ ప్రాధాన్యతలు", notif_desc:"మీకు ఏ నోటిఫికేషన్లు కావాలో ఎంచుకోండి",
    new_order:"కొత్త ఆర్డర్ హెచ్చరికలు", new_order_desc:"కస్టమర్లు కొత్త ఆర్డర్లు చేసినప్పుడు",
    order_status:"ఆర్డర్ స్థితి అప్‌డేట్లు", order_status_desc:"ఆర్డర్లు నిర్ధారించబడినప్పుడు",
    low_stock:"తక్కువ స్టాక్ హెచ్చరికలు", low_stock_desc:"మెనూ ఐటెమ్ స్టాక్ తక్కువగా ఉన్నప్పుడు",
    daily_report:"రోజువారీ నివేదిక", daily_report_desc:"రోజువారీ ఆర్డర్లు మరియు ఆదాయం సారాంశం",
    payment_alert:"చెల్లింపు హెచ్చరికలు", payment_alert_desc:"చెల్లింపులు వచ్చినప్పుడు లేదా విఫలమైనప్పుడు",
    customer_review:"కస్టమర్ సమీక్షలు", customer_review_desc:"కస్టమర్లు అభిప్రాయం ఇచ్చినప్పుడు",
    promotions:"ప్రచారాలు & ఆఫర్లు", promotions_desc:"ప్రత్యేక డీళ్లు మరియు ప్రచార అప్‌డేట్లు",
    system_updates:"సిస్టమ్ అప్‌డేట్లు", system_updates_desc:"కొత్త ఫీచర్లు మరియు నిర్వహణ నోటీసులు",
    theme:"థీమ్", theme_desc:"లైట్ మరియు డార్క్ మోడ్ మధ్య మార్చండి",
    dark_mode:"డార్క్ మోడ్", light_mode:"లైట్ మోడ్",
    accent_color:"యాసెంట్ రంగు", accent_color_desc:"మీకు నచ్చిన ఇంటర్ఫేస్ రంగు ఎంచుకోండి",
    display_density:"ప్రదర్శన సాంద్రత", display_density_desc:"UI ఎంత కాంపాక్ట్‌గా కనిపించాలో సర్దుబాటు చేయండి",
    compact:"కాంపాక్ట్", comfortable:"సౌకర్యవంతమైన", spacious:"విశాలమైన",
    language_region:"భాష & ప్రాంతం",
    qr_title:"మీ ఆర్డర్ QR కోడ్", qr_desc:"కస్టమర్లు స్కాన్ చేసి నేరుగా ఆర్డర్లు చేయడానికి ఈ QR షేర్ చేయండి",
    download_qr:"QR డౌన్‌లోడ్", copy_link:"లింక్ కాపీ చేయి", copied:"కాపీ అయింది!",
    qr_settings:"QR కోడ్ సెట్టింగులు", custom_branding:"కస్టమ్ బ్రాండింగ్", custom_branding_desc:"QR కోడ్‌కు మీ లోగో జోడించండి",
    analytics:"QR అనలిటిక్స్", analytics_desc:"మీ QR ఎంత మంది స్కాన్ చేశారో ట్రాక్ చేయండి",
    current_plan:"ప్రస్తుత ప్లాన్", choose_plan:"మీ వ్యాపారానికి సరిపడే ప్లాన్ ఎంచుకోండి",
    most_popular:"అత్యంత ప్రజాదరణ పొందినది", upgrade_to:"అప్‌గ్రేడ్ చేయి", contact_sales:"సేల్స్‌ని సంప్రదించండి",
    support_help:"సహాయం & మద్దతు", documentation:"డాక్యుమెంటేషన్", documentation_desc:"మీ ఖాతా సెటప్ చేయడానికి దశల వారీ గైడ్లు",
    read_docs:"డాక్స్ చదవండి", contact_support:"సహాయం సంప్రదించండి", contact_support_desc:"వ్యక్తిగత సహాయం కోసం మా బృందంతో మాట్లాడండి",
    send_message:"సందేశం పంపండి", community:"కమ్యూనిటీ ఫోరమ్", community_desc:"ఇతర TableTop Leo వినియోగదారుల నుండి సహాయం పొందండి",
    join_community:"కమ్యూనిటీలో చేరండి", system_status:"సిస్టమ్ స్థితి", all_systems:"అన్ని సిస్టమ్లు సాధారణంగా పనిచేస్తున్నాయి",
    danger_zone:"ప్రమాద జోన్", delete_account:"ఖాతా తొలగించు",
    delete_account_desc:"తొలగించిన తర్వాత మీ డేటా, మెనూ ఐటెమ్లు మరియు ఆర్డర్లు శాశ్వతంగా తొలగించబడతాయి.",
    delete_warning:"ఈ చర్య రద్దు చేయలేరు.",
    type_to_confirm:"నిర్ధారించడానికి 'delete my account' అని టైప్ చేయండి",
    cancel:"రద్దు చేయి", save:"మార్పులు సేవ్ చేయి", reset:"రీసెట్", enabled:"సక్రియం", disabled:"నిష్క్రియం",
    select_language:"భాష ఎంచుకోండి", current_language:"ప్రస్తుత భాష",
    language_desc:"మీ అడ్మిన్ డ్యాష్‌బోర్డ్ కోసం భాషను ఎంచుకోండి",
    search_language:"భాషలు వెతకండి...", reset_english:"ఇంగ్లీషుకి రీసెట్ చేయి",
    language_saved:"భాష సేవ్ అయింది!", save_language:"భాష సేవ్ చేయి", all_regions:"అన్ని ప్రాంతాలు",
  },
  da: {
    profile:"Profil", account:"Konto og sikkerhed", notifications:"Notifikationer",
    appearance:"Udseende", language:"Sprog", qr:"QR-kode", plan:"Opgrader plan",
    support:"Support og hjælp", danger:"Farezonen", "customize-menu":"Tilpas menu",
    settings:"Indstillinger",
    profile_picture:"Profilbillede", profile_picture_desc:"Dit kontofoto vist på dashboardet",
    upload_photo:"Upload foto", change_photo:"Skift foto",
    account_details:"Kontooplysninger", account_details_desc:"Dine registrerede kontooplysninger",
    full_name:"Fulde navn", email_address:"E-mailadresse",
    change_password:"Skift adgangskode", change_password_desc:"Brug en stærk adgangskode",
    current_password:"Nuværende adgangskode", new_password:"Ny adgangskode", confirm_new_password:"Bekræft ny adgangskode",
    update_password:"Opdater adgangskode", updating:"Opdaterer...",
    enter_current_password:"Indtast din nuværende adgangskode", min_8_chars:"Min 8 tegn", re_enter_password:"Gentag adgangskode",
    account_information:"Kontooplysninger", account_info_desc:"Dine nuværende loginoplysninger",
    admin_id:"Admin ID", member_since:"Medlem siden", current:"Nuværende",
    security:"Sikkerhed", security_desc:"Ekstra beskyttelseslag for din konto",
    two_factor:"To-faktor-godkendelse", two_factor_on:"2FA er aktiveret", two_factor_off:"Tilføj et ekstra sikkerhedslag",
    trusted_devices:"Betroede enheder", trusted_devices_desc:"Administrer enheder med adgang til din konto",
    active_sessions:"Aktive sessioner", this_device:"Denne enhed", location:"Placering",
    notif_preferences:"Notifikationspræferencer", notif_desc:"Vælg hvad du vil have besked om",
    new_order:"Nye ordreadvarsler", new_order_desc:"Når kunder afgiver nye ordrer",
    order_status:"Ordrestatusopdateringer", order_status_desc:"Når ordrer bekræftes",
    low_stock:"Lav lagerbeholdning", low_stock_desc:"Når menupunktets lager er lavt",
    daily_report:"Daglig rapport", daily_report_desc:"Oversigt over daglige ordrer og omsætning",
    payment_alert:"Betalingsadvarsler", payment_alert_desc:"Når betalinger modtages eller mislykkes",
    customer_review:"Kundeanmeldelser", customer_review_desc:"Når kunder giver feedback",
    promotions:"Kampagner og tilbud", promotions_desc:"Særlige tilbud og kampagneopdateringer",
    system_updates:"Systemopdateringer", system_updates_desc:"Nye funktioner og vedligeholdelsesmeddelelser",
    theme:"Tema", theme_desc:"Skift mellem lys og mørk tilstand",
    dark_mode:"Mørk tilstand", light_mode:"Lys tilstand",
    accent_color:"Accentfarve", accent_color_desc:"Vælg din foretrukne interfacefarve",
    display_density:"Visningstæthed", display_density_desc:"Juster hvor kompakt grænsefladen ser ud",
    compact:"Kompakt", comfortable:"Komfortabel", spacious:"Rummelig",
    language_region:"Sprog og region",
    qr_title:"Din ordre QR-kode", qr_desc:"Del denne QR så kunder kan scanne og afgive ordrer direkte",
    download_qr:"Download QR", copy_link:"Kopiér link", copied:"Kopieret!",
    qr_settings:"QR-kodeindstillinger", custom_branding:"Tilpasset branding", custom_branding_desc:"Tilføj dit logo til QR-koden",
    analytics:"QR-analyse", analytics_desc:"Spor hvor mange kunder der scanner din QR",
    current_plan:"Nuværende plan", choose_plan:"Vælg den plan der passer til din virksomhed",
    most_popular:"Mest populær", upgrade_to:"Opgrader til", contact_sales:"Kontakt salg",
    support_help:"Support og hjælp", documentation:"Dokumentation", documentation_desc:"Trin-for-trin guider",
    read_docs:"Læs docs", contact_support:"Kontakt support", contact_support_desc:"Tal med vores team",
    send_message:"Send besked", community:"Community Forum", community_desc:"Få hjælp fra andre TableTop Leo brugere",
    join_community:"Tilslut community", system_status:"Systemstatus", all_systems:"Alle systemer er driftsikre",
    danger_zone:"Farezonen", delete_account:"Slet konto",
    delete_account_desc:"Når slettet vil alle dine data, menupunkter og ordrer blive permanent fjernet.",
    delete_warning:"Denne handling kan ikke fortrydes.",
    type_to_confirm:"Skriv 'delete my account' for at bekræfte",
    cancel:"Annuller", save:"Gem ændringer", reset:"Nulstil", enabled:"Aktiveret", disabled:"Deaktiveret",
    select_language:"Vælg sprog", current_language:"Nuværende sprog",
    language_desc:"Vælg sproget til dit admin-dashboard",
    search_language:"Søg efter sprog...", reset_english:"Nulstil til engelsk",
    language_saved:"Sprog gemt!", save_language:"Gem sprog", all_regions:"Alle regioner",
  },
  hi: {
    profile:"प्रोफाइल", account:"खाता और सुरक्षा", notifications:"सूचनाएं",
    appearance:"उपस्थिति", language:"भाषा", qr:"QR कोड", plan:"प्लान अपग्रेड करें",
    support:"सहायता", danger:"खतरनाक क्षेत्र", "customize-menu":"मेनू कस्टमाइज़ करें",
    settings:"सेटिंग्स",
    profile_picture:"प्रोफाइल चित्र", profile_picture_desc:"डैशबोर्ड पर दिखाई देने वाली आपकी खाता फोटो",
    upload_photo:"फोटो अपलोड करें", change_photo:"फोटो बदलें",
    account_details:"खाता विवरण", account_details_desc:"आपकी पंजीकृत खाता जानकारी",
    full_name:"पूरा नाम", email_address:"ईमेल पता",
    change_password:"पासवर्ड बदलें", change_password_desc:"अपने खाते को सुरक्षित रखने के लिए मजबूत पासवर्ड उपयोग करें",
    current_password:"वर्तमान पासवर्ड", new_password:"नया पासवर्ड", confirm_new_password:"नया पासवर्ड पुष्टि करें",
    update_password:"पासवर्ड अपडेट करें", updating:"अपडेट हो रहा है...",
    enter_current_password:"वर्तमान पासवर्ड दर्ज करें", min_8_chars:"न्यूनतम 8 अक्षर", re_enter_password:"पासवर्ड दोबारा दर्ज करें",
    account_information:"खाता जानकारी", account_info_desc:"आपके वर्तमान लॉगिन विवरण",
    admin_id:"एडमिन ID", member_since:"सदस्यता से", current:"वर्तमान",
    security:"सुरक्षा", security_desc:"आपके खाते के लिए सुरक्षा की अतिरिक्त परतें",
    two_factor:"दो-कारक प्रमाणीकरण", two_factor_on:"2FA सक्षम है", two_factor_off:"सुरक्षा की अतिरिक्त परत जोड़ें",
    trusted_devices:"विश्वसनीय डिवाइस", trusted_devices_desc:"अपने खाते तक पहुंच वाले डिवाइस प्रबंधित करें",
    active_sessions:"सक्रिय सत्र", this_device:"यह डिवाइस", location:"स्थान",
    notif_preferences:"सूचना प्राथमिकताएं", notif_desc:"चुनें कि आप क्या सूचित करना चाहते हैं",
    new_order:"नए ऑर्डर अलर्ट", new_order_desc:"जब ग्राहक नए ऑर्डर दें",
    order_status:"ऑर्डर स्थिति अपडेट", order_status_desc:"जब ऑर्डर की पुष्टि हो",
    low_stock:"कम स्टॉक अलर्ट", low_stock_desc:"जब मेनू आइटम स्टॉक कम हो",
    daily_report:"दैनिक रिपोर्ट", daily_report_desc:"दैनिक ऑर्डर और राजस्व का सारांश",
    payment_alert:"भुगतान अलर्ट", payment_alert_desc:"जब भुगतान प्राप्त हो या विफल हो",
    customer_review:"ग्राहक समीक्षाएं", customer_review_desc:"जब ग्राहक फीडबैक दें",
    promotions:"प्रचार और ऑफर", promotions_desc:"विशेष डील और प्रचार अपडेट",
    system_updates:"सिस्टम अपडेट", system_updates_desc:"नई सुविधाएं और रखरखाव नोटिस",
    theme:"थीम", theme_desc:"लाइट और डार्क मोड के बीच स्विच करें",
    dark_mode:"डार्क मोड", light_mode:"लाइट मोड",
    accent_color:"एक्सेंट रंग", accent_color_desc:"अपना पसंदीदा इंटरफेस रंग चुनें",
    display_density:"प्रदर्शन घनत्व", display_density_desc:"UI कितना कॉम्पैक्ट दिखे",
    compact:"कॉम्पैक्ट", comfortable:"आरामदायक", spacious:"विशाल",
    language_region:"भाषा और क्षेत्र",
    qr_title:"आपका ऑर्डर QR कोड", qr_desc:"इस QR को शेयर करें ताकि ग्राहक सीधे ऑर्डर दे सकें",
    download_qr:"QR डाउनलोड", copy_link:"लिंक कॉपी करें", copied:"कॉपी हो गया!",
    qr_settings:"QR कोड सेटिंग्स", custom_branding:"कस्टम ब्रांडिंग", custom_branding_desc:"QR कोड में अपना लोगो जोड़ें",
    analytics:"QR एनालिटिक्स", analytics_desc:"ट्रैक करें कितने ग्राहकों ने QR स्कैन किया",
    current_plan:"वर्तमान प्लान", choose_plan:"अपने व्यवसाय के लिए प्लान चुनें",
    most_popular:"सबसे लोकप्रिय", upgrade_to:"अपग्रेड करें", contact_sales:"सेल्स से संपर्क करें",
    support_help:"सहायता और मदद", documentation:"दस्तावेज़ीकरण", documentation_desc:"चरण-दर-चरण गाइड",
    read_docs:"डॉक्स पढ़ें", contact_support:"सहायता से संपर्क करें", contact_support_desc:"व्यक्तिगत मदद के लिए हमारी टीम से बात करें",
    send_message:"संदेश भेजें", community:"कम्युनिटी फोरम", community_desc:"अन्य TableTop Leo उपयोगकर्ताओं से मदद पाएं",
    join_community:"कम्युनिटी जॉइन करें", system_status:"सिस्टम स्थिति", all_systems:"सभी सिस्टम सामान्य रूप से काम कर रहे हैं",
    danger_zone:"खतरनाक क्षेत्र", delete_account:"खाता हटाएं",
    delete_account_desc:"एक बार हटाने के बाद, आपका सारा डेटा, मेनू आइटम और ऑर्डर स्थायी रूप से हटा दिए जाएंगे।",
    delete_warning:"यह क्रिया वापस नहीं की जा सकती।",
    type_to_confirm:"पुष्टि करने के लिए 'delete my account' टाइप करें",
    cancel:"रद्द करें", save:"परिवर्तन सहेजें", reset:"रीसेट", enabled:"सक्रिय", disabled:"निष्क्रिय",
    select_language:"भाषा चुनें", current_language:"वर्तमान भाषा",
    language_desc:"अपने एडमिन डैशबोर्ड के लिए भाषा चुनें",
    search_language:"भाषा खोजें...", reset_english:"अंग्रेज़ी पर रीसेट करें",
    language_saved:"भाषा सहेजी गई!", save_language:"भाषा सहेजें", all_regions:"सभी क्षेत्र",
  },
};

export function LanguageProvider({ children }) {
  const [languageCode, setLangCode] = useState("en");
  const [languageName, setLangName] = useState("English");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.languageCode) { setLangCode(u.languageCode); setLangName(u.languageName || "English"); }
      }
    } catch {}
  }, []);

  const setLanguage = useCallback(async (code, name) => {
    setLangCode(code);
    setLangName(name);
    // Persist in localStorage
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.languageCode = code;
        u.languageName = name;
        localStorage.setItem("ttl_user", JSON.stringify(u));
      }
    } catch {}
    // Save to backend
    try {
      await api.put("/api/admin/language", { languageCode: code, languageName: name });
    } catch {}
  }, []);

  const t = useCallback((key) => {
    const dict = TRANSLATIONS[languageCode] || TRANSLATIONS.en;
    // Support dot-notation: "nav.profile" → dict["profile"] or dict["nav.profile"]
    if (dict[key] !== undefined) return dict[key];
    if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
    // Try the last segment: "nav.profile" → "profile"
    const lastKey = key.includes(".") ? key.split(".").pop() : key;
    return dict[lastKey] || TRANSLATIONS.en[lastKey] || key;
  }, [languageCode]);

  return (
    <LanguageContext.Provider value={{ languageCode, languageName, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;