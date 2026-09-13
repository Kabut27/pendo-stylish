import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

// next/font hupakua fonti hizi WAKATI WA BUILD pekee na kuzihifadhi ndani ya
// tovuti yenyewe (self-hosted). Matokeo yake: mtumiaji hahitaji kuwasiliana
// na servers za Google kupata fonti - inapunguza muda wa kupakia sana
// kwenye mtandao dhaifu wa simu, na haiwezi "kunyongwa" (block) kwa sababu
// ya mtandao wa nje.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Pendo Stylish — Saluni na Duka la Bidhaa za Kike, Iringa",
  description:
    "Pendo Stylish - urembo wa kiwango cha juu Iringa. Tazama bidhaa zetu, huduma za saluni, na picha za Kabla na Baada. Wasiliana nasi kupitia WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sw" className={`${poppins.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
