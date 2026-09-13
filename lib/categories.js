// lib/categories.js
// Chanzo kimoja cha makundi makuu ya biashara - kinatumika kwenye Header
// (menu inayofunguka), MobileMenu, na ukurasa wa mwanzo (category tiles),
// ili yasitofautiane sehemu moja na nyingine.

export const CATEGORIES = [
  { icon: "💇🏾‍♀️", label: "Nywele", href: "/huduma" },
  { icon: "💅🏾", label: "Kucha", href: "/huduma" },
  { icon: "👁️", label: "Kope", href: "/huduma" },
  { icon: "💄", label: "Makeup", href: "/huduma" },
];

// Menu kuu inayotokea unapobonyeza hamburger - vichupo vya kushoto.
export const MENU_TABS = [
  { key: "huduma", label: "Huduma" },
  { key: "bidhaa", label: "Bidhaa" },
  { key: "matukio", label: "Matukio" },
  { key: "wateja", label: "Wateja Wetu" },
];

// Kila kichupo kina viungo vyake vya haraka (vinavyoonekana upande wa kulia).
export const MENU_LINKS = {
  huduma: [
    { label: "Huduma Zote", href: "/huduma", featured: true },
    { label: "Nywele", href: "/huduma", icon: "💇🏾‍♀️" },
    { label: "Kucha", href: "/huduma", icon: "💅🏾" },
    { label: "Kope", href: "/huduma", icon: "👁️" },
    { label: "Makeup", href: "/huduma", icon: "💄" },
  ],
  bidhaa: [
    { label: "Bidhaa Zote", href: "/#bidhaa", featured: true },
    { label: "Zinazopendwa", href: "/#bidhaa", icon: "⭐" },
    { label: "Mpya", href: "/#bidhaa", icon: "🆕" },
  ],
  matukio: [
    { label: "Kabla na Baada", href: "/kabla-na-baada", featured: true, icon: "✨" },
    { label: "Wasiliana Nasi", href: "/mawasiliano", icon: "📍" },
  ],
  wateja: [
    { label: "Kabla na Baada ya Wateja", href: "/kabla-na-baada", featured: true, icon: "📸" },
    { label: "Wasiliana Nasi", href: "/mawasiliano", icon: "💬" },
  ],
};
