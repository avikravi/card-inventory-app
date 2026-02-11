import React, { useState, useEffect } from "react";
import axios from "axios";
import { LayoutGrid, List, Plus } from "lucide-react"; // Make sure to npm install lucide-react

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [activeVault, setActiveVault] = useState("Baseball");

  const vaults = ["Baseball", "Basketball", "Football", "Pokemon", "Soccer"];

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://card-inventory-app.onrender.com/api/cards",
      );
      setCards(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-sky-400 animate-pulse text-2xl font-bold">
        Ripping Packs...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans">
      {/* SIDEBAR */}
      <nav className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col backdrop-blur-md">
        <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-8">
          @DACARDBOIZ
        </h1>
        <div className="space-y-2">
          {vaults.map((v) => (
            <button
              key={v}
              onClick={() => setActiveVault(v)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                activeVault === v
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              {v} Vault
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold mb-1">
              {activeVault} Collection
            </h2>
            <p className="text-slate-400 font-medium">Accounting & Inventory</p>
          </div>

          <div className="flex items-center gap-4">
            {/* VIEW TOGGLE */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-700 text-sky-400 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-slate-700 text-sky-400 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
              >
                <List size={20} />
              </button>
            </div>

            <button className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
              <Plus size={20} /> Add Card
            </button>
          </div>
        </header>

        {/* BENTO STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl shadow-xl">
            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mb-1">
              Total Items
            </p>
            <h3 className="text-3xl font-black">{cards.length}</h3>
          </div>
          <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl shadow-xl border-b-4 border-b-sky-500">
            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mb-1">
              Vault Value
            </p>
            <h3 className="text-3xl font-black text-sky-400">
              ${totalValue.toLocaleString()}
            </h3>
          </div>
          <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl shadow-xl border-b-4 border-b-emerald-500">
            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mb-1">
              Total Profit
            </p>
            <h3 className="text-3xl font-black text-emerald-400">
              +${totalProfit.toLocaleString()}
            </h3>
          </div>
        </div>

        {viewMode === "grid" ? (
          /* BENTO GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cards.map((card) => (
              <div
                key={card.card_id}
                className="group bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-700 hover:border-sky-500 transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
              >
                <div className="aspect-[3/4] bg-slate-900 relative">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.card_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold italic">
                      NO IMAGE
                    </div>
                  )}
                  {card.is_rookie && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                      ROOKIE
                    </span>
                  )}
                  {card.is_sold && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="border-4 border-red-500/80 text-red-500 font-black px-4 py-1 rotate-12 text-2xl uppercase tracking-widest">
                        SOLD
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest mb-1">
                    {card.year} {card.set_name}
                  </p>
                  <h4 className="font-bold text-lg leading-tight mb-3 truncate">
                    {card.card_name || `${card.first_name} ${card.last_name}`}
                  </h4>
                  <div className="flex justify-between items-center border-t border-slate-700/50 pt-3">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {card.team_name}
                    </span>
                    <span className="text-emerald-400 font-black">
                      ${card.purchase_price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* SPREADSHEET TABLE VIEW */
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <th className="p-4 border-b border-slate-700">Card ID</th>
                  <th className="p-4 border-b border-slate-700">Player</th>
                  <th className="p-4 border-b border-slate-700">Year / Set</th>
                  <th className="p-4 border-b border-slate-700">Purchase</th>
                  <th className="p-4 border-b border-slate-700">Sold</th>
                  <th className="p-4 border-b border-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {cards.map((card) => (
                  <tr
                    key={card.card_id}
                    className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50"
                  >
                    <td className="p-4 font-mono text-sky-400">
                      {card.card_id}
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      {card.card_name || `${card.first_name} ${card.last_name}`}
                    </td>
                    <td className="p-4 text-slate-400">
                      {card.year} {card.set_name}
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">
                      ${card.purchase_price}
                    </td>
                    <td className="p-4 text-slate-300">
                      {card.sold_price ? `$${card.sold_price}` : "—"}
                    </td>
                    <td className="p-4">
                      {card.is_sold ? (
                        <span className="text-[10px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 uppercase">
                          Sold
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase">
                          Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
