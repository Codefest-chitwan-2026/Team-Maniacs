export type Language = 'en' | 'np';

export const translations = {
  en: {
    // Branding
    appName: "Satark Nepal",
    appNameNp: "सतर्क नेपाल",
    tagline: "Quick Response, Stronger Rescue.",
    taglineNp: "छिटो प्रतिक्रिया, सशक्त उद्धार।",
    motto: "Know the risk. Report the emergency. Help the community.",

    // Navigation
    navHome: "Home",
    navMap: "Live Map",
    navReport: "Report",
    navRelief: "Relief & Volunteers",
    navLeadership: "Leadership",
    navProfile: "Profile",
    navAdmin: "Admin Panel",

    // Emergency Actions
    needHelp: "I NEED HELP",
    reportEmergency: "REPORT AN EMERGENCY",
    sosWhistle: "SOS / Siren",
    emergencyModeActive: "EMERGENCY MODE ACTIVE - High Local Risk Detected",

    // Satark Pulse
    satarkPulseTitle: "SATARK PULSE",
    satarkPulseSubtitle: "Local Risk Indicator Engine",
    riskLow: "LOW RISK",
    riskModerate: "MODERATE RISK",
    riskHigh: "HIGH RISK",
    whyRiskHeading: "Why is risk elevated?",
    updatedMinutesAgo: "Updated just now",

    // Weather
    weatherTitle: "Local Weather Alert",
    temperature: "Temperature",
    rainChance: "Rain",
    windSpeed: "Wind",

    // Alerts
    activeAlerts: "Active Emergency Alerts",
    officialAlert: "OFFICIAL ALERT",
    communityReport: "Community Report",
    verifiedBadge: "VERIFIED",
    unverifiedBadge: "UNVERIFIED",
    viewAllOnMap: "View on Live Map",
    noAlerts: "No active critical emergency alerts in your immediate area.",

    // Categories
    catFlood: "Flood",
    catLandslide: "Landslide",
    catEarthquake: "Earthquake",
    catFire: "Fire",
    catStorm: "Storm",
    catMedical: "Medical Emergency",
    catBuilding: "Building Damage",
    catRoad: "Road Blockage",
    catOther: "Other Emergency",

    // Priorities
    priorityCritical: "Critical",
    priorityUrgent: "Urgent",
    priorityNonCritical: "Non-Critical",

    // Statuses
    statusNew: "NEW",
    statusUnderReview: "UNDER REVIEW",
    statusVerified: "VERIFIED",
    statusResponding: "RESPONDING",
    statusResolved: "RESOLVED",

    // Report Page
    reportPageTitle: "What is happening?",
    selectCategory: "Select Emergency Type",
    locationHeading: "Location",
    useCurrentLocation: "Use My GPS Location",
    locationAcquired: "GPS Location Acquired",
    manualLocation: "Or type location manually",
    descriptionHeading: "Description",
    descriptionPlaceholder: "Describe what is happening, immediate hazards, or people affected...",
    priorityHeading: "Urgency Level",
    mediaHeading: "Attach Media (Photo/Video)",
    uploadMedia: "Upload Photo/Video/Audio",
    submitReport: "SEND EMERGENCY REPORT",
    reportReceived: "Emergency report received successfully!",
    reportIdLabel: "Your Report Reference ID:",
    offlineNotice: "You are currently offline. Report queued locally and will auto-sync when connection restores.",

    // Satark AI & Trust Layer
    satarkAITitle: "Satark AI Analysis",
    satarkAIOffline: "Satark AI is currently offline. Basic heuristic verification rules active.",
    confidenceLabel: "AI Confidence",
    humanReviewReq: "Human review required before escalation.",
    trustLayerTitle: "Report Trust Assessment",
    trustHigh: "HIGH TRUST",
    trustMedium: "MEDIUM TRUST",
    trustLow: "LOW TRUST",
    trustLowNote: "LOW TRUST does not mean false — verification pending.",

    // Map Page
    mapTitle: "Live Disaster Map & Responders",
    filterAll: "All Categories",
    mapLegend: "Pins represent reported emergencies, shelters, and relief requests across Nepal.",
    nearbyShelters: "Nearby Relief Shelters",

    // Relief & Volunteers
    reliefTitle: "Relief & Volunteer Coordination",
    needReliefTab: "Relief Requests",
    volunteerTab: "Volunteers",
    registerVolunteer: "Register as Volunteer",
    iCanHelp: "I CAN HELP",
    peopleAffected: "People Affected",
    currentResponders: "Responders",
    neededStatus: "NEEDED",
    assignedStatus: "ASSIGNED",
    inProgressStatus: "IN PROGRESS",
    completedStatus: "COMPLETED",

    // Satark Points & Leadership
    pointsTitle: "Satark Points Leaderboard",
    pointsSubtitle: "Honoring meaningful citizen and volunteer disaster response contributions",
    leaderboardRank: "Rank",
    volunteerName: "Volunteer",
    pointsEarned: "Satark Points",
    badgeHelper: "Helper",
    badgeResponder: "Responder",
    badgeGuardian: "Guardian",
    badgeHero: "Hero",
    // Rank UI
    pointsLabel: "Satark Points",
    rankLabel: "Rank",
    nextRankLabel: "Next Rank",
    pointsNeededLabel: "Points Needed",
    progressLabel: "Progress",
    maxRankLabel: "Max Rank",
    rankNewcomer: "Newcomer",
    rankHelper: "Helper",
    rankResponder: "Responder",
    rankGuardian: "Guardian",
    rankCommunityLeader: "Community Leader",
    rankSatarkHero: "Satark Hero",
    rankSatarkChampion: "Satark Champion",

    // Profile & Settings
    profileTitle: "Citizen Profile & Settings",
    myReports: "My Submitted Reports",
    myPoints: "My Community Satark Points",
    prepChecklistTitle: "Emergency Preparedness Checklist",
    prep1: "Know your nearest safe elevation / open ground location",
    prep2: "Save local police (100), ambulance (102), and fire (101) contacts",
    prep3: "Keep a emergency kit (Water, Torch, First Aid, Power Bank)",
    prep4: "Avoid sharing unverified disaster rumors or false panic messages",
    langSetting: "Language Preference",

    // Admin
    adminTitle: "Satark Emergency Moderation Control",
    adminReports: "Reports Moderation",
    adminAlerts: "Manage Alerts",
    adminVolunteers: "Volunteers Directory",
    adminRelief: "Relief Requests",
    adminAudit: "System Audit Logs",
    verifyAction: "Verify Report",
    rejectAction: "Mark False",
    escalateAction: "Escalate Priority",
    resolveAction: "Mark Resolved",

    // Demo Banner
    demoNotice: "Demo Environment — Simulated data for demonstration purposes",

    // Common
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    loading: "Loading emergency data...",
  },
  np: {
    // Branding
    appName: "सतर्क नेपाल",
    appNameNp: "Satark Nepal",
    tagline: "छिटो प्रतिक्रिया, सशक्त उद्धार।",
    taglineNp: "Quick Response, Stronger Rescue.",
    motto: "जोखिम जान्नुहोस्। विपद् दर्ता गर्नुहोस्। समुदायलाई सहयोग गर्नुहोस्।",

    // Navigation
    navHome: "गृहपृष्ठ",
    navMap: "प्रत्यक्ष नक्सा",
    navReport: "उजुरी/सहयोग",
    navRelief: "राहत र स्वयंसेवक",
    navLeadership: "नेतृत्व सूची",
    navProfile: "प्रोफाइल",
    navAdmin: "एडमिन प्यानल",

    // Emergency Actions
    needHelp: "मलाई सहयोग चाहियो",
    reportEmergency: "विपद् दर्ता गर्नुहोस्",
    sosWhistle: "SOS / साइरन",
    emergencyModeActive: "आपत्कालीन मोड सक्रिय - उच्च जोखिम क्षेत्र",

    // Satark Pulse
    satarkPulseTitle: "सतर्क पल्स",
    satarkPulseSubtitle: "स्थानीय जोखिम सूचक इन्जिन",
    riskLow: "कम जोखिम",
    riskModerate: "मध्यम जोखिम",
    riskHigh: "उच्च जोखिम",
    whyRiskHeading: "जोखिम उच्च हुनुको कारण:",
    updatedMinutesAgo: "भर्खरै अपडेट गरिएको",

    // Weather
    weatherTitle: "स्थानीय मौसम सूचना",
    temperature: "तापक्रम",
    rainChance: "वर्षाको सम्भावना",
    windSpeed: "हावाको गति",

    // Alerts
    activeAlerts: "सक्रिय विपद् चेतावनीहरू",
    officialAlert: "आधिकारिक चेतावनी",
    communityReport: "सामुदायिक रिपोर्ट",
    verifiedBadge: "प्रमाणित",
    unverifiedBadge: "अप्रमाणित",
    viewAllOnMap: "नक्सामा हेर्नुहोस्",
    noAlerts: "तपाईंको क्षेत्रमा कुनै सक्रिय आपत्कालीन चेतावनी छैन।",

    // Categories
    catFlood: "पहिरो / बाढी",
    catLandslide: "पहिरो",
    catEarthquake: "भूकम्प",
    catFire: "आगलागी",
    catStorm: "हुरीबतास",
    catMedical: "स्वास्थ्य आपत्काल",
    catBuilding: "भवन क्षति",
    catRoad: "सडक अवरोध",
    catOther: "अन्य आपत्काल",

    // Priorities
    priorityCritical: "अति आपत्कालीन",
    priorityUrgent: "जरुरी",
    priorityNonCritical: "साधारण",

    // Statuses
    statusNew: "नयाँ",
    statusUnderReview: "समीक्षाधीन",
    statusVerified: "प्रमाणित",
    statusResponding: "उद्धार टोली परिचालित",
    statusResolved: "समाधान भयो",

    // Report Page
    reportPageTitle: "के घटना घट्यो?",
    selectCategory: "विपद्को प्रकार छान्नुहोस्",
    locationHeading: "स्थान",
    useCurrentLocation: "मेरो GPS स्थान प्रयोग गर्नुहोस्",
    locationAcquired: "GPS स्थान प्राप्त भयो",
    manualLocation: "वा स्थान म्यानुअल रूपमा लेख्नुहोस्",
    descriptionHeading: "विवरण",
    descriptionPlaceholder: "के भयो, कति मानिस प्रभावित छन् र कुन सहयोग चाहिन्छ लेख्नुहोस्...",
    priorityHeading: "प्राथमिकता स्तर",
    mediaHeading: "मिडिया जोड्नुहोस् (फोटो/भिडियो)",
    uploadMedia: "फोटो/भिडियो/अडियो अपलोड",
    submitReport: "रिपोर्ट पठाउनुहोस्",
    reportReceived: "आपत्कालीन रिपोर्ट सफलतापूर्वक प्राप्त भयो!",
    reportIdLabel: "रिपोर्ट आईडी:",
    offlineNotice: "तपाईं अफलाइन हुनुहुन्छ। रिपोर्ट स्थानीय रूपमा सेभ भयो, इन्टरनेट आउनासाथ अटो-सिङ्क हुनेछ।",

    // Satark AI & Trust Layer
    satarkAITitle: "सतर्क AI विश्लेषण",
    satarkAIOffline: "सतर्क AI अहिले अफलाइन छ। आधारभूत नियमहरू लागू।",
    confidenceLabel: "AI विश्वसनीयता",
    humanReviewReq: "मानवीय पुष्टि आवश्यक छ।",
    trustLayerTitle: "विश्वासनीयता मूल्यांकन",
    trustHigh: "उच्च विश्वासनीयता",
    trustMedium: "मध्यम विश्वासनीयता",
    trustLow: "कम विश्वासनीयता",
    trustLowNote: "कम विश्वासनीयताको अर्थ गलत भन्ने होइन।",

    // Map Page
    mapTitle: "प्रत्यक्ष विपद् नक्सा र उद्धारकर्ताहरू",
    filterAll: "सबै वर्गहरू",
    mapLegend: "नक्सामा नेपालभरिका विपद्, आश्रयस्थल र राहत अनुरोधहरू देखाइएको छ।",
    nearbyShelters: "नजिकैका सुरक्षित आश्रयस्थल",

    // Relief & Volunteers
    reliefTitle: "राहत तथा स्वयंसेवक समन्वय",
    needReliefTab: "राहत अनुरोधहरू",
    volunteerTab: "स्वयंसेवक सूची",
    registerVolunteer: "स्वयंसेवक दर्ता",
    iCanHelp: "म सहयोग गर्न चाहन्छु",
    peopleAffected: "प्रभावित मानिसहरू",
    currentResponders: "परिचालित स्वयंसेवक",
    neededStatus: "आवश्यक",
    assignedStatus: "जिम्मेवारी दिइएको",
    inProgressStatus: "काम भइरहेको",
    completedStatus: "सम्पन्न",

    // Satark Points & Leadership
    pointsTitle: "सतर्क पोइन्ट्स नेतृत्व सूची",
    pointsSubtitle: "नागरिक र स्वयंसेवकहरूको विपद् उद्धार योगदानको सम्मान",
    leaderboardRank: "स्थान",
    volunteerName: "स्वयंसेवक",
    pointsEarned: "सतर्क पोइन्ट्स",
    badgeHelper: "सहयोगी (Helper)",
    badgeResponder: "उद्धारकर्ता (Responder)",
    badgeGuardian: "संरक्षक (Guardian)",
    badgeHero: "नायक (Hero)",
    // Rank UI
    pointsLabel: "सतर्क पोइन्ट",
    rankLabel: "स्तर",
    nextRankLabel: "अर्को स्तर",
    pointsNeededLabel: "आवश्यक पोइन्ट",
    progressLabel: "प्रगति",
    maxRankLabel: "अधिकतम स्तर",
    rankNewcomer: "नयाँ प्रयोगकर्ता",
    rankHelper: "सहयोगी",
    rankResponder: "उद्धारकर्ता",
    rankGuardian: "संरक्षक",
    rankCommunityLeader: "समुदाय नेता",
    rankSatarkHero: "सतर्क नायक",
    rankSatarkChampion: "सतर्क च्याम्पियन",

    // Profile & Settings
    profileTitle: "नागरिक प्रोफाइल र सेटिङ्स",
    myReports: "मेरो दर्ता उजुरीहरू",
    myPoints: "मेरो सतर्क पोइन्ट्स",
    prepChecklistTitle: "विपद् पूर्वतयारी चेकलिस्ट",
    prep1: "आफ्नो नजिकको सुरक्षित अग्लो वा खुला ठाउँ थाहा पाउनुहोस्",
    prep2: "प्रहरी (१००), एम्बुलेन्स (१०२), र दमकल (१०१) नम्बर सेभ गर्नुहोस्",
    prep3: "आपत्कालीन झोला तैयार राख्नुहोस् (पानी, टर्च, प्राथमिक उपचार, पावर बैंक)",
    prep4: "अपुष्ट हल्ला वा गलत अफवाह फैलाउनबाट बच्नुहोस्",
    langSetting: "भाषा छनोट",

    // Admin
    adminTitle: "सतर्क आपत्कालीन नियन्त्रण कक्ष (Admin)",
    adminReports: "रिपोर्ट व्यवस्थापन",
    adminAlerts: "चेतावनी व्यवस्थापन",
    adminVolunteers: "स्वयंसेवक सूची",
    adminRelief: "राहत अनुरोध",
    adminAudit: "प्रणाली प्रणाली लग (Audit Logs)",
    verifyAction: "पुष्टि गर्नुहोस्",
    rejectAction: "गलत मार्क गर्नुहोस्",
    escalateAction: "प्राथमिकता बढाउनुहोस्",
    resolveAction: "समाधान भयो मार्क गर्नुहोस्",

    // Demo Banner
    demoNotice: "डेमो वातावरण — प्रदर्शनका लागि सिमुलेट गरिएको तथ्याङ्क",

    // Common
    cancel: "रद्द गर्नुहोस्",
    confirm: "पुष्टि गर्नुहोस्",
    close: "बन्द गर्नुहोस्",
    loading: "आपत्कालीन तथ्याङ्क लोड हुँदैछ...",
  }
};
