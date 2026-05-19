import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LogOut, TrendingUp, TrendingDown, DollarSign, Users, ClipboardList,
  Lock, Download, Plus, Check, Trash2, Shield, ChevronLeft,
  ChevronRight, BarChart3, PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading, isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [vaultPin, setVaultPin] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isLoading, isAdmin, navigate]);

  const { data: summary } = trpc.dashboard.dailySummary.useQuery({ date: currentDate });
  const { data: vaultTotals } = trpc.vault.getTotals.useQuery();
  const { data: topWorkers } = trpc.dashboard.topWorkers.useQuery({ date: currentDate });
  const { data: paymentBreakdown } = trpc.dashboard.paymentMethodBreakdown.useQuery({ date: currentDate });

  const vaultQuery = trpc.vault.get.useQuery(
    { pin: vaultPin },
    { enabled: vaultUnlocked && vaultPin.length === 4 }
  );

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const downloadCSV = async () => {
    try {
      const data = await trpc.dashboard.exportAll.useQuery().refetch();
      if (!data.data) return;

      const { sales, expenses, todos, loans, workers, services } = data.data;

      let csv = "PENDO STYLISH - BACKUP\n";
      csv += `Tarehe: ${new Date().toLocaleDateString("sw-TZ")}\n\n`;

      csv += "=== MAUZO ===\nID,Worker ID,Service ID,Amount,Payment Method,Customer,Notes,Date\n";
      sales.forEach((s: Record<string, unknown>) => {
        csv += `${s.id},${s.workerId},${s.serviceId},${s.amount},${s.paymentMethod},"${s.customerName || ""}","${s.notes || ""}",${s.date}\n`;
      });

      csv += "\n=== MATUMIZI ===\nID,Description,Amount,Category,Date\n";
      expenses.forEach((e: Record<string, unknown>) => {
        csv += `${e.id},"${e.description}",${e.amount},${e.category},${e.date}\n`;
      });

      csv += "\n=== TODO ===\nID,Title,Description,Category,Due Date,Completed\n";
      todos.forEach((t: Record<string, unknown>) => {
        csv += `${t.id},"${t.title}","${t.description || ""}",${t.category},${t.dueDate || ""},${t.isCompleted}\n`;
      });

      csv += "\n=== MIKOPO ===\nID,Lender,Amount,Amount Paid,Interest Rate,Start Date,Due Date,Paid Off\n";
      loans.forEach((l: Record<string, unknown>) => {
        csv += `${l.id},"${l.lenderName}",${l.amount},${l.amountPaid},${l.interestRate},${l.startDate},${l.dueDate || ""},${l.isPaidOff}\n`;
      });

      csv += "\n=== WAFANYAKAZI ===\nID,Name,Phone,Role,Active\n";
      workers.forEach((w: Record<string, unknown>) => {
        csv += `${w.id},"${w.name}","${w.phone || ""}",${w.role},${w.isActive}\n`;
      });

      csv += "\n=== HUDUMA ===\nID,Name,Description,Price,Category,Active\n";
      services.forEach((s: Record<string, unknown>) => {
        csv += `${s.id},"${s.name}","${s.description || ""}",${s.price},${s.category},${s.isActive}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pendo-stylish-backup-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("Backup imepakuliwa!");
    } catch {
      toast.error("Hitilafu kupakua backup.");
    }
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

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f3] to-[#f5efe9]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#f0e6d8] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full rose-gold-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#5a4035] leading-tight">Pendo Stylish</h1>
              <p className="text-xs text-[#a89080]">Paneli ya Msimamizi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-[#8b6f5e]">
              Nyumbani
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-[#8b6f5e] hover:text-red-500">
              <LogOut className="w-4 h-4 mr-1" />
              Toka
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="muhtasari" className="space-y-5">
          <TabsList className="bg-white/70 border border-[#f0e6d8] p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="muhtasari" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <BarChart3 className="w-4 h-4 mr-1" />
              Muhtasari
            </TabsTrigger>
            <TabsTrigger value="mauzo" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <TrendingUp className="w-4 h-4 mr-1" />
              Mauzo
            </TabsTrigger>
            <TabsTrigger value="matumizi" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <TrendingDown className="w-4 h-4 mr-1" />
              Matumizi
            </TabsTrigger>
            <TabsTrigger value="todo" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <ClipboardList className="w-4 h-4 mr-1" />
              Todo
            </TabsTrigger>
            <TabsTrigger value="mikopo" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <PiggyBank className="w-4 h-4 mr-1" />
              Mikopo
            </TabsTrigger>
            <TabsTrigger value="vault" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <Lock className="w-4 h-4 mr-1" />
              Vault
            </TabsTrigger>
            <TabsTrigger value="backup" className="rounded-lg data-[state=active]:bg-[#fceef1] data-[state=active]:text-[#c4536a]">
              <Download className="w-4 h-4 mr-1" />
              Backup
            </TabsTrigger>
          </TabsList>

          {/* MUHTASARI TAB */}
          <TabsContent value="muhtasari" className="space-y-5">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePrevDay} className="border-[#e8ddd3]">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-sm text-[#8b6f5e]">
                  {new Date(currentDate).toLocaleDateString("sw-TZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleNextDay} className="border-[#e8ddd3]">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Mauzo" value={`Tsh ${(summary?.totalSales || 0).toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} color="rose" />
              <StatCard title="Matumizi" value={`Tsh ${(summary?.totalExpenses || 0).toLocaleString()}`} icon={<TrendingDown className="w-5 h-5" />} color="amber" />
              <StatCard title="Faida" value={`Tsh ${(summary?.netProfit || 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color={summary && summary.netProfit >= 0 ? "green" : "red"} />
              <StatCard title="Idadi ya Mauzo" value={`${summary?.salesCount || 0}`} icon={<BarChart3 className="w-5 h-5" />} color="purple" />
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-lg font-bold text-[#5a4035] mb-4">Wafanyakaji Bora Leo</h3>
              {topWorkers && topWorkers.length > 0 ? (
                <div className="space-y-3">
                  {topWorkers.map((w: { workerId: number; workerName: string | null; totalSales: number; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fceef1] to-[#f5e6d3] flex items-center justify-center text-sm font-bold text-[#c4536a]">
                          {i + 1}
                        </div>
                        <span className="font-medium text-[#5a4035]">{w.workerName || `Fundi #${w.workerId}`}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#c4536a]">Tsh {w.totalSales.toLocaleString()}</span>
                        <span className="text-xs text-[#a89080] ml-2">({w.count} mauzo)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#a89080] py-4">Hakuna mauzo leo.</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-lg font-bold text-[#5a4035] mb-4">Njia za Malipo Leo</h3>
              {paymentBreakdown && paymentBreakdown.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentBreakdown.map((p: { method: string; total: number; count: number }, i: number) => (
                    <div key={i} className="bg-white/60 rounded-xl p-4 text-center">
                      <p className="text-xs text-[#8b6f5e] capitalize mb-1">{p.method.replace("_", " ")}</p>
                      <p className="text-lg font-bold text-[#5a4035]">Tsh {p.total.toLocaleString()}</p>
                      <p className="text-xs text-[#a89080]">{p.count} mauzo</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#a89080] py-4">Hakuna mauzo leo.</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Wafanyakazi" value={`${summary?.activeWorkers || 0}`} icon={<Users className="w-5 h-5" />} color="blue" />
              <StatCard title="Todo Zinazosubiri" value={`${summary?.pendingTodos || 0}`} icon={<ClipboardList className="w-5 h-5" />} color="orange" />
              <StatCard title="Mikopo Yote" value={`Tsh ${(summary?.totalLoaned || 0).toLocaleString()}`} icon={<PiggyBank className="w-5 h-5" />} color="red" />
              <StatCard title="Mikopo Iliolipwa" value={`Tsh ${(summary?.totalLoanPaid || 0).toLocaleString()}`} icon={<Check className="w-5 h-5" />} color="green" />
            </div>
          </TabsContent>

          <TabsContent value="mauzo">
            <SalesTab date={currentDate} />
          </TabsContent>

          <TabsContent value="matumizi">
            <ExpensesTab date={currentDate} />
          </TabsContent>

          <TabsContent value="todo">
            <TodoTab />
          </TabsContent>

          <TabsContent value="mikopo">
            <LoansTab />
          </TabsContent>

          <TabsContent value="vault">
            <VaultTab
              vaultUnlocked={vaultUnlocked}
              setVaultUnlocked={setVaultUnlocked}
              vaultPin={vaultPin}
              setVaultPin={setVaultPin}
              vaultData={vaultQuery.data}
              vaultTotals={vaultTotals}
            />
          </TabsContent>

          <TabsContent value="backup">
            <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f5e6d3] to-[#fceef1] flex items-center justify-center">
                <Download className="w-8 h-8 text-[#c4536a]" />
              </div>
              <h3 className="text-xl font-bold text-[#5a4035] mb-2">Pakua Data (Backup)</h3>
              <p className="text-[#8b6f5e] text-sm mb-6">
                Pakua data yote ya Pendo Stylish kwa CSV kwa ajili ya uhifadhi wa nje.
                Data inajumlisha: mauzo, matumizi, mikopo, wafanyakazi, na huduma.
              </p>
              <Button size="lg" className="btn-rose text-base px-8" onClick={downloadCSV}>
                <Download className="w-5 h-5 mr-2" />
                Pakua CSV
              </Button>
              <p className="text-xs text-[#a89080] mt-4">
                Faili litakwenda kwenye folda ya downloads yako.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ===================== SUB-COMPONENTS ===================== */

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    rose: "from-[#fceef1] to-white text-[#c4536a]",
    amber: "from-[#f5e6d3] to-white text-[#b8956a]",
    green: "from-green-50 to-white text-green-600",
    red: "from-red-50 to-white text-red-500",
    purple: "from-purple-50 to-white text-purple-600",
    blue: "from-blue-50 to-white text-blue-600",
    orange: "from-orange-50 to-white text-orange-600",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.rose} rounded-2xl p-4 card-hover`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium opacity-70">{title}</span>
        {icon}
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

/* SALES TAB */
function SalesTab({ date }: { date: string }) {
  const [showForm, setShowForm] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "tigo_pesa" | "m_pesa" | "airtel_money">("cash");
  const [workerId, setWorkerId] = useState("");
  const [customerName, setCustomerName] = useState("");

  const { data: sales, refetch } = trpc.sale.listByDate.useQuery({ date });
  const { data: services } = trpc.service.list.useQuery();
  const { data: workers } = trpc.worker.list.useQuery();

  const createSale = trpc.sale.create.useMutation({
    onSuccess: () => {
      toast.success("Mauzo yameongezwa!");
      setShowForm(false);
      setServiceId(""); setAmount(""); setWorkerId(""); setCustomerName("");
      refetch();
    },
  });
  const deleteSale = trpc.sale.delete.useMutation({
    onSuccess: () => { toast.success("Mauzo yamefutwa!"); refetch(); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#5a4035]">Mauzo ya {date}</h3>
        <Button size="sm" className="btn-rose" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />Ongeza
        </Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#5a4035] block mb-1">Huduma</label>
              <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); const s = services?.find((x: { id: number; price: number }) => x.id.toString() === e.target.value); if (s) setAmount(s.price.toString()); }} className="w-full h-10 rounded-lg border border-[#e8ddd3] px-2 text-sm">
                <option value="">Chagua</option>
                {services?.map((s: { id: number; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#5a4035] block mb-1">Fundi</label>
              <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="w-full h-10 rounded-lg border border-[#e8ddd3] px-2 text-sm">
                <option value="">Chagua</option>
                {workers?.map((w: { id: number; name: string }) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Bei (Tsh)" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10" />
            <Input placeholder="Jina la Mteja" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-10" />
          </div>
          <div>
            <label className="text-xs text-[#5a4035] block mb-1">Malipo</label>
            <div className="grid grid-cols-4 gap-2">
              {(["cash", "tigo_pesa", "m_pesa", "airtel_money"] as const).map(m => (
                <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`p-2 rounded-lg border text-xs font-medium ${paymentMethod === m ? "border-[#c4536a] bg-[#fceef1] text-[#c4536a]" : "border-[#e8ddd3] text-[#8b6f5e]"}`}>
                  {m === "cash" ? "Cash" : m.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Ghairi</Button>
            <Button className="flex-1 btn-rose" onClick={() => {
              if (!serviceId || !workerId || !amount) { toast.error("Jaza taarifa zote"); return; }
              createSale.mutate({ workerId: parseInt(workerId), serviceId: parseInt(serviceId), amount: parseFloat(amount), paymentMethod, customerName: customerName || undefined, date });
            }} disabled={createSale.isPending}>Hifadhi</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sales && sales.length > 0 ? sales.map((s: { id: number; serviceName: string | null; workerName: string | null; serviceId: number; workerId: number; amount: number; paymentMethod: string; customerName: string | null }) => (
          <div key={s.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#5a4035]">{s.serviceName || `Huduma #${s.serviceId}`}</p>
              <p className="text-xs text-[#a89080]">Fundi: {s.workerName || `#${s.workerId}`} | {s.paymentMethod}</p>
              {s.customerName && <p className="text-xs text-[#8b6f5e]">Mteja: {s.customerName}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c4536a]">Tsh {s.amount.toLocaleString()}</span>
              <button onClick={() => { if (confirm("Una uhakika?")) deleteSale.mutate({ id: s.id }); }} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : <p className="text-center text-[#a89080] py-8">Hakuna mauzo kwa siku hii.</p>}
      </div>
    </div>
  );
}

/* EXPENSES TAB */
function ExpensesTab({ date }: { date: string }) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"bidhaa" | "kodi" | "meme" | "maji" | "mshahara" | "mikopo" | "nyingine">("bidhaa");

  const { data: expenses, refetch } = trpc.expense.listByDate.useQuery({ date });

  const createExpense = trpc.expense.create.useMutation({
    onSuccess: () => { toast.success("Matumizi yameongezwa!"); setShowForm(false); setDescription(""); setAmount(""); refetch(); },
  });
  const deleteExpense = trpc.expense.delete.useMutation({
    onSuccess: () => { toast.success("Yamefutwa!"); refetch(); },
  });

  const catLabels: Record<string, string> = { bidhaa: "Bidhaa", kodi: "Kodi", meme: "Umeme", maji: "Maji", mshahara: "Mshahara", mikopo: "Mikopo", nyingine: "Nyingine" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#5a4035]">Matumizi ya {date}</h3>
        <Button size="sm" className="btn-rose" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" />Ongeza</Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <Input placeholder="Maelezo" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Kiasi (Tsh)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="h-10 rounded-lg border border-[#e8ddd3] px-2 text-sm">
              {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Ghairi</Button>
            <Button className="flex-1 btn-rose" onClick={() => { if (!description || !amount) return; createExpense.mutate({ description, amount: parseFloat(amount), category, date }); }}>Hifadhi</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {expenses && expenses.length > 0 ? expenses.map((e: { id: number; description: string; amount: number; category: string }) => (
          <div key={e.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#5a4035]">{e.description}</p>
              <span className="text-xs px-2 py-0.5 bg-[#f5e6d3] text-[#8b6f5e] rounded-full">{catLabels[e.category]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c4536a]">Tsh {e.amount.toLocaleString()}</span>
              <button onClick={() => { if (confirm("Una uhakika?")) deleteExpense.mutate({ id: e.id }); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        )) : <p className="text-center text-[#a89080] py-8">Hakuna matumizi kwa siku hii.</p>}
      </div>
    </div>
  );
}

/* TODO TAB */
function TodoTab() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"kodi" | "mikopo" | "mahitaji" | "mengine">("mengine");
  const [dueDate, setDueDate] = useState("");

  const { data: todos, refetch } = trpc.todo.list.useQuery();
  const createTodo = trpc.todo.create.useMutation({ onSuccess: () => { toast.success("Kikumbusho kimeongezwa!"); setShowForm(false); setTitle(""); setDescription(""); setDueDate(""); refetch(); } });
  const toggleTodo = trpc.todo.toggleComplete.useMutation({ onSuccess: () => refetch() });
  const deleteTodo = trpc.todo.delete.useMutation({ onSuccess: () => { toast.success("Kimefutwa!"); refetch(); } });

  const catColors: Record<string, string> = { kodi: "bg-orange-100 text-orange-700", mikopo: "bg-red-100 text-red-700", mahitaji: "bg-blue-100 text-blue-700", mengine: "bg-gray-100 text-gray-700" };
  const catLabels: Record<string, string> = { kodi: "Kodi", mikopo: "Mikopo", mahitaji: "Mahitaji", mengine: "Mengine" };

  const pending = todos?.filter((t: { isCompleted: boolean }) => !t.isCompleted) || [];
  const completed = todos?.filter((t: { isCompleted: boolean }) => t.isCompleted) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#5a4035]">Vikumbusho</h3>
        <Button size="sm" className="btn-rose" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" />Ongeza</Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <Input placeholder="Kichwa" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Maelezo (si lazima)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="h-10 rounded-lg border border-[#e8ddd3] px-2 text-sm">
              {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Ghairi</Button>
            <Button className="flex-1 btn-rose" onClick={() => { if (!title) return; createTodo.mutate({ title, description: description || undefined, category, dueDate: dueDate || undefined }); }}>Hifadhi</Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-[#8b6f5e] mb-2">Zinazosubiri ({pending.length})</h4>
        <div className="space-y-2">
          {pending.length > 0 ? pending.map((t: { id: number; title: string; description: string | null; category: string; dueDate: string | null; isCompleted: boolean }) => (
            <div key={t.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <button onClick={() => toggleTodo.mutate({ id: t.id })} className="w-6 h-6 rounded-full border-2 border-[#c4536a] flex items-center justify-center flex-shrink-0 hover:bg-[#fceef1]">
                <Check className="w-3 h-3 text-[#c4536a] opacity-0 hover:opacity-100" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#5a4035] text-sm">{t.title}</p>
                {t.description && <p className="text-xs text-[#a89080] truncate">{t.description}</p>}
                <div className="flex gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${catColors[t.category]}`}>{catLabels[t.category]}</span>
                  {t.dueDate && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{t.dueDate}</span>}
                </div>
              </div>
              <button onClick={() => { if (confirm("Una uhakika?")) deleteTodo.mutate({ id: t.id }); }} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          )) : <p className="text-center text-[#a89080] text-sm py-4">Hakuna vikumbusho vinavyosubiri.</p>}
        </div>
      </div>

      {completed.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#8b6f5e] mb-2">Zilizokamilika ({completed.length})</h4>
          <div className="space-y-2 opacity-60">
            {completed.map((t: { id: number; title: string; category: string; isCompleted: boolean }) => (
              <div key={t.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <button onClick={() => toggleTodo.mutate({ id: t.id })} className="w-6 h-6 rounded-full bg-[#c4536a] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#5a4035] text-sm line-through">{t.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{catLabels[t.category]}</span>
                </div>
                <button onClick={() => deleteTodo.mutate({ id: t.id })} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* LOANS TAB */
function LoansTab() {
  const [showForm, setShowForm] = useState(false);
  const [lenderName, setLenderName] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<number | null>(null);

  const { data: loans, refetch } = trpc.loan.list.useQuery();
  const { data: summary } = trpc.loan.summary.useQuery();
  const createLoan = trpc.loan.create.useMutation({ onSuccess: () => { toast.success("Mkopo umeongezwa!"); setShowForm(false); setLenderName(""); setAmount(""); refetch(); } });
  const makePayment = trpc.loan.makePayment.useMutation({ onSuccess: () => { toast.success("Malipo yamehifadhiwa!"); setPaymentAmount(""); setSelectedLoan(null); refetch(); } });
  const deleteLoan = trpc.loan.delete.useMutation({ onSuccess: () => { toast.success("Umefutwa!"); refetch(); } });

  const activeLoans = loans?.filter((l: { isPaidOff: boolean }) => !l.isPaidOff) || [];
  const paidLoans = loans?.filter((l: { isPaidOff: boolean }) => l.isPaidOff) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-[#8b6f5e]">Mikopo Yote</p>
          <p className="text-lg font-bold text-[#c4536a]">Tsh {(summary?.totalLoaned || 0).toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-[#8b6f5e]">Iliolipwa</p>
          <p className="text-lg font-bold text-green-600">Tsh {(summary?.totalPaid || 0).toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-[#8b6f5e]">Iliobaki</p>
          <p className="text-lg font-bold text-orange-600">Tsh {((summary?.totalLoaned || 0) - (summary?.totalPaid || 0)).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#5a4035]">Mikopo</h3>
        <Button size="sm" className="btn-rose" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" />Ongeza</Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <Input placeholder="Jina la Mkopeshaji" value={lenderName} onChange={(e) => setLenderName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Kiasi" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input type="number" placeholder="Riba (%)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#5a4035] block mb-1">Tarehe ya Kuanza</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#5a4035] block mb-1">Tarehe ya Kulipa</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Ghairi</Button>
            <Button className="flex-1 btn-rose" onClick={() => { if (!lenderName || !amount) return; createLoan.mutate({ lenderName, amount: parseFloat(amount), interestRate: interestRate ? parseFloat(interestRate) : 0, startDate, dueDate: dueDate || undefined }); }}>Hifadhi</Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-[#8b6f5e] mb-2">Inayolipwa ({activeLoans.length})</h4>
        <div className="space-y-2">
          {activeLoans.length > 0 ? activeLoans.map((l: { id: number; lenderName: string; amount: number; amountPaid: number | null; startDate: string; dueDate: string | null; isPaidOff: boolean }) => {
            const progress = Math.min(100, (((l.amountPaid || 0)) / l.amount) * 100);
            return (
              <div key={l.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#5a4035]">{l.lenderName}</p>
                    <p className="text-xs text-[#a89080]">Kuanzia: {l.startDate} {l.dueDate && `| Mwisho: ${l.dueDate}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#c4536a]">Tsh {l.amount.toLocaleString()}</p>
                    <p className="text-xs text-green-600">Imelipwa: Tsh {(l.amountPaid || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#f0e6d8] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-[#c4536a] to-[#d4a574] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex gap-2">
                  {selectedLoan === l.id ? (
                    <>
                      <Input type="number" placeholder="Kiasi cha kulipa" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="flex-1 h-9" />
                      <Button size="sm" className="btn-rose h-9" onClick={() => { if (!paymentAmount) return; makePayment.mutate({ id: l.id, amount: parseFloat(paymentAmount) }); }}>Lipa</Button>
                      <Button size="sm" variant="outline" className="h-9" onClick={() => { setSelectedLoan(null); setPaymentAmount(""); }}>Ghairi</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 h-9" onClick={() => setSelectedLoan(l.id)}>Lipa Mkopo</Button>
                      <button onClick={() => { if (confirm("Una uhakika?")) deleteLoan.mutate({ id: l.id }); }} className="text-red-400 hover:text-red-600 px-2"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          }) : <p className="text-center text-[#a89080] text-sm py-4">Hakuna mikopo inayolipwa.</p>}
        </div>
      </div>

      {paidLoans.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#8b6f5e] mb-2">Iliyolipwa ({paidLoans.length})</h4>
          <div className="space-y-2 opacity-60">
            {paidLoans.map((l: { id: number; lenderName: string; amount: number }) => (
              <div key={l.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#5a4035]">{l.lenderName}</p>
                  <p className="text-xs text-green-600">Imelipwa kabisa</p>
                </div>
                <span className="text-sm font-bold text-green-600">Tsh {l.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* VAULT TAB */
function VaultTab({ vaultUnlocked, setVaultUnlocked, vaultPin, setVaultPin, vaultData, vaultTotals }: {
  vaultUnlocked: boolean; setVaultUnlocked: (v: boolean) => void; vaultPin: string; setVaultPin: (v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vaultData: any;
  vaultTotals: { totalBank: number; totalCash: number; totalMobile: number; total: number } | null | undefined;
}) {
  const [showSetup, setShowSetup] = useState(false);
  const [setupPin, setSetupPin] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editBank, setEditBank] = useState(0);
  const [editCash, setEditCash] = useState(0);
  const [editMobile, setEditMobile] = useState(0);

  const setupVault = trpc.vault.setup.useMutation({ onSuccess: () => { toast.success("Vault umesetup!"); setShowSetup(false); setSetupPin(""); } });
  const updateVault = trpc.vault.update.useMutation({ onSuccess: () => { toast.success("Vault umesasishwa!"); setIsEditing(false); } });

  const verifyPinQuery = trpc.vault.verifyPin.useQuery(
    { pin: vaultPin },
    { enabled: false, retry: false }
  );

  if (!vaultTotals && !showSetup) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#fceef1] to-[#f5e6d3] flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#c4536a]" />
        </div>
        <h3 className="text-xl font-bold text-[#5a4035] mb-2">Private Vault</h3>
        <p className="text-[#8b6f5e] text-sm mb-4">Hifadhi siri yako ya kifedha. Weka PIN kwanza.</p>
        <Button className="btn-rose" onClick={() => setShowSetup(true)}>Setup Vault</Button>

        {showSetup && (
          <div className="mt-4 space-y-3">
            <Input type="password" placeholder="Weka PIN (nambari 4)" value={setupPin} onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} className="text-center tracking-widest" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSetup(false)}>Ghairi</Button>
              <Button className="flex-1 btn-rose" onClick={() => { if (setupPin.length !== 4) { toast.error("PIN lazima iwe nambari 4"); return; } setupVault.mutate({ pin: setupPin, bankBalance: 0, cashBalance: 0, mobileBalance: 0 }); }}>Setup</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!vaultUnlocked) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#fceef1] to-[#f5e6d3] flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#c4536a]" />
        </div>
        <h3 className="text-xl font-bold text-[#5a4035] mb-2">Private Vault</h3>
        <p className="text-[#8b6f5e] text-sm mb-4">Weka PIN kufungua vault.</p>
        <div className="space-y-3">
          <Input type="password" placeholder="****" value={vaultPin} onChange={(e) => setVaultPin(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} className="text-center tracking-widest text-2xl h-14" />
          <Button className="w-full btn-rose h-12" onClick={async () => {
            if (vaultPin.length !== 4) { toast.error("Weka PIN ya nambari 4"); return; }
            try {
              const result = await verifyPinQuery.refetch();
              if (result.data) {
                setVaultUnlocked(true);
                toast.success("Vault imefunguliwa!");
              } else {
                toast.error("PIN sio sahihi");
              }
            } catch {
              toast.error("PIN sio sahihi");
            }
          }}>Fungua</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#5a4035] flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Vault Umeufungua
        </h3>
        <div className="flex gap-2">
          {!isEditing && <Button size="sm" variant="outline" onClick={() => { setIsEditing(true); setEditBank(vaultData?.bankBalance || vaultTotals?.totalBank || 0); setEditCash(vaultData?.cashBalance || vaultTotals?.totalCash || 0); setEditMobile(vaultData?.mobileBalance || vaultTotals?.totalMobile || 0); }}>Hariri</Button>}
          <Button size="sm" variant="outline" onClick={() => { setVaultUnlocked(false); setVaultPin(""); }}>Funga</Button>
        </div>
      </div>

      {isEditing ? (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-[#5a4035] block mb-1">Benki (Tsh)</label>
            <Input type="number" value={editBank} onChange={(e) => setEditBank(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs text-[#5a4035] block mb-1">Cash (Tsh)</label>
            <Input type="number" value={editCash} onChange={(e) => setEditCash(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs text-[#5a4035] block mb-1">Mobile (Tsh)</label>
            <Input type="number" value={editMobile} onChange={(e) => setEditMobile(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Ghairi</Button>
            <Button className="flex-1 btn-rose" onClick={() => updateVault.mutate({ pin: vaultPin, bankBalance: editBank, cashBalance: editCash, mobileBalance: editMobile })}>Hifadhi</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-[#8b6f5e] mb-1">Benki</p>
              <p className="text-lg font-bold text-[#5a4035]">Tsh {(vaultData?.bankBalance || vaultTotals?.totalBank || 0).toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-[#8b6f5e] mb-1">Cash</p>
              <p className="text-lg font-bold text-[#5a4035]">Tsh {(vaultData?.cashBalance || vaultTotals?.totalCash || 0).toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-[#8b6f5e] mb-1">Mobile</p>
              <p className="text-lg font-bold text-[#5a4035]">Tsh {(vaultData?.mobileBalance || vaultTotals?.totalMobile || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-sm text-[#8b6f5e] mb-2">Jumla ya Mali Zote</p>
            <p className="text-3xl font-bold rose-gold-text">Tsh {(vaultData ? vaultData.bankBalance + vaultData.cashBalance + vaultData.mobileBalance : vaultTotals?.total || 0).toLocaleString()}</p>
            {vaultData?.lastUpdated && (
              <p className="text-xs text-[#a89080] mt-2">Mwisho kusasishwa: {new Date(vaultData.lastUpdated).toLocaleString("sw-TZ")}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
