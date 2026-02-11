import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  X,
  DollarSign,
  Database,
  Search,
  ShieldCheck,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from "lucide-react";

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Baseball");
  const [filterStatus, setFilterStatus] = useState("active");
  const [viewMode, setViewMode] = useState("spreadsheet");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [soldPrice, setSoldPrice] = useState("");

  const categories = [
    "Baseball",
    "Basketball",
    "Football",
    "Pokemon",
    "Soccer",
    "Topshelf",
  ];

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

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://card-inventory-app.onrender.com/api/cards",
      );
      setCards(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
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
      cards.filter(
        (c) =>
          c.category === activeCategory ||
          (c.card_id && c.card_id.startsWith(catCode)),
      ).length + 1;
    const newId = `${catCode}-${String(catCount).padStart(8, "0")}`;

    try {
      const submissionData = {
        ...formData,
        card_id: newId,
        category: activeCategory,
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
    try {
      await axios.put(
        `https://card-inventory-app.onrender.com/api/cards/${selectedCard.card_id}`,
        { is_sold: true, sold_price: soldPrice },
      );
      setIsSaleModalOpen(false);
      setSoldPrice("");
      fetchCards();
    } catch (err) {
      alert("Error recording sale.");
    }
  };

  const filteredCards = cards.filter((c) => {
    const catCodeMap = {
      Baseball: "BSB",
      Basketball: "BBL",
      Football: "FTB",
      Pokemon: "PKM",
      Soccer: "SCR",
      Topshelf: "TSH",
    };
    const targetCode = catCodeMap[activeCategory];
    const matchesCategory =
      c.category === activeCategory ||
      (c.card_id && c.card_id.startsWith(targetCode));
    const matchesSearch = c.card_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "active" ? !c.is_sold : c.is_sold;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Calculate Stats for the top bar
  const totalValue = filteredCards.reduce(
    (acc, card) => acc + parseFloat(card.purchase_price || 0),
    0,
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500 animate-pulse font-mono text-xs uppercase tracking-widest">
        Establishing_Secure_Link_...
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
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">
            Vault OS v2.3
          </p>
        </div>

        <div className="p-4 space-y-1 mt-4 flex-1">
          <p className="px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Categories
          </p>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                activeCategory === cat
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                  : "hover:bg-slate-800/40 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-3 font-bold uppercase text-[10px] tracking-tight">
                <Database
                  size={14}
                  className={
                    activeCategory === cat ? "text-blue-400" : "text-slate-700"
                  }
                />
                {cat}
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN PANEL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800/40 flex items-center justify-between px-10 bg-[#020617]">
          <div className="flex items-center gap-6">
            <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === "active" ? "bg-blue-600 text-white" : "text-slate-500"}`}
              >
                Vaulted
              </button>
              <button
                onClick={() => setFilterStatus("sold")}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === "sold" ? "bg-emerald-600 text-white" : "text-slate-500"}`}
              >
                Realized
              </button>
            </div>

            <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
              <button
                onClick={() => setViewMode("spreadsheet")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "spreadsheet" ? "bg-slate-700 text-white" : "text-slate-600"}`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("vault")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "vault" ? "bg-slate-700 text-white" : "text-slate-600"}`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-600"
                size={14}
              />
              <input
                type="text"
                placeholder={`Search...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-400/50 w-64 text-slate-200 transition-all"
              />
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-white hover:bg-blue-400 text-black font-black px-6 py-2.5 rounded-xl text-[10px] tracking-widest flex items-center gap-2 uppercase transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} /> New Intake
          </button>
        </header>

        {/* STATS BAR */}
        <div className="px-10 py-4 bg-[#020617] border-b border-slate-800/20 flex gap-8">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Total Assets
            </p>
            <p className="text-lg font-mono font-bold text-white">
              {filteredCards.length}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Vault Value
            </p>
            <p className="text-lg font-mono font-bold text-blue-400">
              $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#020617] to-[#0f172a]">
          {viewMode === "spreadsheet" ? (
            <div className="bg-[#0f172a]/80 rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/80 text-slate-600 text-[9px] uppercase font-black tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="p-5">Asset Identification</th>
                    <th className="p-5">Entry Price</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {filteredCards.map((card) => (
                    <tr
                      key={card.card_id}
                      className="border-b border-slate-800/20 hover:bg-blue-500/[0.03] transition-all"
                    >
                      <td className="p-5 flex items-center gap-4">
                        <img
                          src={card.image_url}
                          alt=""
                          className="w-8 h-12 object-cover rounded bg-slate-900 border border-slate-800"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <div>
                          <div className="text-[9px] font-mono text-blue-500 font-bold">
                            {card.card_id}
                          </div>
                          <div className="font-bold text-slate-100">
                            {card.card_name}
                          </div>
                          <div className="text-[8px] text-slate-500 uppercase">
                            {card.year} {card.set_name}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 font-mono text-slate-400">
                        ${card.purchase_price}
                      </td>
                      <td className="p-5 font-mono text-emerald-400">
                        {card.is_sold ? `$${card.sold_price}` : "VAULTED"}
                      </td>
                      <td className="p-5 text-right">
                        {!card.is_sold && (
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsSaleModalOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-1.5 rounded-lg text-[9px] uppercase transition-all"
                          >
                            Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.card_id}
                  className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group relative"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-900 relative">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-800">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[8px] font-mono text-blue-400 px-2 py-1 rounded border border-white/10 uppercase font-bold">
                      {card.card_id}
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-800/50">
                    <h3 className="font-bold text-slate-100 truncate text-xs">
                      {card.card_name}
                    </h3>
                    <p className="text-[9px] text-slate-500 mb-3 uppercase">
                      {card.year} {card.set_name}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-500 font-mono font-bold">
                        ${card.purchase_price}
                      </span>
                      {!card.is_sold && (
                        <button
                          onClick={() => {
                            setSelectedCard(card);
                            setIsSaleModalOpen(true);
                          }}
                          className="p-2 bg-slate-800 hover:bg-emerald-500 hover:text-black rounded-lg transition-all"
                        >
                          <DollarSign size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* INTAKE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-96 bg-[#0f172a] border-l border-slate-800 p-8 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">
                New Asset Intake
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="first_name"
                  placeholder="First Name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="year"
                  placeholder="Year"
                  required
                  value={formData.year}
                  onChange={handleInputChange}
                  className="bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
                <input
                  name="card_number"
                  placeholder="Card #"
                  required
                  value={formData.card_number}
                  onChange={handleInputChange}
                  className="bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <input
                name="set_name"
                placeholder="Set Name"
                required
                value={formData.set_name}
                onChange={handleInputChange}
                className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
              />
              <input
                name="purchase_price"
                placeholder="Buy Price"
                type="number"
                step="0.01"
                required
                value={formData.purchase_price}
                onChange={handleInputChange}
                className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
              />
              <input
                name="image_url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20"
              >
                Authorize Intake
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SALE MODAL */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsSaleModalOpen(false)}
          />
          <div className="relative bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xs font-black tracking-widest uppercase text-white mb-6 text-center">
              Confirm Realized Price
            </h2>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-3.5 text-emerald-500"
                  size={16}
                />
                <input
                  autoFocus
                  type="number"
                  step="0.01"
                  required
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500 text-emerald-400 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest"
              >
                Complete Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
