import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Single Photo Frame',
    description: 'A timeless frame that turns your favorite memory into wall art. Perfect for birthdays, anniversaries, and housewarming gifts. Crafted with premium materials for a lasting keepsake.',
    basePrice: 599,
    type: 'single',
    sizes: [
      { label: '6" × 8"', value: '6x8', price: 599 },
      { label: '8" × 10"', value: '8x10', price: 799 },
      { label: '12" × 16"', value: '12x16', price: 1199 },
    ],
    materials: [
      { label: 'Walnut Wood', value: 'wood-walnut', priceAdder: 0, color: '#5C3D2E' },
      { label: 'Oak Wood', value: 'wood-oak', priceAdder: 0, color: '#A67C52' },
      { label: 'White Wood', value: 'wood-white', priceAdder: 0, color: '#F5F0EB' },
      { label: 'Matte Black', value: 'metal-black', priceAdder: 100, color: '#1A1A1A' },
      { label: 'Gold Metal', value: 'metal-gold', priceAdder: 150, color: '#C9A84C' },
      { label: 'Silver Metal', value: 'metal-silver', priceAdder: 100, color: '#9E9E9E' },
    ],
    images: ['/frames/single-walnut.jpg'],
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 247,
    occasion: ['birthday', 'anniversary', 'housewarming', 'general'],
    photoSlots: 1,
    featured: true,
  },
  {
    id: '2',
    name: '3-Photo Collage Frame',
    description: 'Tell a story with three of your best moments in one beautiful frame. Great for couples and family gifts. Choose from multiple layout options.',
    basePrice: 899,
    type: 'collage-3',
    sizes: [
      { label: '8" × 10"', value: '8x10', price: 899 },
      { label: '12" × 16"', value: '12x16', price: 1299 },
    ],
    materials: [
      { label: 'Walnut Wood', value: 'wood-walnut', priceAdder: 0, color: '#5C3D2E' },
      { label: 'Oak Wood', value: 'wood-oak', priceAdder: 0, color: '#A67C52' },
      { label: 'White Wood', value: 'wood-white', priceAdder: 0, color: '#F5F0EB' },
      { label: 'Matte Black', value: 'metal-black', priceAdder: 100, color: '#1A1A1A' },
      { label: 'Gold Metal', value: 'metal-gold', priceAdder: 150, color: '#C9A84C' },
    ],
    images: ['/frames/collage3-walnut.jpg'],
    badge: 'Popular',
    rating: 4.7,
    reviewCount: 183,
    occasion: ['anniversary', 'couples', 'family', 'birthday'],
    photoSlots: 3,
    featured: true,
  },
  {
    id: '3',
    name: 'Couple Name Frame',
    description: 'A romantic frame with your photo and personalized names. The perfect wedding or anniversary gift that they will treasure forever.',
    basePrice: 1199,
    type: 'couple',
    sizes: [
      { label: '8" × 10"', value: '8x10', price: 1199 },
      { label: '12" × 16"', value: '12x16', price: 1599 },
    ],
    materials: [
      { label: 'Walnut Wood', value: 'wood-walnut', priceAdder: 0, color: '#5C3D2E' },
      { label: 'Gold Metal', value: 'metal-gold', priceAdder: 150, color: '#C9A84C' },
      { label: 'Silver Metal', value: 'metal-silver', priceAdder: 100, color: '#9E9E9E' },
    ],
    images: ['/frames/couple-gold.jpg'],
    badge: 'Trending',
    rating: 4.9,
    reviewCount: 312,
    occasion: ['anniversary', 'wedding', 'couples', 'valentines'],
    photoSlots: 1,
    featured: true,
  },
  {
    id: '4',
    name: 'LED Glow Photo Frame',
    description: 'A magical glowing frame with warm LED backlighting. Makes any photo look stunning day and night. USB powered with adjustable brightness.',
    basePrice: 1499,
    type: 'led',
    sizes: [
      { label: '8" × 10"', value: '8x10', price: 1499 },
      { label: '12" × 16"', value: '12x16', price: 1999 },
    ],
    materials: [
      { label: 'Matte Black', value: 'metal-black', priceAdder: 0, color: '#1A1A1A' },
      { label: 'Silver Metal', value: 'metal-silver', priceAdder: 0, color: '#9E9E9E' },
    ],
    images: ['/frames/led-black.jpg'],
    badge: 'New',
    rating: 4.6,
    reviewCount: 89,
    occasion: ['birthday', 'anniversary', 'housewarming', 'general'],
    photoSlots: 1,
    featured: false,
  },
  {
    id: '5',
    name: '5-Photo Collage Frame',
    description: 'Create a stunning wall display with 5 of your most cherished photos. A showstopper for any living room or bedroom wall.',
    basePrice: 1299,
    type: 'collage-5',
    sizes: [
      { label: '12" × 16"', value: '12x16', price: 1299 },
    ],
    materials: [
      { label: 'Walnut Wood', value: 'wood-walnut', priceAdder: 0, color: '#5C3D2E' },
      { label: 'White Wood', value: 'wood-white', priceAdder: 0, color: '#F5F0EB' },
      { label: 'Gold Metal', value: 'metal-gold', priceAdder: 150, color: '#C9A84C' },
    ],
    images: ['/frames/collage5.jpg'],
    badge: undefined,
    rating: 4.5,
    reviewCount: 76,
    occasion: ['family', 'housewarming', 'general'],
    photoSlots: 5,
    featured: false,
  },
  {
    id: '6',
    name: 'Desk Photo Frame',
    description: 'A sleek desk frame for your workspace or bedside table. Show off your favorite memory wherever you are.',
    basePrice: 449,
    type: 'desk',
    sizes: [
      { label: '6" × 8"', value: '6x8', price: 449 },
      { label: '8" × 10"', value: '8x10', price: 599 },
    ],
    materials: [
      { label: 'Walnut Wood', value: 'wood-walnut', priceAdder: 0, color: '#5C3D2E' },
      { label: 'Oak Wood', value: 'wood-oak', priceAdder: 0, color: '#A67C52' },
      { label: 'Matte Black', value: 'metal-black', priceAdder: 50, color: '#1A1A1A' },
      { label: 'Gold Metal', value: 'metal-gold', priceAdder: 100, color: '#C9A84C' },
    ],
    images: ['/frames/desk-oak.jpg'],
    badge: undefined,
    rating: 4.4,
    reviewCount: 134,
    occasion: ['birthday', 'general', 'corporate'],
    photoSlots: 1,
    featured: false,
  },
];

export const MOCK_REVIEWS = [
  {
    id: '1',
    productId: '1',
    userId: 'u1',
    userName: 'Priya S.',
    rating: 5,
    comment: 'Absolutely beautiful frame! The quality exceeded my expectations. My mother cried when she saw it — best gift ever!',
    photoUrl: undefined,
    createdAt: '2025-06-10',
  },
  {
    id: '2',
    productId: '1',
    userId: 'u2',
    userName: 'Rahul M.',
    rating: 5,
    comment: 'Ordered for my anniversary. The walnut finish looks premium and the print quality is stunning. Delivered in 4 days!',
    photoUrl: undefined,
    createdAt: '2025-06-05',
  },
  {
    id: '3',
    productId: '1',
    userId: 'u3',
    userName: 'Ananya K.',
    rating: 4,
    comment: 'Good quality frame, packaging was very secure. The customization tool is easy to use. Would recommend!',
    photoUrl: undefined,
    createdAt: '2025-05-28',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.featured);
}

export function getProductsByOccasion(occasion: string): Product[] {
  return PRODUCTS.filter(p => p.occasion.includes(occasion));
}
