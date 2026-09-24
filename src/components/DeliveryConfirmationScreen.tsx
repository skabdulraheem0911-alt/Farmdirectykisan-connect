import React, { useState } from 'react';
import { User, ProduceListing, Language } from '../types';
import { deliveryTranslations, getTranslatedCropName, getTranslatedVillageName, getTranslatedUserName } from '../data/translations';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Star,
  ShieldCheck,
  Package,
  Award,
  LockOpen,
  MessageSquare,
  ThumbsUp,
  MapPin,
} from 'lucide-react';

interface DeliveryConfirmationScreenProps {
  language: Language;
  user: User;
  listing: ProduceListing;
  onBack: () => void;
  onComplete: () => void;
}

export const DeliveryConfirmationScreen: React.FC<DeliveryConfirmationScreenProps> = ({
  language,
  user,
  listing,
  onBack,
  onComplete,
}) => {
  const [deliveryOtp, setDeliveryOtp] = useState('5821');
  const [qualityInspected, setQualityInspected] = useState(true);
  const [isReleased, setIsReleased] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const t = deliveryTranslations[language] || deliveryTranslations.en;

  const handleReleasePayment = () => {
    setIsReleased(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {t.delivery || 'Delivery & Escrow Release'}
          </h1>
          <p className="text-xs text-gray-500">
            {t.verifyDelivery || 'Inspect received produce and release funds to farmer'}
          </p>
        </div>
      </div>

      {/* Delivery Tracking Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-green-800">
          {language === 'ml' ? 'ഡെലിവറി സ്റ്റാറ്റസ്' : 'Live Shipment Tracking'}
        </h2>

        <div className="space-y-4 pt-1">
          {[
            {
              title: language === 'ml' ? 'ഓർഡർ സ്വീകരിച്ചു & എസ്ക്രോ ലോക്ക് ചെയ്തു' : 'Order Placed & Escrow Funded',
              desc: 'Funds safely held in escrow account',
              done: true,
            },
            {
              title: language === 'ml' ? 'ഫാമിൽ നിന്നും വിളവെടുത്ത് പാക്ക് ചെയ്തു' : 'Harvested & Packed at Farm',
              desc: `${listing.farmerVillage} farm dispatch`,
              done: true,
            },
            {
              title: language === 'ml' ? 'വാഹനത്തിൽ പുറപ്പെട്ടു' : 'Direct Transport in Transit',
              desc: 'Safe temperature-controlled farm transit',
              done: true,
            },
            {
              title: language === 'ml' ? 'നിങ്ങളുടെ കേന്ദ്രത്തിൽ എത്തിച്ചേർന്നു' : 'Arrived at Buyer Location',
              desc: 'Awaiting your physical quality inspection',
              done: true,
              active: !isReleased,
            },
          ].map((item, idx, arr) => (
            <div key={idx} className="flex items-start gap-3 relative">
              {idx < arr.length - 1 && (
                <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-green-200" />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  item.done
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-900">{item.title}</div>
                <div className="text-[11px] text-gray-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isReleased ? (
        /* Step 1: Inspection & Escrow Release */
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-green-800">
            {language === 'ml' ? 'ഗുണനിലവാരം പരിശോധിച്ചു പണം റിലീസ് ചെയ്യുക' : 'Quality Inspection & Handover'}
          </h2>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'ഉത്പന്നം' : 'Harvest'}:</span>
              <span className="font-bold text-gray-900">{getTranslatedCropName(listing.cropName, language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'കർഷകൻ' : 'Farmer'}:</span>
              <span className="font-bold text-gray-900">{getTranslatedUserName(listing.farmerName, language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'ഫാം ലൊക്കേഷൻ' : 'Farm Origin'}:</span>
              <span className="text-gray-700">{getTranslatedVillageName(listing.farmerVillage, language)}</span>
            </div>
          </div>

          {/* Quality checklist */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-green-200 bg-green-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={qualityInspected}
              onChange={(e) => setQualityInspected(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-green-600 focus:ring-green-500"
            />
            <div className="text-xs">
              <div className="font-bold text-green-950">
                {language === 'ml' ? 'വിളകളുടെ ഗുണനിലവാരവും അളവും പരിശോധിച്ചു' : 'I have inspected the fresh produce quality & weight'}
              </div>
              <div className="text-green-800/80 text-[11px] mt-0.5">
                {language === 'ml'
                  ? 'ഉത്പന്നങ്ങൾ തൃപ്തികരമാണ്. കർഷകൻ്റെ അക്കൗണ്ടിലേക്ക് പണം റിലീസ് ചെയ്യാൻ സമ്മതിക്കുന്നു.'
                  : 'Produce matches description and weight standards. Authorizing release of escrow payment.'}
              </div>
            </div>
          </label>

          {/* Handover OTP Verification */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {language === 'ml' ? 'ഡെലിവറി ഹാൻഡ്ഓവർ കോഡ്' : 'Delivery Handover Code (OTP)'}
            </label>
            <input
              type="text"
              value={deliveryOtp}
              onChange={(e) => setDeliveryOtp(e.target.value)}
              className="w-full h-11 px-3 text-center tracking-widest font-mono font-bold text-base rounded-xl border border-gray-200 focus:border-green-500 text-gray-900"
            />
          </div>

          <button
            onClick={handleReleasePayment}
            disabled={!qualityInspected}
            data-telugu-announce="డెలివరీ నిర్ధారణ చేసి రైతుకు ఎస్క్రో చెల్లింపు విడుదల చేసే బటన్ నొక్కారు."
            className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
          >
            <LockOpen className="w-5 h-5" />
            <span>{t.releasePayment || 'Confirm Delivery & Release Escrow Payment'}</span>
          </button>
        </div>
      ) : !isReviewSubmitted ? (
        /* Step 2: Rate Farmer & Review */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 border border-green-200 shadow-md space-y-5"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ml' ? 'പണം വിജയകരമായി കൈമാറി!' : 'Payment Released to Farmer!'}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'ml'
                ? 'നിങ്ങളുടെ റേറ്റിംഗ് മറ്റ് വാങ്ങുന്നവർക്ക് സഹായകരമാകും'
                : `How was your experience with ${listing.farmerName}?`}
            </p>
          </div>

          {/* Star selector */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                data-telugu-announce={`${star} నక్షత్రాల రేటింగ్ ఇచ్చారు.`}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === 'ml' ? 'ഫീഡ്‌ബാക്ക് അഭിപ്രായം' : 'Review & Comments'}
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={
                  language === 'ml'
                    ? 'പച്ചക്കറികൾ വളരെ പുതിയതായിരുന്നു, കൃത്യസമയത്ത് എത്തിച്ചു...'
                    : 'Extremely fresh produce, well-packaged and delivered on time!'
                }
                className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              data-telugu-announce="రైతు అనుభవ రివ్యూ సమర్పించే బటన్ నొక్కారు."
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all"
            >
              {language === 'ml' ? 'റിവ്യൂ സമർപ്പിക്കുക' : 'Submit Farmer Review'}
            </button>
          </form>
        </motion.div>
      ) : (
        /* Step 3: Finished */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-green-200 shadow-xl text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <ThumbsUp className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            {language === 'ml' ? 'ഇടപാട് വിജയകരമായി പൂർത്തിയായി!' : 'Transaction Completed!'}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'ఫార్మ్‌డైరెక్ట్ ద్వారా ఆంధ్రప్రదేశ్ రైతులకు నేరుగా మద్దతు ఇచ్చినందుకు ధన్యవాదాలు.'
              : language === 'hi'
              ? 'फार्मडायरेक्ट के माध्यम से आंध्र प्रदेश के किसानों का सीधे समर्थन करने के लिए धन्यवाद।'
              : language === 'ta'
              ? 'ஃபார்ம்டைரக்ட் மூலம் ஆந்திரப் பிரதேச விவசாயிகளுக்கு நேரடியாக ஆதரவளித்தமைக்கு நன்றி.'
              : language === 'kn'
              ? 'ಫಾರ್ಮ್‌ಡೈರೆಕ್ಟ್ ಮೂಲಕ ಆಂಧ್ರಪ್ರದೇಶದ ರೈತರಿಗೆ ನೇರವಾಗಿ ಬೆಂಬಲ ನೀಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.'
              : language === 'ml'
              ? 'ഫാംഡയറക്റ്റ് വഴി ആന്ധ്രാപ്രദേശ് കർഷകരുമായി നേരിട്ടുള്ള വിപണി ബന്ധം സ്ഥാപിച്ചതിന് നന്ദി.'
              : 'Thank you for supporting Andhra Pradesh farmers directly on FarmDirect and championing fair agricultural trade.'}
          </p>

          <button
            onClick={onComplete}
            data-telugu-announce="మార్కెట్‌ప్లేస్‌కు తిరిగి వెళ్లే బటన్ నొక్కారు."
            className="w-full h-13 bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm rounded-2xl shadow-lg cursor-pointer transition-all"
          >
            {language === 'ml' ? 'മാർക്കറ്റ്പ്ലേസിലേക്ക് മടങ്ങുക' : 'Back to Farm Marketplace'}
          </button>
        </motion.div>
      )}
    </div>
  );
};
