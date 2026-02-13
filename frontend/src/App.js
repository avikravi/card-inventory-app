import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  DollarSign,
  Database,
  Search,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  LayoutGrid,
  List,
  X,
  ChevronRight,
  Package,
} from "lucide-react";

// --- SMART URL LOGIC ---
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://card-inventory-app.onrender.com";

function App() {
  // Core State
  const [cards, setCards] = useState([]);
  const [salesData, setSalesData] = useState({
    total_profit: 0,
    total_fees: 0,
    total_sales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState("checking");

  // UI State
  const [activeCategory, setActiveCategory] = useState("Baseball");
  const [filterStatus, setFilterStatus] = useState("active");
  const [viewMode, setViewMode] = useState("spreadsheet"); // options: 'spreadsheet', 'grid', 'accounting'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sale Form State
  const [soldPrice, setSoldPrice] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0.5);
  const [adFee, setAdFee] = useState(0);

  // Intake Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    year: "",
    set_name: "",
    card_number: "",
    purchase_price: "",
    image_url: "",
    is_rookie: false,
  });

  const categories = [
    "Baseball",
    "Basketball",
    "Football",
    "Pokemon",
    "Soccer",
    "Topshelf",
  ];

  // --- DATA FETCHING ---
  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cards`);
      // TARGETING response.data.data BASED ON YOUR RECENT JSON TEST
      const cardData = response.data.data || [];
      setCards(cardData);
      setBackendStatus("online");
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setBackendStatus("offline");
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales-report`);
      setSalesData(
        response.data || { total_profit: 0, total_fees: 0, total_sales: 0 },
      );
    } catch (err) {
      console.error("Sales Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    const codeMap = {
      Baseball: "BSB",
      Basketball: "BBL",
      Football: "FTB",
      Pokemon: "PKM",
      Soccer: "SCR",
      Topshelf: "TSH",
    };
    const catCode = codeMap[activeCategory] || "GEN";
    const catCount =
      cards.filter((c) => c.category === activeCategory).length + 1;
    const newId = `${catCode}-${String(catCount).padStart(8, "0")}`;

    try {
      const submissionData = {
        ...formData,
        card_id: newId,
        category: activeCategory,
        card_name: `${formData.first_name} ${formData.last_name}`.trim(),
      };
      await axios.post(`${API_BASE_URL}/api/cards`, submissionData);
      setFormData({
        first_name: "",
        last_name: "",
        year: "",
        set_name: "",
        card_number: "",
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

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    const ebayFees = parseFloat(soldPrice) * 0.1325 + 0.3;
    const netProfit =
      parseFloat(soldPrice) -
      ebayFees -
      parseFloat(adFee) -
      parseFloat(shippingCost) -
      parseFloat(packagingCost) -
      parseFloat(selectedCard.purchase_price);

    try {
      await axios.put(`${API_BASE_URL}/api/cards/${selectedCard.card_id}`, {
        is_sold: true,
        sold_price: soldPrice,
        ebay_fees: ebayFees.toFixed(2),
        ad_fee: adFee,
        shipping_cost: shippingCost,
        packaging_material_cost: packagingCost,
        net_profit: netProfit.toFixed(2),
      });

      setIsSaleModalOpen(false);
      setSoldPrice("");
      setAdFee(0);
      fetchCards();
      fetchSales();
    } catch (err) {
      alert("Error recording sale.");
    }
  };

  // --- FILTERING ---
  const filteredCards = cards.filter((c) => {
    const matchesCategory =
      viewMode === "accounting" ? true : c.category === activeCategory;
    const matchesSearch = c.card_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "active" ? !c.is_sold : c.is_sold;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const totalVaultValue = cards
    .filter((c) => !c.is_sold)
    .reduce((acc, card) => acc + parseFloat(card.purchase_price || 0), 0);

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-mono">
        <div className="text-blue-500 animate-pulse text-xs uppercase tracking-[0.5em] mb-4">
          Initializing_Vault_OS_...
        </div>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans text-sm flex overflow-hidden">
      {/* SIDEBAR */}
      <nav className="w-64 bg-[#0f172a] border-r border-slate-800/60 flex flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-slate-800/40">
          <div className="flex items-center gap-2 text-white mb-1">
            <ShieldCheck className="text-blue-400" size={20} />
            <h1 className="text-lg font-black italic tracking-tighter uppercase">
              @Dacardboiz
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${backendStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
            ></div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Node.js: {backendStatus}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-1 mt-4 flex-1">
          <p className="px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Navigation
          </p>
          <button
            onClick={() => {
              setViewMode("spreadsheet");
              setFilterStatus("active");
            }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase text-[10px] ${viewMode !== "accounting" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:bg-slate-800/40"}`}
          >
            <Database size={14} /> Inventory
          </button>
          <button
            onClick={() => setViewMode("accounting")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase text-[10px] ${viewMode === "accounting" ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:bg-slate-800/40"}`}
          >
            <BarChart3 size={14} /> Accounting
          </button>

          {viewMode !== "accounting" && (
            <>
              <p className="px-4 py-2 mt-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Vault Sectors
              </p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase flex items-center justify-between ${activeCategory === cat ? "text-blue-400 bg-blue-400/5" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"}`}
                >
                  {cat}
                  {activeCategory === cat && <ChevronRight size={10} />}
                </button>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-800/40 flex items-center justify-between px-10 bg-[#020617] shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              {viewMode === "accounting"
                ? "Financial Ledger"
                : `${activeCategory} Protocol`}
            </h2>

            {viewMode !== "accounting" && (
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800 shadow-inner">
                  <button
                    onClick={() => setFilterStatus("active")}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === "active" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"}`}
                  >
                    Vaulted
                  </button>
                  <button
                    onClick={() => setFilterStatus("sold")}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === "sold" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"}`}
                  >
                    Realized
                  </button>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setViewMode("spreadsheet")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "spreadsheet" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-400"}`}
                    title="Table View"
                  >
                    <List size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-400"}`}
                    title="Gallery View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-3 top-2.5 text-slate-600 group-focus-within:text-blue-400 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search Asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/50 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-400/50 focus:bg-slate-900 w-64 text-slate-200 transition-all shadow-inner"
              />
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-white hover:bg-blue-400 text-black font-black px-6 py-2.5 rounded-xl text-[10px] tracking-widest flex items-center gap-2 uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={14} /> Intake
            </button>
          </div>
        </header>

        {/* DYNAMIC SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#020617] to-[#0f172a] scrollbar-hide">
          {viewMode === "accounting" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Database size={40} />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Portfolio Asset Value
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-400">
                    ${totalVaultValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Package size={40} />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Cumulative Expenses
                  </p>
                  <p className="text-2xl font-mono font-bold text-red-400">
                    ${parseFloat(salesData.total_fees || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={40} />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Net Realized Profit
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-mono font-bold text-emerald-400">
                      +${parseFloat(salesData.total_profit || 0).toFixed(2)}
                    </p>
                    <ArrowUpRight
                      className="text-emerald-500 animate-bounce"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* SALES LEDGER */}
              <div className="bg-[#0f172a]/80 rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <BarChart3 size={14} className="text-emerald-500" />{" "}
                    Transaction History
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    {salesData.total_sales} Settlements Found
                  </span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900/80 text-slate-600 text-[9px] uppercase font-black tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="p-5">Asset</th>
                      <th className="p-5">Sale Price</th>
                      <th className="p-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {cards
                      .filter((c) => c.is_sold)
                      .map((card) => (
                        <tr
                          key={card.card_id}
                          className="border-b border-slate-800/20 hover:bg-emerald-500/[0.02] transition-colors"
                        >
                          <td className="p-5">
                            <div className="font-bold text-slate-100">
                              {card.card_name}
                            </div>
                            <div className="text-[9px] font-mono text-slate-500">
                              {card.card_id}
                            </div>
                          </td>
                          <td className="p-5 font-mono text-white">
                            ${card.sold_price}
                          </td>
                          <td className="p-5 text-right text-[10px] text-emerald-500/80 uppercase font-bold px-5 italic">
                            Settled_Success
                          </td>
                        </tr>
                      ))}
                    {cards.filter((c) => c.is_sold).length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-20 text-center text-slate-600 text-[10px] uppercase tracking-widest"
                        >
                          No realized gains found in database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in zoom-in-95 duration-500">
              {filteredCards.map((card) => (
                <div
                  key={card.card_id}
                  className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl hover:-translate-y-1"
                >
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img
                      src={
                        card.image_url ||
                        "https://via.placeholder.com/300x400/0f172a/3b82f6?text=No+Image"
                      }
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-blue-400 font-bold border border-white/10 uppercase shadow-lg">
                      {card.card_id}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-tighter">
                      {card.year} {card.set_name}
                    </p>
                    <h3 className="text-sm font-black text-white truncate mb-3">
                      {card.card_name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-slate-500 font-bold tracking-widest">
                          Entry
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          ${card.purchase_price}
                        </span>
                      </div>
                      {!card.is_sold && (
                        <button
                          onClick={() => {
                            setSelectedCard(card);
                            setIsSaleModalOpen(true);
                          }}
                          className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                        >
                          <TrendingUp size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a]/80 rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/80 text-slate-600 text-[9px] uppercase font-black tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="p-5">Asset Identification</th>
                    <th className="p-5">Year</th>
                    <th className="p-5">Entry Price</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {filteredCards.map((card) => (
                    <tr
                      key={card.card_id}
                      className="border-b border-slate-800/20 hover:bg-blue-500/[0.03] transition-colors group"
                    >
                      <td className="p-5 flex items-center gap-4">
                        <div className="relative w-10 h-14 shrink-0 overflow-hidden rounded bg-slate-900 border border-slate-800">
                          <img
                            src={card.image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-125 transition-transform"
                          />
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-blue-500 font-bold tracking-widest">
                            {card.card_id}
                          </div>
                          <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {card.card_name}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-400 font-mono">
                        {card.year}
                      </td>
                      <td className="p-5 font-mono text-slate-400">
                        ${card.purchase_price}
                      </td>
                      <td className="p-5">
                        {card.is_sold ? (
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <ArrowUpRight size={12} /> ${card.sold_price}
                          </span>
                        ) : (
                          <span className="text-blue-500/40 font-black text-[9px] tracking-[0.2em] uppercase border border-blue-500/20 px-2 py-1 rounded">
                            Vaulted
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        {!card.is_sold && (
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsSaleModalOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-1.5 rounded-lg text-[9px] uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          >
                            Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCards.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center text-slate-600 text-[10px] uppercase tracking-widest"
                      >
                        No assets found in {activeCategory} sector
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS & DRAWERS --- */}

      {/* SALE MODAL */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsSaleModalOpen(false)}
          />
          <div className="relative bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" /> Finalize
                Payout
              </h2>
              <button
                onClick={() => setIsSaleModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="bg-[#020617] rounded-xl p-4 border border-slate-800/50 mb-2">
                <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">
                  Asset Release
                </p>
                <p className="text-sm font-bold text-white">
                  {selectedCard?.card_name}
                </p>
              </div>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-3.5 text-emerald-500"
                  size={16}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Gross Sale Price"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-emerald-400 font-bold outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase font-black ml-1">
                    Ad Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adFee}
                    onChange={(e) => setAdFee(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase font-black ml-1">
                    Logistics
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 uppercase font-black ml-1">
                  Materials
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20 mt-2"
              >
                Execute Settlement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INTAKE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-96 bg-[#0f172a] border-l border-slate-800 p-8 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">
                Vault Intake Protocol
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleIntakeSubmit}
              className="space-y-5 overflow-y-auto pr-2 scrollbar-hide"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Asset Details
                </label>
                <input
                  name="first_name"
                  placeholder="First Name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                />
                <input
                  name="year"
                  placeholder="Series Year (e.g. 2024)"
                  required
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Financials
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-4 text-emerald-500"
                    size={14}
                  />
                  <input
                    name="purchase_price"
                    placeholder="Entry Price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-10 pr-4 py-4 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Visual Asset
                </label>
                <input
                  name="image_url"
                  placeholder="Direct Image URL"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#020617] rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  name="is_rookie"
                  checked={formData.is_rookie}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-500 focus:ring-0 outline-none"
                />
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Rookie Designation
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-600/20 sticky bottom-0"
              >
                Authorize Intake
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
