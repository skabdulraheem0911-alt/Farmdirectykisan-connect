export type Language = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml';

export type UserType = 'farmer' | 'buyer';

export interface User {
  id: string;
  name: string;
  phone: string;
  type: UserType;
  village: string;
  aadharNumber: string;
  rating: number;
  totalReviews: number;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  cropName: string;
  quantity: number;
  pricePerKg: number;
  negotiable: boolean;
  status: 'available' | 'sold' | 'pending';
  imageUrl: string;
  postedDate: string;
}

export interface GovernmentPrice {
  cropName: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  market: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'offer';
  offerAmount?: number;
}

export type Screen =
  | 'welcome'
  | 'onboarding'
  | 'farmer-dashboard'
  | 'buyer-marketplace'
  | 'add-produce'
  | 'listing-detail'
  | 'chat'
  | 'payment-escrow'
  | 'delivery-confirmation';
