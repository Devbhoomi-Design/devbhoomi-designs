export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  badge?: string;
  customizable: boolean;
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Personalised Aipan Nameplate",
    category: "Personalised Art",
    price: 1499,
    originalPrice: 1799,
    description:
      "A handcrafted Aipan-inspired nameplate personalised specially for your home.",
    badge: "Bestseller",
    customizable: true,
    image: "/products/nameplate.jpg",
  },
  {
    id: 2,
    name: "Aipan Kalash / Tauli / Lota",
    category: "Aipan Collection",
    price: 899,
    originalPrice: 1099,
    description:
      "Traditional Aipan-inspired decorative kalash handcrafted with Himalayan artistic details.",
    badge: "Handmade",
    customizable: false,
    image: "/products/kalash.jpg",
  },
  {
    id: 3,
    name: "Aipan Wall Hanging",
    category: "Wall Art",
    price: 1999,
    originalPrice: 2499,
    description:
      "Elegant Aipan wall art designed to bring traditional Uttarakhand aesthetics into your home.",
    badge: "Popular",
    customizable: true,
    image: "/products/wall-hanging.jpg",
  },
  {
    id: 4,
    name: "Customised Aipan Chowki",
    category: "Custom Creations",
    price: 1299,
    originalPrice: 1599,
    description:
      "Beautiful handcrafted Aipan chowki that can be customised for your special occasion.",
    badge: "Custom",
    customizable: true,
    image: "/products/chowki.jpg",
  },
  {
    id: 5,
    name: "Aipan Pooja Thali",
    category: "Pooja Collection",
    price: 999,
    originalPrice: 1299,
    description:
      "Traditional Aipan-inspired pooja thali created for festive occasions and celebrations.",
    badge: "New",
    customizable: false,
    image: "/products/thali.jpg",
  },
  {
    id: 6,
    name: "Mandala Art",
    category: "Mandala Art",
    price: 1799,
    originalPrice: 2199,
    description:
      "Detailed mandala artwork combining traditional patterns with contemporary design.",
    badge: "Featured",
    customizable: false,
    image: "/products/mandala.jpg",
  },
  {
    id: 7,
    name: "Aipan Karwachauth Set",
    category: "Festive Gifts",
    price: 1299,
    originalPrice: 1599,
    description:
      "A beautiful handcrafted Aipan-inspired set for Karwachauth and festive gifting.",
    badge: "Festive",
    customizable: false,
    image: "/products/karwachauth.jpg",
  },
  {
    id: 8,
    name: "Personalised Couple Gift",
    category: "Personalised Gifts",
    price: 1199,
    originalPrice: 1499,
    description:
      "A personalised handmade gift created specially for couples and memorable occasions.",
    badge: "Personalised",
    customizable: true,
    image: "/products/couple-gift.jpg",
  },
];