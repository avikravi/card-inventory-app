import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutGrid,
  List,
  Plus,
  X,
  Image as ImageIcon,
  TrendingUp,
  DollarSign,
  Database,
  Search,
} from "lucide-react";

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [activeVault, setActiveVault] = useState("Baseball");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    year: "",
    set_name: "",
    card_number: "",
    team_city: "",
    team_name: "",
    purchase_price: "",
    image_url: "",
    is_rookie: false,
  });

  const vaults = ["Baseball", "Basketball", "Football", "Pokemon", "Soccer"];

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://card-inventory-app.onrender.com/api/cards",
      );
      setCards(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        card_name: `${formData.first_name} ${formData.last_name}`.trim(),
      };
      await axios.post(
        "https://card-inventory-app.onrender.com/api/cards",
        submissionData,
      );
      setFormData({
        first_name: "",
        last_name: "",
        year: "",
        set_name: "",
        card_number: "",
        team_city: "",
        team_name: "",
        purchase_price: "",
        image_url: "",
        is_rookie: false,
      });
      setIsDrawerOpen(false);
      fetchCards();
    } catch (err) {
      alert("Error adding asset.");
    }
  };

  const filteredCards = cards.filter(
    (c) =>
      c.card_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.set_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalValue = cards.reduce(
    (sum, c) => sum + parseFloat(c.purchase_price || 0),
    0,
  );
  const totalProfit = cards
    .filter((c) => c.is_sold)
    .reduce(
      (sum, c) =>
        sum +
        (parseFloat(c.sold_price || 0) - parseFloat(c.purchase_price || 0)),
      0,
    );

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500 animate-pulse font-mono text-xs tracking-widest uppercase">
        Initialising_Vault_System...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans text-sm overflow-hidden">
      {/* SIDEBAR */}
      <nav className="w-56 bg-[#0f172a] border-r border-slate-800/40 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800/40">
          <h1 className="text-lg font-black tracking-tighter text-white italic">
            @DACARDBOIZ{" "}
            <span className="text-blue-500 text-[10px] not-italic ml-1 tracking-normal font-bold">
              PRO
            </span>
          </h1>
        </div>
        <div className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Vault Segments
          </p>
          {vaults.map((v) => (
            <button
              key={v}
              onClick={() => setActiveVault(v)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 font-semibold ${
                activeVault === v
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "hover:bg-slate-800/50 text-slate-500"
              }`}
            >
              <Database size={14} /> {v}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-8 bg-[#020617]">
          <div className="flex items-center gap-6">
            <h2 className="text-xs font-black text-white uppercase tracking-widest">
              {activeVault} Assets
            </h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-600"
                size={14}
              />
              <input
                type="text"
                placeholder="Search global index..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:border-blue-500/40 w-80 text-slate-200 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-slate-800 text-blue-400" : "text-slate-600 hover:text-slate-400"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-slate-800 text-blue-400" : "text-slate-600 hover:text-slate-400"}`}
              >
                <List size={14} />
              </button>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-[10px] tracking-widest flex items-center gap-2 transition-transform active:scale-95 uppercase"
            >
              <Plus size={14} /> Intake
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* COMPACT STATS */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Asset Count",
                val: filteredCards.length,
                icon: <Database />,
                color: "text-white",
              },
              {
                label: "Buy Basis",
                val: `$${totalValue.toLocaleString()}`,
                icon: <DollarSign />,
                color: "text-blue-400",
              },
              {
                label: "Net Gain",
                val: `+$${totalProfit.toLocaleString()}`,
                icon: <TrendingUp />,
                color: "text-emerald-400",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#0f172a] border border-slate-800/40 p-4 rounded-xl flex items-center justify-between border-l-2 border-l-slate-700"
              >
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {s.label}
                  </p>
                  <h3
                    className={`text-xl font-black ${s.color} tracking-tight`}
                  >
                    {s.val}
                  </h3>
                </div>
                <div className="text-slate-800">
                  {React.cloneElement(s.icon, { size: 18 })}
                </div>
              </div>
            ))}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCards.map((card) => (
                <div
                  key={card.card_id}
                  className="bg-[#0f172a] border border-slate-800/40 rounded-lg overflow-hidden hover:border-blue-500/40 transition-all group"
                >
                  <div className="aspect-[3/4] bg-slate-900 relative">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.card_name}
                        className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {card.is_rookie && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase italic">
                        RC
                      </span>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-800/40 bg-slate-900/20">
                    <p className="text-[9px] font-bold text-blue-500 uppercase truncate mb-0.5 tracking-tighter">
                      {card.year} {card.set_name}
                    </p>
                    <h4 className="font-bold text-slate-100 truncate text-xs">
                      {card.card_name}
                    </h4>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/30 font-mono text-[10px]">
                      <span className="text-emerald-500 font-bold">
                        ${card.purchase_price}
                      </span>
                      <span className="text-slate-600 font-black">
                        #{card.card_number}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/40 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/80 text-slate-500 text-[9px] uppercase font-black tracking-widest border-b border-slate-800/40">
                  <tr>
                    <th className="p-4">Asset Label</th>
                    <th className="p-4 text-center">Year</th>
                    <th className="p-4">Series Info</th>
                    <th className="p-4 text-right">Entry $</th>
                    <th className="p-4 text-right">Exit $</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {filteredCards.map((card) => (
                    <tr
                      key={card.card_id}
                      className="hover:bg-blue-500/[0.03] border-b border-slate-800/10 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-100 font-bold group-hover:text-blue-400 transition-colors tracking-tight">
                            {card.card_name}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">
                            {card.team_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-slate-400 font-mono tracking-tighter">
                        {card.year}
                      </td>
                      <td className="p-4 text-slate-500 uppercase text-[10px] tracking-tighter">
                        {card.set_name}{" "}
                        <span className="text-slate-700 font-black ml-1">
                          #{card.card_number}
                        </span>
                      </td>
                      <td className="p-4 text-right text-emerald-500 font-bold font-mono">
                        ${card.purchase_price}
                      </td>
                      <td className="p-4 text-right text-blue-400 font-bold font-mono">
                        {card.sold_price ? `$${card.sold_price}` : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded border ${card.is_sold ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                        >
                          {card.is_sold ? "SOLD" : "VAULTED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* COMPACT INTAKE DRAWER */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-96 bg-[#0f172a] border-l border-slate-800 z-50 p-8 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">
                  Asset Intake
                </h2>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">
                  Register new vault entry
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500/40 text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500/40 text-white font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Year
                  </label>
                  <input
                    name="year"
                    type="number"
                    required
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500/40 text-white font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Set Name
                  </label>
                  <input
                    name="set_name"
                    required
                    value={formData.set_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500/40 text-white font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Card #
                  </label>
                  <input
                    name="card_number"
                    required
                    value={formData.card_number}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500/40 text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Buy Basis ($)
                  </label>
                  <input
                    name="purchase_price"
                    type="number"
                    required
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-emerald-500/40 text-emerald-400 font-bold"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  Rookie Designation
                </label>
                <input
                  name="is_rookie"
                  type="checkbox"
                  checked={formData.is_rookie}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-lg shadow-lg shadow-blue-500/10 uppercase tracking-[0.2em] text-[10px] mt-4 transition-all active:scale-[0.98]"
              >
                Execute Intake
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
