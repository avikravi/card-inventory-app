import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [sortField, setSortField] = useState("card_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeVault, setActiveVault] = useState("Baseball");
  const [formData, setFormData] = useState({
    card_name: "",
    first_name: "",
    last_name: "",
    year: "",
    set_name: "",
    card_number: "",
    team_city: "",
    team_name: "",
    is_rookie: false,
    purchase_price: "0.00",
    sold_price: "",
    is_sold: false,
    sold_date: "",
    image_url: "",
    ebay_url: "",
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
      setError("Failed to fetch cards");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await axios.patch(
          `https://card-inventory-app.onrender.com/api/cards/${editingCard.card_id}`,
          formData,
        );
      } else {
        await axios.post(
          "https://card-inventory-app.onrender.com/api/cards",
          formData,
        );
      }

      setFormData({
        card_name: "",
        first_name: "",
        last_name: "",
        year: "",
        set_name: "",
        card_number: "",
        team_city: "",
        team_name: "",
        is_rookie: false,
        purchase_price: "0.00",
        sold_price: "",
        is_sold: false,
        sold_date: "",
        image_url: "",
        ebay_url: "",
      });
      setShowForm(false);
      setEditingCard(null);
      fetchCards();
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save card");
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      card_name: card.card_name,
      first_name: card.first_name || "",
      last_name: card.last_name || "",
      year: card.year,
      set_name: card.set_name,
      card_number: card.card_number,
      team_city: card.team_city,
      team_name: card.team_name,
      is_rookie: card.is_rookie,
      purchase_price: card.purchase_price,
      sold_price: card.sold_price || "",
      is_sold: card.is_sold || false,
      sold_date: card.sold_date || "",
      image_url: card.image_url || "",
      ebay_url: card.ebay_url || "",
    });
    setShowForm(true);
  };

  const handleMarkSold = async (card) => {
    const soldPrice = prompt("Enter sold price:");
    if (soldPrice === null) return;

    const soldDate = new Date().toISOString().split("T")[0];

    try {
      await axios.patch(
        `https://card-inventory-app.onrender.com/api/cards/${card.card_id}`,
        {
          ...card,
          sold_price: parseFloat(soldPrice),
          is_sold: true,
          sold_date: soldDate,
        },
      );
      fetchCards();
    } catch (err) {
      console.error("Error marking card as sold:", err);
      alert("Failed to mark card as sold");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCard(null);
    setFormData({
      card_name: "",
      first_name: "",
      last_name: "",
      year: "",
      set_name: "",
      card_number: "",
      team_city: "",
      team_name: "",
      is_rookie: false,
      purchase_price: "0.00",
      sold_price: "",
      is_sold: false,
      sold_date: "",
      image_url: "",
      ebay_url: "",
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedCards = () => {
    const sorted = [...cards].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (
        sortField === "year" ||
        sortField === "purchase_price" ||
        sortField === "sold_price"
      ) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const calculateProfit = (card) => {
    if (card.is_sold && card.sold_price && card.purchase_price) {
      return (
        parseFloat(card.sold_price) - parseFloat(card.purchase_price)
      ).toFixed(2);
    }
    return null;
  };

  const calculateTotalProfit = () => {
    return cards
      .filter((card) => card.is_sold)
      .reduce((sum, card) => {
        const profit =
          parseFloat(card.sold_price || 0) -
          parseFloat(card.purchase_price || 0);
        return sum + profit;
      }, 0)
      .toFixed(2);
  };

  if (loading) return <div className="loading">Loading your vault...</div>;
  if (error) return <div className="error">{error}</div>;

  const sortedCards = getSortedCards();
  const totalProfit = calculateTotalProfit();
  const soldCount = cards.filter((card) => card.is_sold).length;

  return (
    <div className="App">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>@dacardboiz</h2>
          <p>Card Vaults</p>
        </div>
        <ul className="vault-list">
          {vaults.map((vault) => (
            <li
              key={vault}
              className={activeVault === vault ? "active" : ""}
              onClick={() => setActiveVault(vault)}
            >
              {vault}
            </li>
          ))}
        </ul>
      </nav>

      <div className="main-content">
        <header className="vault-header">
          <div className="header-content">
            <h1>⚾ {activeVault} Card Vault</h1>
          </div>
          <div className="stats-bar">
            <span>Total Cards: {cards.length}</span>
            <span>Sold: {soldCount}</span>
            <span>
              Total Value: $
              {cards
                .reduce((sum, card) => sum + parseFloat(card.purchase_price), 0)
                .toFixed(2)}
            </span>
            <span
              className={
                parseFloat(totalProfit) >= 0
                  ? "profit-positive"
                  : "profit-negative"
              }
            >
              Profit: ${totalProfit}
            </span>
            <button className="add-card-btn" onClick={() => setShowForm(true)}>
              + Add Card
            </button>
          </div>
        </header>

        {showForm && (
          <div className="form-container" onClick={handleCloseForm}>
            <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h2>{editingCard ? "Edit Card" : "Add New Card"}</h2>
                <button
                  type="button"
                  className="close-btn"
                  onClick={handleCloseForm}
                >
                  ×
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Set Name *</label>
                <input
                  type="text"
                  name="set_name"
                  value={formData.set_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Team City *</label>
                  <input
                    type="text"
                    name="team_city"
                    value={formData.team_city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Team Name *</label>
                  <input
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_rookie"
                      checked={formData.is_rookie}
                      onChange={handleInputChange}
                    />
                    Rookie Card
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sold Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="sold_price"
                    value={formData.sold_price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sold Date</label>
                  <input
                    type="date"
                    name="sold_date"
                    value={formData.sold_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div
                className="form-group checkbox-group"
                style={{ marginBottom: "1rem" }}
              >
                <label>
                  <input
                    type="checkbox"
                    name="is_sold"
                    checked={formData.is_sold}
                    onChange={handleInputChange}
                  />
                  Mark as Sold
                </label>
              </div>

              <div className="form-group">
                <label>Image URL (eBay or other)</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://i.ebayimg.com/..."
                />
              </div>

              <div className="form-group">
                <label>eBay Listing URL</label>
                <input
                  type="url"
                  name="ebay_url"
                  value={formData.ebay_url}
                  onChange={handleInputChange}
                  placeholder="https://www.ebay.com/itm/..."
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCard ? "Update Card" : "Add Card to Vault"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="card-table">
            <thead>
              <tr>
                <th>Image</th>
                <th className="sortable" onClick={() => handleSort("card_id")}>
                  ID{" "}
                  {sortField === "card_id" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th>Player</th>
                <th>Team</th>
                <th className="sortable" onClick={() => handleSort("year")}>
                  Year{" "}
                  {sortField === "year" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th>Set</th>
                <th>Card #</th>
                <th>RC</th>
                <th
                  className="sortable"
                  onClick={() => handleSort("purchase_price")}
                >
                  Buy ${" "}
                  {sortField === "purchase_price" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort("sold_price")}
                >
                  Sold ${" "}
                  {sortField === "sold_price" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th>Profit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCards.map((card) => {
                const profit = calculateProfit(card);
                const playerName =
                  card.first_name && card.last_name
                    ? `${card.first_name} ${card.last_name}`
                    : card.card_name;

                return (
                  <tr
                    key={card.card_id}
                    className={card.is_sold ? "sold-row" : ""}
                  >
                    <td
                      className="image-cell"
                      style={
                        card.image_url
                          ? { "--zoom-image": `url(${card.image_url})` }
                          : {}
                      }
                    >
                      {card.image_url ? (
                        <img src={card.image_url} alt={playerName} />
                      ) : (
                        <div className="no-image">{card.card_number}</div>
                      )}
                    </td>
                    <td className="id-cell">{card.card_id}</td>
                    <td className="player-cell">{playerName}</td>
                    <td>
                      {card.team_city} {card.team_name}
                    </td>
                    <td>{card.year}</td>
                    <td>{card.set_name}</td>
                    <td>{card.card_number}</td>
                    <td className="rookie-cell">
                      {card.is_rookie ? (
                        <span className="rookie-badge">✓</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="price-cell">
                      ${parseFloat(card.purchase_price).toFixed(2)}
                    </td>
                    <td className="price-cell">
                      {card.sold_price
                        ? `$${parseFloat(card.sold_price).toFixed(2)}`
                        : "—"}
                    </td>
                    <td
                      className={
                        profit && parseFloat(profit) >= 0
                          ? "profit-positive"
                          : "profit-negative"
                      }
                    >
                      {profit ? `$${profit}` : "—"}
                    </td>
                    <td className="status-cell">
                      {card.is_sold ? (
                        <span className="sold-badge">SOLD</span>
                      ) : (
                        <span className="available-badge">Available</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {!card.is_sold && card.ebay_url && (
                          <a
                            href={card.ebay_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="buy-btn"
                          >
                            Buy
                          </a>
                        )}
                        {!card.is_sold && (
                          <button
                            className="sold-btn"
                            onClick={() => handleMarkSold(card)}
                          >
                            Mark Sold
                          </button>
                        )}
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(card)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
