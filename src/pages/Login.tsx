import { useState } from "react";
import { useNavigate } from "react-router";
import { Scissors, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.worker.login.useMutation({
    onSuccess: (data: { token: string; worker: { id: number; name: string; role: string } }) => {
      localStorage.setItem("pendo_token", data.token);
      toast.success("Hongera! Umeingia kikamilifu.");
      if (data.worker.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/worker");
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Jina au PIN sio sahihi.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4) {
      toast.error("Jaza jina na PIN (nambari 4).");
      return;
    }
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ name: name.trim(), pin });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f3] to-[#f5efe9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 text-[#8b6f5e] hover:text-[#c4536a]">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Rudi Nyumbani
        </Button>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full rose-gold-gradient flex items-center justify-center shadow-lg">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold rose-gold-text mb-1">Ingia</h1>
            <p className="text-sm text-[#8b6f5e]">Wafanyakazi wa Pendo Stylish</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5a4035] mb-1.5">Jina Lako</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Andika jina lako"
                className="h-12 border-[#e8ddd3] bg-white/80 focus:border-[#c4536a] focus:ring-[#c4536a]/20 text-base"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5a4035] mb-1.5">PIN (Nambari 4)</label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="****"
                  className="h-12 border-[#e8ddd3] bg-white/80 focus:border-[#c4536a] focus:ring-[#c4536a]/20 text-base tracking-widest"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89080] hover:text-[#c4536a]"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 btn-rose text-base mt-2" disabled={isLoading}>
              {isLoading ? "Inaingia..." : "Ingia"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#f0e6d8] text-center">
            <p className="text-xs text-[#a89080]">
              Admin: <strong>Admin</strong> / PIN: <strong>1234</strong>
            </p>
            <p className="text-xs text-[#a89080] mt-1">
              Fundi: <strong>Asha</strong> / PIN: <strong>1111</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
