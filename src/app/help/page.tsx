"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { ChevronDown, FileText, AlertTriangle, Headphones } from 'lucide-react';

const FAQ_ITEMS = (lang: string) => [
  {
    q: lang === 'np' ? 'के हो Satark Points?' : 'What are Satark Points?',
    a: lang === 'np' ? 'Satark Points तपाईँको योगदान मापन गर्छ — रिपोर्ट, स्वयंसेवा र पुष्टि गरिएका कार्यहरूका लागि अंक।' : 'Satark Points measure your contributions — points for reports, volunteering and verified actions.'
  },
  {
    q: lang === 'np' ? 'कसरी आपतकालीन रिपोर्ट गर्ने?' : 'How to report an emergency?',
    a: lang === 'np' ? 'SOS बटन प्रयोग गर्नुहोस् वा रिपोर्ट पठाउन "Report" सेक्शनमा जानुहोस्।' : 'Use the SOS button or go to the Report section to submit an emergency.'
  },
  {
    q: lang === 'np' ? 'नक्सा कसरी प्रयोग गर्ने?' : 'How to use the Live Map?',
    a: lang === 'np' ? 'नक्सामा नजिकको रिपोर्टहरू र अपडेटहरू हेर्नुहोस्; फिल्टर प्रयोग गरेर प्रकार छान्नुहोस्।' : 'View nearby reports and updates; use filters to narrow by type.'
  },
  {
    q: lang === 'np' ? 'म कसरी स्वयंसेवक बन्न सक्छु?' : 'How do I become a volunteer?',
    a: lang === 'np' ? 'Leadership page वा Volunteer अनुभागमा आवेदन पठाउनुहोस्।' : 'Apply via the Leadership or Volunteer section.'
  },
  {
    q: lang === 'np' ? 'Satark AI के गर्छ?' : 'How does Satark AI work?',
    a: lang === 'np' ? 'AI रिपोर्टमा संलग्न मीडिया र पाठ विश्लेषण गरेर प्राथमिकता र विश्वास स्तर सुझाव गर्छ।' : 'AI analyses media and text in reports to suggest priority and trust levels.'
  }
];

export default function HelpPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">{language === 'np' ? 'मद्दत & नीतिहरू' : 'Help & Policy'}</h2>
        <p className="text-sm text-slate-400 mt-1">{language === 'np' ? 'Satark Nepal प्रयोग गर्ने मार्गदर्शन र मुख्य नीति' : 'Guidance for using Satark Nepal and important policies'}</p>

        {/* Help & Support */}
        <div className="mt-6">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><Headphones className="w-4 h-4 text-amber-400" />{language === 'np' ? 'मद्दत र समर्थन' : 'Help & Support'}</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="#faqs" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">❓ {language === 'np' ? 'सामान्य प्रश्न' : 'Frequently Asked Questions'}</Link>
            <Link href="#report" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">🚨 {language === 'np' ? 'कसरी रिपोर्ट गर्ने' : 'How to Report an Emergency'}</Link>
            <Link href="#map" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">🗺️ {language === 'np' ? 'नक्सा प्रयोग' : 'How to Use Live Map'}</Link>
            <Link href="#volunteer" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">🤝 {language === 'np' ? 'स्वयंसेवा कसरी गर्ने' : 'How to Become a Volunteer'}</Link>
            <Link href="#points" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">🏆 {language === 'np' ? 'Satark Points' : 'How Satark Points Work'}</Link>
            <Link href="#ai" className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-sm">🤖 {language === 'np' ? 'Satark AI' : 'How Satark AI Works'}</Link>
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="mt-6">
          <h3 className="font-bold text-white text-sm">{language === 'np' ? 'सामान्य प्रश्न (FAQ)' : 'Frequently Asked Questions'}</h3>
          <div className="mt-3 space-y-2">
            {FAQ_ITEMS(language).map((f, i) => (
              <div key={i} className="bg-navy-950 rounded-xl border border-slate-800 overflow-hidden">
                <button onClick={() => toggle(i)} className="w-full text-left p-3 flex items-center justify-between">
                  <div className="text-sm text-white">{f.q}</div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && <div className="p-3 text-sm text-slate-300 border-t border-slate-800">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Report & Safety Guidelines */}
        <div className="mt-6">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400" />{language === 'np' ? 'रिपोर्ट र सुरक्षा दिशानिर्देश' : 'Report & Safety Guidelines'}</h3>
          <ul className="mt-3 list-disc ml-5 text-sm text-slate-300 space-y-1">
            <li>{language === 'np' ? 'कृपया केवल वास्तविक आपतकालीन रिपोर्ट मात्र पठाउनुहोस्।' : 'Please submit only genuine emergency or safety reports.'}</li>
            <li>{language === 'np' ? 'झूठा रिपोर्ट नगर्नुहोस् वा गलत जानकारी नदिनुहोस्।' : 'Do not submit false reports or intentionally misleading information.'}</li>
            <li>{language === 'np' ? 'अनसत्य दाबी वा अफवाहहरू साझा नगर्नुहोस्।' : 'Do not share unverified disaster rumors.'}</li>
            <li>{language === 'np' ? 'अन्य नागरिकहरूको गोपनीयताको सम्मान गर्नुहोस्।' : 'Respect other citizens’ privacy.'}</li>
            <li>{language === 'np' ? 'SOS केवल वास्तविक आपतकालीनका लागि प्रयोग गर्नुहोस्।' : 'Use the SOS feature only for genuine emergencies.'}</li>
          </ul>
        </div>

        {/* Policies */}
        <div className="mt-6">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" />{language === 'np' ? 'नीति' : 'Policies'}</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/policies/privacy" className="p-3 rounded-xl bg-navy-950 border border-slate-800">{language === 'np' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Link>
            <Link href="/policies/terms" className="p-3 rounded-xl bg-navy-950 border border-slate-800">{language === 'np' ? 'सेवा शर्तहरू' : 'Terms of Service'}</Link>
            <Link href="/policies/community-guidelines" className="p-3 rounded-xl bg-navy-950 border border-slate-800">{language === 'np' ? 'समुदाय दिशानिर्देश' : 'Community Guidelines'}</Link>
            <Link href="/policies/disclaimer" className="p-3 rounded-xl bg-navy-950 border border-slate-800">{language === 'np' ? 'आपतकालीन अस्वीकरण' : 'Emergency Disclaimer'}</Link>
            <Link href="/policies/data-usage" className="p-3 rounded-xl bg-navy-950 border border-slate-800">{language === 'np' ? 'डेटा र स्थान प्रयोग' : 'Data & Location Usage'}</Link>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="mt-6">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><Headphones className="w-4 h-4 text-amber-400" />{language === 'np' ? 'सम्पर्क र समर्थन' : 'Contact & Support'}</h3>
          <div className="mt-3 p-3 bg-navy-950 rounded-xl border border-slate-800">
            <div className="text-sm text-slate-300">{language === 'np' ? 'समर्थनका लागि हामीलाई इमेल गर्नुहोस्:' : 'Email us for support:'} <a href="mailto:support@satark.np" className="text-amber-400">support@satark.np</a></div>
            <div className="mt-3">
              <Link href="/support/contact" className="inline-block help-btn font-bold">{language === 'np' ? 'मद्धत चाहिन्छ? सतर्क नेपाल समर्थनमा सम्पर्क गर्नुहोस् →' : 'Need Help? Contact Satark Nepal Support →'}</Link>
            </div>
            <div className="mt-3 text-xs text-slate-400">App version: 1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}