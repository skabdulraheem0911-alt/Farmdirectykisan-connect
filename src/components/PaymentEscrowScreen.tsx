import React, { useState } from 'react';
import { User, ProduceListing, Language } from '../types';
import { escrowTranslations, getTranslatedCropName } from '../data/translations';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  Building,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Truck,
} from 'lucide-react';

interface PaymentEscrowScreenProps {
  language: Language;
  user: User;
  listing: ProduceListing;
  onBack: () => void;
  onNavigate: (screen: string, listing: ProduceListing) => void;
}

export const PaymentEscrowScreen: React.FC<PaymentEscrowScreenProps> = ({
  language,
  user,
  listing,
  onBack,
  onNavigate,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('buyer@okhdfcbank');
  const [aadharNumber, setAadharNumber] = useState(user.aadharNumber || '3456-7890-1234');
  const [isAadharVerified, setIsAadharVerified] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(Math.min(100, listing.quantity));

  const t = escrowTranslations[language] || escrowTranslations.en;
  const totalAmount = orderQuantity * listing.pricePerKg;

  const handlePayAndLock = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-green-200 shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full">
              {language === 'ml' ? 'എസ്ക്രോയിൽ ലോക്ക് ചെയ്തു' : 'Payment Locked in Escrow'}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">
              {language === 'ml' ? 'ഓർഡർ സ്ഥിരീകരിച്ചു!' : 'Order Placed & Escrow Secured!'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              ₹{totalAmount.toLocaleString()} {language === 'ml' ? 'എസ്ക്രോ അക്കൗണ്ടിൽ സുരക്ഷിതമായി സൂക്ഷിച്ചിരിക്കുന്നു.' : 'is held safely in escrow. Farmer will now prepare your harvest for delivery.'}
            </p>
          </div>

          {/* Details breakdown */}
          <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 text-left border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'ഇടപാട് ഐ.ഡി' : 'Transaction ID'}:</span>
              <span className="font-mono font-bold text-gray-800">TXN-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'വിള' : 'Produce'}:</span>
              <span className="font-semibold text-gray-800">{getTranslatedCropName(listing.cropName, language)} ({orderQuantity} kg)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === 'ml' ? 'കർഷകൻ' : 'Farmer'}:</span>
              <span className="font-semibold text-gray-800">{listing.farmerName} ({listing.farmerVillage})</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900 text-sm">
              <span>{language === 'ml' ? 'ആകെ തുക' : 'Total Escrow Amount'}:</span>
              <span className="text-green-700">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('delivery-confirmation', listing)}
            data-telugu-announce="డెలివరీ స్థితిని ట్రాక్ చేసే బటన్ నొక్కారు."
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
          >
            <Truck className="w-5 h-5" />
            <span>{language === 'ml' ? 'ഡെലിവറി സ്റ്റാറ്റസ് കാണുക' : 'Track Delivery & Inspect'}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          data-telugu-announce="వెనుకకు వెళ్లే బటన్ నొక్కారు."
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {t.payment || 'Secure Escrow Payment'}
          </h1>
          <p className="text-xs text-gray-500">
            {t.escrowDesc || 'Your funds remain protected in escrow until you inspect and verify delivery'}
          </p>
        </div>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-3xl p-5 shadow-sm flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-green-200" />
        </div>
        <div className="text-xs leading-relaxed">
          <div className="font-extrabold text-sm mb-0.5">
            {language === 'ml' ? 'പൂർണ്ണ സുരക്ഷിത എസ്ക്രോ സംവിധാനം' : 'RBI-Compliant Buyer & Farmer Escrow Guarantee'}
          </div>
          <div className="text-green-100">
            {language === 'ml'
              ? 'നിങ്ങൾ നൽകുന്ന തുക കർഷകന് ഉടൻ കൈമാറില്ല. ഉത്പന്നങ്ങൾ നിങ്ങളുടെ കൈകളിൽ എത്തി ഗുണനിലവാരം ഉറപ്പുവരുത്തിയ ശേഷം ഒ.ടി.പി നൽകിയാൽ മാത്രമേ പണം റിലീസ് ആകൂ.'
              : 'Payment is securely held in an institutional escrow account. The farmer receives funds only after you receive, inspect, and approve produce delivery.'}
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-green-800">
          {t.orderSummary || 'Order Summary'}
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-500">{t.crop || 'Crop'}:</span>
            <span className="font-bold text-gray-900">
              {getTranslatedCropName(listing.cropName, language)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-500">{t.pricePerKg || 'Price per kg'}:</span>
            <span className="font-bold text-gray-900 tabular-nums">₹{listing.pricePerKg}</span>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-500">{t.quantity || 'Purchase Quantity (kg)'}:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={listing.quantity}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.min(listing.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24 h-9 px-2 text-right border border-gray-300 rounded-lg font-bold text-sm"
              />
              <span className="text-xs text-gray-400">/ {listing.quantity} kg max</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-base font-extrabold text-gray-900">
            <span>{t.totalAmount || 'Total Escrow Amount'}:</span>
            <span className="text-2xl font-black text-green-700 tabular-nums">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-green-800">
          {language === 'ml' ? 'പേയ്‌മെന്റ് രീതി തിരഞ്ഞെടുക്കുക' : 'Select Payment Method'}
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            data-telugu-announce="యూపీఐ మరియు గూగుల్ పే చెల్లింపు పద్ధతి ఎంచుకున్నారు."
            className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === 'upi'
                ? 'border-green-600 bg-green-50/70 text-green-900 font-bold'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Smartphone className="w-5 h-5 text-green-600" />
            <span className="text-xs">UPI / GPay</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            data-telugu-announce="డెబిట్ లేదా క్రెడిట్ కార్డు చెల్లింపు పద్ధతి ఎంచుకున్నారు."
            className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === 'card'
                ? 'border-green-600 bg-green-50/70 text-green-900 font-bold'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="text-xs">Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('netbanking')}
            data-telugu-announce="నెట్ బ్యాంకింగ్ చెల్లింపు పద్ధతి ఎంచుకున్నారు."
            className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === 'netbanking'
                ? 'border-green-600 bg-green-50/70 text-green-900 font-bold'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Building className="w-5 h-5 text-green-600" />
            <span className="text-xs">Net Banking</span>
          </button>
        </div>

        {paymentMethod === 'upi' && (
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-700">UPI ID / VPA</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@okhdfcbank"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 font-medium text-sm text-gray-900 outline-none focus:border-green-500"
            />
            <p className="text-[11px] text-gray-400">
              Supports Google Pay, PhonePe, Paytm, BHIM, and all Indian banks
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-3 pt-2">
            <input
              type="text"
              placeholder="Card Number (XXXX XXXX XXXX XXXX)"
              defaultValue="4532 •••• •••• 8912"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 font-mono text-sm text-gray-900"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                defaultValue="12/28"
                className="h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-900"
              />
              <input
                type="password"
                placeholder="CVV"
                defaultValue="888"
                maxLength={3}
                className="h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-900"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'netbanking' && (
          <div className="pt-2">
            <select className="w-full h-11 px-3 rounded-xl border border-gray-200 font-medium text-sm text-gray-900 cursor-pointer">
              <option>Kerala Bank (Kerala State Co-operative Bank)</option>
              <option>State Bank of India (SBI)</option>
              <option>Federal Bank</option>
              <option>Canara Bank</option>
              <option>HDFC Bank</option>
            </select>
          </div>
        )}
      </div>

      {/* Pay & Lock Button */}
      <button
        onClick={handlePayAndLock}
        disabled={isProcessing}
        data-telugu-announce="ఎస్క్రో ఖాతాలో చెల్లింపు చేసి నిధులను భద్రపరిచే బటన్ నొక్కారు."
        className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{language === 'ml' ? 'എസ്ക്രോയിൽ പ്രോസസ്സ് ചെയ്യുന്നു...' : 'Locking Funds in Escrow...'}</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>
              {language === 'ml' ? 'പണം നൽകി എസ്ക്രോയിൽ ലോക്ക് ചെയ്യുക' : `Pay ₹${totalAmount.toLocaleString()} & Lock in Escrow`}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
