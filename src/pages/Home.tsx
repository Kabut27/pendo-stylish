import { useNavigate } from "react-router";
import { Scissors, MapPin, Phone, Clock, Sparkles, Users, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const huduma = [
    { name: "Nywele", icon: <Scissors className="w-8 h-8" />, desc: "Sukuma, Chana, Treatment, rangi", price: "Tsh 3,000 - 25,000" },
    { name: "Nails", icon: <Sparkles className="w-8 h-8" />, desc: "Manicure, Pedicure, Nail Art", price: "Tsh 7,000 - 15,000" },
    { name: "Nyuso", icon: <Heart className="w-8 h-8" />, desc: "Facial, Makeup, Skincare", price: "Tsh 10,000 - 25,000" },
    { name: "Mwili", icon: <Users className="w-8 h-8" />, desc: "Massage, Waxing, Body Treatment", price: "Tsh 15,000 - 30,000" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f3] to-[#f5efe9]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full rose-gold-gradient flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold rose-gold-text">Pendo Stylish</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-[#8b6f5e] hover:text-[#c4536a]">
              Ingia
            </Button>
            <Button size="sm" onClick={() => navigate("/login")} className="btn-rose">
              Wafanyakazi
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full rose-gold-gradient flex items-center justify-center shadow-2xl shadow-rose-300/30">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 rose-gold-text">
            Pendo Stylish
          </h1>
          <p className="text-lg md:text-xl text-[#8b6f5e] mb-2 font-medium">
            Salon ya Kike - Iringa, Tanzania
          </p>
          <p className="text-[#a89080] mb-8 max-w-lg mx-auto">
            Urembo wa hali ya juu kwa wanawake wote. Huduma bora za nywele, kucha, 
            nyuso na mwili kwa bei nafuu.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="btn-rose text-lg px-8 py-6" onClick={() => document.getElementById("mawasiliano")?.scrollIntoView({ behavior: "smooth" })}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Wasiliana Nasi
            </Button>
            <Button size="lg" variant="outline" className="border-[#d4a574] text-[#c4536a] hover:bg-[#fceef1] text-lg px-8 py-6" onClick={() => document.getElementById("huduma")?.scrollIntoView({ behavior: "smooth" })}>
              <Sparkles className="w-5 h-5 mr-2" />
              Huduma Zetu
            </Button>
          </div>
        </div>
      </section>

      {/* Huduma Section */}
      <section id="huduma" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold rose-gold-text mb-3">Huduma Zetu</h2>
            <p className="text-[#8b6f5e]">Tunatoa huduma za kitaalamu kwa wanawake wote</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {huduma.map((h, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center card-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#fceef1] to-[#f5e6d3] flex items-center justify-center text-[#c4536a]">
                  {h.icon}
                </div>
                <h3 className="text-lg font-bold text-[#5a4035] mb-2">{h.name}</h3>
                <p className="text-sm text-[#8b6f5e] mb-3">{h.desc}</p>
                <span className="inline-block px-4 py-1 bg-[#fceef1] text-[#c4536a] rounded-full text-sm font-semibold">
                  {h.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold rose-gold-text mb-3">Mahali Tulipo</h2>
            <p className="text-[#8b6f5e]">Tupate Iringa kwa huduma bora za urembo</p>
          </div>
          <div className="glass-card rounded-2xl p-6 md:p-8 card-hover animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fceef1] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#c4536a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5a4035]">Anwani</h4>
                    <p className="text-[#8b6f5e] text-sm">Mtaa wa Gangilonga, Iringa Mjini</p>
                    <p className="text-[#8b6f5e] text-sm">Jirani na Kanisa la Lutherani</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fceef1] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#c4536a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5a4035]">Masaa ya Kazi</h4>
                    <p className="text-[#8b6f5e] text-sm">Jumatatu - Jumamosi: 8:00 AM - 7:00 PM</p>
                    <p className="text-[#8b6f5e] text-sm">Jumapili: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fceef1] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#c4536a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5a4035]">Simu</h4>
                    <p className="text-[#8b6f5e] text-sm">+255 713 456 789</p>
                    <p className="text-[#8b6f5e] text-sm">+255 765 987 654</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden h-64 md:h-auto bg-gradient-to-br from-[#f5e6d3] to-[#fceef1] flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-[#d4a574]" />
                  <p className="text-[#8b6f5e] font-medium">Iringa, Tanzania</p>
                  <p className="text-sm text-[#a89080] mt-2">Gangilonga Area</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mawasiliano / CTA */}
      <section id="mawasiliano" className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl font-bold rose-gold-text mb-4">Karibu Pendo Stylish</h2>
          <p className="text-[#8b6f5e] mb-8">
            Tunakusubiri kwa mapokezi yenye furaha. Piga simu au tembelea salon yetu Iringa 
            upate huduma bora za urembo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="btn-rose text-lg px-8">
              <Phone className="w-5 h-5 mr-2" />
              Piga Simu Sasa
            </Button>
            <Button size="lg" variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#f0fdf4] text-lg px-8">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </div>
          <p className="text-sm text-[#a89080] mt-6">
            WhatsApp Ordering inakuja hivi karibuni!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#f0e6d8]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full rose-gold-gradient flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold rose-gold-text">Pendo Stylish</span>
          </div>
          <p className="text-sm text-[#a89080]">
            &copy; 2026 Pendo Stylish. Haki zote zimehifadhiwa. Iringa, Tanzania.
          </p>
        </div>
      </footer>
    </div>
  );
}
