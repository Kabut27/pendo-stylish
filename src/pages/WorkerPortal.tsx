import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LogOut, Plus, History, ChevronDown, ChevronUp, User, Calendar,
  Smartphone, Banknote, Check, X, Scissors
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function WorkerPortal() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "tigo_pesa" | "m_pesa" | "airtel_money">("cash");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [showSaleForm, setShowSaleForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const today = new Date().toISOString().split("T")[0];

  const { data: services, refetch: refetchServices } = trpc.service.list.useQuery();
  const { data: todaysSales, refetch: refetchTodaysSales } = trpc.sale.listByDate.useQuery({ date: today });
  const { data: mySales } = trpc.sale.listByWorker.useQuery(
    { workerId: user?.id || 0 },
    { enabled: !!user }
  );

  // Use refetchServices to avoid unused variable warning
  void refetchServices;

  const createSale = trpc.sale.create.useMutation({
    onSuccess: () => {
      toast.success("Mauzo yamesajiliwa!");
      resetForm();
      refetchTodaysSales();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const resetForm = () => {
    setSelectedService("");
    setAmount("");
    setPaymentMethod("cash");
    setCustomerName("");
    setNotes("");
    setShowSaleForm(false);
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedService || !amount) {
      toast.error("Jaza huduma na bei.");
      return;
    }
    createSale.mutate({
      workerId: user.id,
      serviceId: parseInt(selectedService),
      amount: parseFloat(amount),
      paymentMethod,
      customerName: customerName || undefined,
      notes: notes || undefined,
      date: today,
    });
  };

  const paymentIcons = {
    cash: <Banknote className="w-5 h-5" />,
    tigo_pesa: <Smartphone className="w-5 h-5" />,
    m_pesa: <Smartphone className="w-5 h-5" />,
    airtel_money: <Smartphone className="w-5 h-5" />,
  };

  const paymentLabels = {
    cash: "Cash",
    tigo_pesa: "Tigo Pesa",
    m_pesa: "M-Pesa",
    airtel_money: "Airtel Money",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f3] to-[#f5efe9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full rose-gold-gradient animate-pulse" />
          <p className="text-[#8b6f5e]">Inapakia...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const myTodaySales = todaysSales?.filter((s: { workerId: number }) => s.workerId === user.id) || [];
  const myTodayTotal = myTodaySales.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0);
  const allTodayTotal = todaysSales?.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f3] to-[#f5efe9]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#f0e6d8] sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full rose-gold-gradient flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#5a4035] leading-tight">{user.name}</h1>
              <p className="text-xs text-[#a89080]">{user.role === "admin" ? "Msimamizi" : "Fundi"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-[#8b6f5e] hover:text-red-500">
            <LogOut className="w-4 h-4 mr-1" />
            Toka
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Zamu ya Leo Summary */}
        <div className="glass-card rounded-2xl p-5 card-hover animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#c4536a]" />
            <h2 className="text-lg font-bold text-[#5a4035]">Zamu ya Leo</h2>
            <span className="ml-auto text-xs px-2 py-1 bg-[#fceef1] text-[#c4536a] rounded-full">
              {new Date().toLocaleDateString("sw-TZ", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#fceef1] to-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold rose-gold-text">{myTodaySales.length}</p>
              <p className="text-xs text-[#8b6f5e]">Mauzo Leo</p>
            </div>
            <div className="bg-gradient-to-br from-[#f5e6d3] to-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#b8956a]">Tsh {myTodayTotal.toLocaleString()}</p>
              <p className="text-xs text-[#8b6f5e]">Jumla Yako</p>
            </div>
          </div>

          {!showSaleForm ? (
            <Button className="w-full h-12 btn-rose text-base" onClick={() => setShowSaleForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Sajili Mauzo
            </Button>
          ) : (
            <div className="bg-white/80 rounded-xl p-4 border border-[#f0e6d8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#5a4035]">Fomu ya Mauzo</h3>
                <button onClick={() => setShowSaleForm(false)} className="text-[#a89080] hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSale} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#5a4035] mb-1">Huduma</label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      const svc = services?.find((s: { id: number; price: number }) => s.id.toString() === e.target.value);
                      if (svc) setAmount(svc.price.toString());
                    }}
                    className="w-full h-11 rounded-lg border border-[#e8ddd3] bg-white px-3 text-sm focus:border-[#c4536a] focus:outline-none focus:ring-1 focus:ring-[#c4536a]"
                  >
                    <option value="">Chagua Huduma</option>
                    {services?.map((s: { id: number; name: string; price: number }) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - Tsh {s.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4035] mb-1">Bei (Tsh)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Andika bei"
                    className="h-11 border-[#e8ddd3]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4035] mb-1">Njia ya Malipo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["cash", "tigo_pesa", "m_pesa", "airtel_money"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                          paymentMethod === method
                            ? "border-[#c4536a] bg-[#fceef1] text-[#c4536a]"
                            : "border-[#e8ddd3] text-[#8b6f5e] hover:border-[#d4a574]"
                        }`}
                      >
                        {paymentIcons[method]}
                        <span className="text-[10px] font-medium">{paymentLabels[method]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4035] mb-1">Jina la Mteja (Si lazima)</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jina la mteja"
                    className="h-11 border-[#e8ddd3]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4035] mb-1">Maelezo (Si lazima)</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Maelezo ya ziada"
                    className="h-11 border-[#e8ddd3]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1 h-11 border-[#e8ddd3]" onClick={() => setShowSaleForm(false)}>
                    Ghairi
                  </Button>
                  <Button type="submit" className="flex-1 h-11 btn-rose" disabled={createSale.isPending}>
                    <Check className="w-4 h-4 mr-1" />
                    {createSale.isPending ? "Inahifadhi..." : "Hifadhi"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sales History */}
        <div className="glass-card rounded-2xl card-hover animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#c4536a]" />
              <h2 className="text-lg font-bold text-[#5a4035]">Historia ya Mauzo</h2>
            </div>
            {showHistory ? <ChevronUp className="w-5 h-5 text-[#a89080]" /> : <ChevronDown className="w-5 h-5 text-[#a89080]" />}
          </button>

          {showHistory && (
            <div className="px-5 pb-5">
              {mySales && mySales.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {mySales.slice(0, 20).map((sale: { id: number; serviceId: number; amount: number; date: string; customerName: string | null; paymentMethod: string }) => (
                    <div key={sale.id} className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#5a4035] text-sm">
                          Huduma #{sale.serviceId}
                        </p>
                        <p className="text-xs text-[#a89080]">{sale.date}</p>
                        {sale.customerName && (
                          <p className="text-xs text-[#8b6f5e]">Mteja: {sale.customerName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#c4536a]">Tsh {sale.amount.toLocaleString()}</p>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#f5e6d3] text-[#8b6f5e] rounded-full">
                          {paymentLabels[sale.paymentMethod as keyof typeof paymentLabels]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#a89080]">
                  <Scissors className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Hakuna mauzo yaliyorekodiwa bado.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's All Sales */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-bold text-[#5a4035] mb-3">Mauzo Yote Leo</h2>
          {todaysSales && todaysSales.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {todaysSales.map((sale: { id: number; serviceName: string | null; workerName: string | null; serviceId: number; workerId: number; amount: number }) => (
                <div key={sale.id} className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#5a4035] text-sm">{sale.serviceName || `Huduma #${sale.serviceId}`}</p>
                    <p className="text-xs text-[#a89080]">Fundi: {sale.workerName || `#${sale.workerId}`}</p>
                  </div>
                  <p className="font-bold text-[#c4536a]">Tsh {sale.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#a89080] py-4">Hakuna mauzo leo bado.</p>
          )}
          <div className="mt-3 pt-3 border-t border-[#f0e6d8] flex justify-between">
            <span className="text-sm text-[#8b6f5e]">Jumla ya Leo</span>
            <span className="font-bold text-[#c4536a]">Tsh {allTodayTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
