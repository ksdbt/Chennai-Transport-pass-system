import { useState } from "react";
import api from "../api/axios";

export default function Payment() {
  const [method, setMethod] = useState(""); // UPI / Card / Wallet
  const [subMethod, setSubMethod] = useState(""); // GPay / Visa / etc
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert("⚠️ Please enter a valid amount");
      return;
    }
    if (!method) {
      alert("⚠️ Please select a payment method");
      return;
    }
    if ((method === "UPI" || method === "Card" || method === "Wallet") && !subMethod) {
      alert(`⚠️ Please choose a ${method} option`);
      return;
    }

    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      const res = await api.post(
        "http://localhost:5000/api/payment/buy-pass",
        {
          amount,
          mode: method,          // main method (UPI / Card / Wallet)
          method: subMethod,     // sub-method (GPay / Visa / etc.)
          startLocation: "Station A",
          endLocation: "Station B",
          validFrom: "2025-09-01",
          validTill: "2025-09-30",
          passType: "Monthly",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert(`✅ Payment successful! Pass ID: ${res.data.pass._id}`);
    } catch (err) {
      console.error("❌ Payment failed", err.response?.data || err.message);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4 text-blue-700">💳 Make Payment</h2>

      {/* Amount */}
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        min="1"
        required
      />

      {/* Main Method */}
      <label className="block mb-2 font-medium">Select Payment Method:</label>
      <select
        value={method}
        onChange={(e) => {
          setMethod(e.target.value);
          setSubMethod(""); // reset when method changes
        }}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Choose --</option>
        <option value="UPI">UPI</option>
        <option value="Card">Card</option>
        <option value="Wallet">Wallet</option>
      </select>

      {/* Sub Options */}
      {method === "UPI" && (
        <select
          value={subMethod}
          onChange={(e) => setSubMethod(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Choose UPI App --</option>
          <option value="Google Pay">Google Pay</option>
          <option value="PhonePay">PhonePay</option>
          <option value="Paytm">Paytm</option>
        </select>
      )}

      {method === "Card" && (
        <select
          value={subMethod}
          onChange={(e) => setSubMethod(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Choose Card Type --</option>
          <option value="Visa">Visa</option>
          <option value="MasterCard">MasterCard</option>
          <option value="RuPay">RuPay</option>
        </select>
      )}

      {method === "Wallet" && (
        <select
          value={subMethod}
          onChange={(e) => setSubMethod(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">-- Choose Wallet --</option>
          <option value="Amazon Pay">Amazon Pay</option>
          <option value="Mobikwik">Mobikwik</option>
          <option value="Freecharge">Freecharge</option>
        </select>
      )}

      {/* Payment Summary */}
      {method && (
        <p className="text-sm text-gray-600 mb-2">
          You are paying <strong>₹{amount || "0"}</strong> via{" "}
          <strong>{subMethod || method}</strong>
        </p>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
