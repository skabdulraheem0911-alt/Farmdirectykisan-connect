import React from 'react';
import { User, ProduceListing, Language, GovernmentPrice } from '../types';
import { dashboardTranslations, getTranslatedCropName } from '../data/translations';
import {
  PlusCircle,
  TrendingUp,
  Tag,
  CheckCircle,
  Clock,
  Trash2,
  Calendar,
  AlertCircle,
  Eye,
  IndianRupee,
} from 'lucide-react';

interface FarmerDashboardProps {
  language: Language;
  user: User;
  produce: ProduceListing[];
  governmentPrices: GovernmentPrice[];
  onNavigate: (screen: string, listing?: ProduceListing) => void;
  onDeleteProduce?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'available' | 'sold' | 'pending') => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  language,
  user,
  produce,
  governmentPrices,
  onNavigate,
  onDeleteProduce,
  onUpdateStatus,
}) => {
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const soldItems = produce.filter((p) => p.status === 'sold');
  const thisWeekEarnings = soldItems.reduce((acc, p) => acc + p.quantity * p.pricePerKg, 0);
  const totalEarnings = thisWeekEarnings * 3 + 12500; // Simulated historical total

  const getStatusBadge = (status: ProduceListing['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            {t.available || 'Available'}
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3" />
            {t.sold || 'Sold'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            {t.pending || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-200">
            {language === 'ml' ? 'കർഷക ഡാഷ്‌ബോർഡ്' : 'Farmer Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
            {t.dashboard || 'Farmer Dashboard'}
          </h1>
          <p className="text-green-100 text-sm mt-1">
            {t.welcome || 'Welcome'}, <span className="font-semibold">{user.name}</span> ({user.village})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('add-produce')}
            data-telugu-announce="కొత్త పంట నమోదు బటన్ నొక్కారు."
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-green-800 font-bold hover:bg-green-50 shadow-md cursor-pointer transition-all hover:scale-102"
          >
            <PlusCircle className="w-5 h-5 text-green-600" />
            <span>{t.addProduce || 'Add New Produce'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">
              {t.earnings || 'This Week Earnings'}
            </div>
            <div className="text-2xl font-black text-gray-900 tabular-nums">
              ₹{thisWeekEarnings.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">
              {t.totalEarnings || 'Total Lifetime Earnings'}
            </div>
            <div className="text-2xl font-black text-gray-900 tabular-nums">
              ₹{totalEarnings.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">
              {language === 'ml' ? 'ആകെ ലിസ്റ്റിംഗുകൾ' : 'Total Produce Listed'}
            </div>
            <div className="text-2xl font-black text-gray-900 tabular-nums">
              {produce.length}
            </div>
          </div>
        </div>
      </div>

      {/* APMC Andhra Pradesh Price Benchmark Alert Bar */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ APMC మార్కెట్ ధరలు (లైవ్)'
                : language === 'hi'
                ? 'आंध्र प्रदेश APMC मंडी बेंचमार्क (लाइव)'
                : language === 'ta'
                ? 'ஆந்திரப் பிரதேசம் APMC மண்டி நேரலை விலைகள்'
                : language === 'kn'
                ? 'ಆಂಧ್ರಪ್ರದೇಶ APMC ಮಂಡಿ ಬೆಲೆಗಳು (ಲೈವ್)'
                : language === 'ml'
                ? 'ആന്ധ്രാപ്രദേശ് APMC മണ്ഡി നിരക്കുകൾ (തത്സമയം)'
                : 'Andhra Pradesh APMC Mandi Benchmarks (Live)'}
            </h4>
            <p className="text-xs text-gray-600">
              {language === 'te'
                ? 'మీ పంటలకు సరసమైన ధర పొందడానికి ఆంధ్రప్రదేశ్ APMC లైవ్ ధరలతో సరిపోల్చండి'
                : language === 'hi'
                ? 'अपनी फसलों के लिए अधिकतम मूल्य पाने के लिए आंध्र प्रदेश APMC दरों से तुलना करें'
                : language === 'ta'
                ? 'அதிக வருவாய் பெற ஆந்திரப் பிரதேசம் APMC மண்டி விலைகளுடன் உங்கள் விலையை ஒப்பிடுங்கள்'
                : language === 'kn'
                ? 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಲು ಆಂಧ್ರಪ್ರದೇಶ APMC ಮಂಡಿ ದರಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ'
                : language === 'ml'
                ? 'വിളകൾക്ക് കൂടുതൽ വില ലഭിക്കാൻ ആന്ധ്രാപ്രദേശ് APMC നിരക്കുകളുമായി താരതമ്യം ചെയ്യുക'
                : 'Compare your prices with live Andhra Pradesh APMC rates to maximize revenue and attract buyers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-emerald-800 shrink-0">
          {governmentPrices.slice(0, 3).map((gp) => (
            <span key={gp.cropName} className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200 whitespace-nowrap">
              {getTranslatedCropName(gp.cropName, language)}: ₹{gp.averagePrice}/kg
            </span>
          ))}
        </div>
      </div>

      {/* Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t.myListings || 'My Produce Listings'}
          </h2>
          <span className="text-xs font-medium text-gray-500">
            {produce.length} {language === 'ml' ? 'വിളകൾ' : 'listings'}
          </span>
        </div>

        {produce.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">
              {t.noListings || 'No produce listed yet. Click below to add your first harvest!'}
            </p>
            <button
              onClick={() => onNavigate('add-produce')}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-green-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addProduce || 'Add Produce'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produce.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-green-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.cropName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(item.status)}
                    </div>
                    {item.negotiable && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        {language === 'ml' ? 'വിലപേശാവുന്നത്' : 'Negotiable'}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-base">
                        {getTranslatedCropName(item.cropName, language)}
                      </h3>
                      <div className="text-lg font-black text-green-700 tabular-nums">
                        ₹{item.pricePerKg}
                        <span className="text-xs text-gray-500 font-normal">/{t.kg || 'kg'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{language === 'ml' ? 'ലഭ്യമായ അളവ്' : 'Quantity'}: <strong className="text-gray-800">{item.quantity} kg</strong></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.postedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => onNavigate('listing-detail', item)}
                    data-telugu-announce={`${getTranslatedCropName(item.cropName, language)} పంట వివరాలు చూసే బటన్ నొక్కారు.`}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'ml' ? 'വിശദാംശങ്ങൾ' : 'View Detail'}</span>
                  </button>

                  {item.status === 'available' && onUpdateStatus && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'sold')}
                      data-telugu-announce="పంటను అమ్ముడైనదిగా గుర్తించే బటన్ నొక్కారు."
                      className="py-2 px-3 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title={language === 'ml' ? 'വിറ്റുതീർന്നു എന്ന് അടയാളപ്പെടുത്തുക' : 'Mark as Sold'}
                    >
                      {language === 'ml' ? 'വിറ്റു' : 'Sold'}
                    </button>
                  )}

                  {onDeleteProduce && (
                    <button
                      onClick={() => onDeleteProduce(item.id)}
                      data-telugu-announce="పంట జాబితా తొలగించే బటన్ నొక్కారు."
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title={language === 'ml' ? 'നീക്കം ചെയ്യുക' : 'Delete listing'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
