import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FrameMaterial, FrameSize } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMaterialColor(material: FrameMaterial): string {
  const colors: Record<FrameMaterial, string> = {
    'wood-walnut': '#5C3D2E',
    'wood-oak':    '#A67C52',
    'wood-white':  '#F5F0EB',
    'metal-black': '#1A1A1A',
    'metal-gold':  '#C9A84C',
    'metal-silver':'#9E9E9E',
    'acrylic':     '#E8F4F8',
  };
  return colors[material];
}

export function getMaterialLabel(material: FrameMaterial): string {
  const labels: Record<FrameMaterial, string> = {
    'wood-walnut':  'Walnut Wood',
    'wood-oak':     'Oak Wood',
    'wood-white':   'White Wood',
    'metal-black':  'Matte Black',
    'metal-gold':   'Gold Metal',
    'metal-silver': 'Silver Metal',
    'acrylic':      'Premium Acrylic',
  };
  return labels[material];
}

export function getSizeLabel(size: FrameSize): string {
  const labels: Record<FrameSize, string> = {
    '6x8':   '6" × 8"',
    '8x10':  '8" × 10"',
    '12x16': '12" × 16"',
  };
  return labels[size];
}

export function getEstimatedDelivery(pincode: string): string {
  // Simplified delivery estimate based on pincode prefix
  const prefix = parseInt(pincode.substring(0, 2));
  const today = new Date();
  let days = 5;
  if (prefix >= 10 && prefix <= 13) days = 3; // Delhi NCR
  if (prefix >= 40 && prefix <= 41) days = 3; // Mumbai
  if (prefix >= 56 && prefix <= 57) days = 4; // Bangalore
  if (prefix >= 60 && prefix <= 62) days = 4; // Chennai
  const delivery = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return delivery.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function generateOrderId(): string {
  return 'FRM' + Date.now().toString(36).toUpperCase();
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    processing: 'Order Placed',
    printing:   'Being Printed',
    packed:     'Packed & Ready',
    shipped:    'Out for Delivery',
    delivered:  'Delivered',
  };
  return labels[status] || status;
}

export function getOrderStatusStep(status: string): number {
  const steps: Record<string, number> = {
    processing: 0,
    printing:   1,
    packed:     2,
    shipped:    3,
    delivered:  4,
  };
  return steps[status] ?? 0;
}
