import React, { useState } from 'react';
import { User, ProduceListing, Language, Screen, UserType } from './types';
import { users, governmentPrices, initialProduceList } from './data/mockData';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerMarketplace } from './components/BuyerMarketplace';
import { AddProduceScreen } from './components/AddProduceScreen';
import { ListingDetailScreen } from './components/ListingDetailScreen';
import { ChatScreen } from './components/ChatScreen';
import { PaymentEscrowScreen } from './components/PaymentEscrowScreen';
import { DeliveryConfirmationScreen } from './components/DeliveryConfirmationScreen';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [produce, setProduce] = useState<ProduceListing[]>(initialProduceList);
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);

  // Handle Login from Welcome screen
  const handleLogin = (role: UserType) => {
    // Select default demo user for role
    const demoUser =
      role === 'farmer'
        ? users.find((u) => u.name === 'NEERAJA') || users.find((u) => u.type === 'farmer') || users[0]
        : users.find((u) => u.name === 'TAMAN RK') || users.find((u) => u.type === 'buyer') || users[0];

    setCurrentUser(demoUser);
    setScreen('onboarding');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedListing(null);
    setChatPartner(null);
    setScreen('welcome');
  };

  // Handle Screen Navigation
  const handleNavigate = (targetScreen: string, listing?: ProduceListing) => {
    if (listing) {
      setSelectedListing(listing);
      // Set chat partner based on current user
      if (currentUser?.type === 'buyer') {
        const farmer = users.find((u) => u.id === listing.farmerId) || users.find((u) => u.type === 'farmer') || users[0];
        setChatPartner(farmer);
      } else {
        const buyer = users.find((u) => u.type === 'buyer') || users[0];
        setChatPartner(buyer);
      }
    }
    setScreen(targetScreen as Screen);
  };

  // Add new produce listing
  const handleAddProduce = (
    newListingData: Omit<ProduceListing, 'id' | 'postedDate' | 'status'>
  ) => {
    const newListing: ProduceListing = {
      ...newListingData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0],
      status: 'available',
    };
    setProduce((prev) => [newListing, ...prev]);
  };

  // Delete produce listing
  const handleDeleteProduce = (id: string) => {
    setProduce((prev) => prev.filter((p) => p.id !== id));
  };

  // Update produce status
  const handleUpdateStatus = (id: string, status: 'available' | 'sold' | 'pending') => {
    setProduce((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  // Farmers list
  const farmers = users.filter((u) => u.type === 'farmer');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">
      {/* Navbar shown when user is logged in and not on welcome screen */}
      {screen !== 'welcome' && (
        <Navbar
          user={currentUser}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          onNavigateHome={() => {
            if (currentUser?.type === 'farmer') {
              setScreen('farmer-dashboard');
            } else {
              setScreen('buyer-marketplace');
            }
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {screen === 'welcome' && (
          <WelcomeScreen
            language={language}
            onLanguageChange={setLanguage}
            onLogin={handleLogin}
          />
        )}

        {screen === 'onboarding' && currentUser && (
          <OnboardingTutorial
            language={language}
            user={currentUser}
            onComplete={() => {
              if (currentUser.type === 'farmer') {
                setScreen('farmer-dashboard');
              } else {
                setScreen('buyer-marketplace');
              }
            }}
            onSkip={() => {
              if (currentUser.type === 'farmer') {
                setScreen('farmer-dashboard');
              } else {
                setScreen('buyer-marketplace');
              }
            }}
          />
        )}

        {screen === 'farmer-dashboard' && currentUser && (
          <FarmerDashboard
            language={language}
            user={currentUser}
            produce={produce.filter((p) => p.farmerId === currentUser.id || p.farmerName === currentUser.name)}
            governmentPrices={governmentPrices}
            onNavigate={handleNavigate}
            onDeleteProduce={handleDeleteProduce}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {screen === 'buyer-marketplace' && currentUser && (
          <BuyerMarketplace
            language={language}
            user={currentUser}
            produce={produce.filter((p) => p.status === 'available')}
            governmentPrices={governmentPrices}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {screen === 'add-produce' && currentUser && (
          <AddProduceScreen
            language={language}
            user={currentUser}
            governmentPrices={governmentPrices}
            onBack={() => setScreen('farmer-dashboard')}
            onAddProduce={handleAddProduce}
          />
        )}

        {screen === 'listing-detail' && currentUser && selectedListing && (
          <ListingDetailScreen
            language={language}
            user={currentUser}
            listing={selectedListing}
            governmentPrices={governmentPrices}
            farmers={farmers}
            onBack={() => {
              if (currentUser.type === 'farmer') {
                setScreen('farmer-dashboard');
              } else {
                setScreen('buyer-marketplace');
              }
            }}
            onNavigate={handleNavigate}
          />
        )}

        {screen === 'chat' && currentUser && selectedListing && (
          <ChatScreen
            language={language}
            user={currentUser}
            partner={chatPartner}
            listing={selectedListing}
            onBack={() => {
              if (currentUser.type === 'farmer') {
                setScreen('farmer-dashboard');
              } else {
                setScreen('buyer-marketplace');
              }
            }}
            onNavigate={handleNavigate}
          />
        )}

        {screen === 'payment-escrow' && currentUser && selectedListing && (
          <PaymentEscrowScreen
            language={language}
            user={currentUser}
            listing={selectedListing}
            onBack={() => setScreen('listing-detail')}
            onNavigate={handleNavigate}
          />
        )}

        {screen === 'delivery-confirmation' && currentUser && selectedListing && (
          <DeliveryConfirmationScreen
            language={language}
            user={currentUser}
            listing={selectedListing}
            onBack={() => setScreen('buyer-marketplace')}
            onComplete={() => setScreen('buyer-marketplace')}
          />
        )}
      </main>
    </div>
  );
}
