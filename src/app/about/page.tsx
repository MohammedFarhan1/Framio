import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Truck, Shield, Users, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us — Framio',
  description: 'We believe every memory deserves a beautiful home. Framio crafts premium personalised photo frames, handmade in India with love.',
};

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50,000+', label: 'Frames Delivered' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '3–5 Days', label: 'Delivery Time' },
];

const VALUES = [
  {
    icon: <Heart size={22} className="text-[#C4634F]" />,
    title: 'Made with Love',
    desc: 'Every frame is handcrafted by skilled artisans in India. We pour care into every cut, colour, and corner.',
  },
  {
    icon: <Award size={22} className="text-[#C9A84C]" />,
    title: 'Premium Quality',
    desc: 'Archival-grade paper, fade-resistant inks, and solid wood frames — built to last a lifetime.',
  },
  {
    icon: <Sparkles size={22} className="text-[#C4634F]" />,
    title: 'Truly Personal',
    desc: 'No two frames are alike. Each one is made to order, tailored to your photo, style, and story.',
  },
  {
    icon: <Truck size={22} className="text-[#C9A84C]" />,
    title: 'Fast Delivery',
    desc: 'Pan-India delivery in 3–5 business days, with real-time tracking so you always know where your gift is.',
  },
  {
    icon: <Shield size={22} className="text-[#C4634F]" />,
    title: 'Safe & Secure',
    desc: 'Razorpay-powered checkout, end-to-end encrypted, and a no-questions-asked replacement guarantee.',
  },
  {
    icon: <Users size={22} className="text-[#C9A84C]" />,
    title: 'Customer First',
    desc: 'Our support team is available 7 days a week on WhatsApp — real people, real answers, real fast.',
  },
];

const TEAM = [
  {
    name: 'Waseem Ahmed',
    role: 'Founder & CEO',
    bio: "Former product designer who turned a gift idea for his parents' anniversary into a business loved by thousands.",
  },
  {
    name: 'Mohamed Farhan',
    role: 'Head of Craftsmanship',
    bio: 'With 12 years in print production, Mohamed ensures every frame that leaves our studio is a work of art.',
  },
  {
    name: 'Rafi Dalvi',
    role: 'Customer Experience Lead',
    bio: "Rafi's team has resolved 50,000+ orders without a single unhappy customer — and counting.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#FDF8F4]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F5EDE5] border-b border-[#E8DDD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[#C4634F] text-sm font-semibold tracking-widest uppercase mb-4">Our Story</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D1F1A] leading-tight mb-6">
              Memories deserve a beautiful home.
            </h1>
            <p className="text-[#7A6A64] text-lg sm:text-xl leading-relaxed mb-8">
              Framio was born from a simple belief — that the most meaningful gifts aren't bought off a shelf.
              They're crafted from the moments that matter most. We started in 2022 with one frame maker,
              one designer, and an obsession with quality. Today we're a team of 40, delivering joy across India every day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/products">Shop Our Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#C4634F]/5 pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-[#C9A84C]/8 pointer-events-none" />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="border-b border-[#E8DDD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E8DDD6]">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-10 px-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#C4634F] mb-1">{value}</div>
                <div className="text-sm text-[#7A6A64] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Mission ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[#C4634F] text-sm font-semibold tracking-widest uppercase mb-3">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D1F1A] mb-5 leading-tight">
              Turning pixels into heirlooms.
            </h2>
            <p className="text-[#7A6A64] text-base leading-relaxed mb-4">
              In a world of fleeting digital feeds, we make memories tangible. Whether it's a wedding moment,
              a child's first smile, or a milestone anniversary — Framio transforms your favourite photo
              into a handcrafted piece that will outlast every screen.
            </p>
            <p className="text-[#7A6A64] text-base leading-relaxed mb-6">
              We partner with local artisans across Maharashtra and Karnataka, paying fair wages and
              keeping traditional craft alive through modern personalisation technology. Every purchase
              supports a craftsperson's livelihood.
            </p>
            <div className="flex items-center gap-2 text-[#C9A84C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
              <span className="text-[#7A6A64] text-sm ml-1">Rated 4.9 / 5 by 10,000+ customers</span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-[#F5EDE5] rounded-3xl border border-[#E8DDD6] overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white border border-[#E8DDD6] shadow-sm flex items-center justify-center overflow-hidden">
                  <Image src="/logo.png" alt="Framio" width={56} height={56} className="object-contain" />
                </div>
                <p className="text-[#2D1F1A] font-bold text-xl mb-1">Framio Studio</p>
                <p className="text-[#7A6A64] text-sm">Handcrafted in India 🇮🇳</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-2xl bg-[#C4634F]/10 -z-10" />
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl bg-[#C9A84C]/10 -z-10" />
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="bg-[#F5EDE5] border-y border-[#E8DDD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-[#C4634F] text-sm font-semibold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D1F1A]">Built on six promises.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#E8DDD6]">
                <div className="w-10 h-10 rounded-xl bg-[#FDF8F4] border border-[#E8DDD6] flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-[#2D1F1A] text-base mb-2">{title}</h3>
                <p className="text-[#7A6A64] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-[#C4634F] text-sm font-semibold tracking-widest uppercase mb-3">The People Behind Framio</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2D1F1A]">Meet the team.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map(({ name, role, bio }) => (
            <div key={name} className="bg-white rounded-2xl p-6 border border-[#E8DDD6] text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5EDE5] border border-[#E8DDD6] flex items-center justify-center">
                <span className="text-2xl font-bold text-[#C4634F]">{name[0]}</span>
              </div>
              <h3 className="font-bold text-[#2D1F1A] text-base mb-0.5">{name}</h3>
              <p className="text-[#C4634F] text-xs font-semibold mb-3">{role}</p>
              <p className="text-[#7A6A64] text-sm leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#2D1F1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-18 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to frame a memory?</h2>
          <p className="text-[#E8DDD6] text-base mb-8 max-w-xl mx-auto">
            Browse our collection, pick your style, and let us turn your favourite photo into something extraordinary.
          </p>
          <Button asChild size="lg" className="bg-[#C4634F] hover:bg-[#b3573e] text-white border-0">
            <Link href="/products">Browse All Frames</Link>
          </Button>
        </div>
      </section>

    </main>
  );
}
