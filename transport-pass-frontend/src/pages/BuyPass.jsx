import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";
import { locationConfig, toSelectOptions } from "../api/locationConfig";
import api from "../api/axios";

function BuyPass() {
  const [mode, setMode] = useState("Bus");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passType, setPassType] = useState("One Day");
  const [validFrom, setValidFrom] = useState("");
  const [validTill, setValidTill] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Role-based access control
    if (user?.role !== "Passenger") {
      navigate("/dashboard");
      return;
    }

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setValidFrom(today);
    setValidTill(passType === "One Day" ? today : calculateValidTill(today, passType));
  }, [user, navigate, passType]);

  // Keep validTill in sync when One Day is selected
  useEffect(() => {
    if (passType === "One Day" && validFrom) {
      setValidTill(validFrom);
    } else if (validFrom) {
      setValidTill(calculateValidTill(validFrom, passType));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passType, validFrom]);

  // ------------------ Location Lists ------------------ //
  const busOptions = toSelectOptions(locationConfig.Bus);
  const trainOptions = toSelectOptions(locationConfig.Train);
  const metroOptions = toSelectOptions(locationConfig.Metro);

  // ------------------ Helpers ------------------ //
  const calculateValidTill = (startDate, type) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    if (type === "Weekly") date.setDate(date.getDate() + 6);
    else if (type === "Monthly") date.setDate(date.getDate() + 29);
    return date.toISOString().split("T")[0];
  };

  const getOptions = () => {
    if (mode === "Bus") return busOptions;
    if (mode === "Train") return trainOptions;
    if (mode === "Metro") return metroOptions;
    return [];
  };

  const getDistance = (start, end) => {
    if (!start || !end || start === end) return 2;
    const all = getOptions().map((opt) => opt.value);
    const fromIndex = all.indexOf(start);
    const toIndex = all.indexOf(end);
    return Math.abs(fromIndex - toIndex) * 2 || 4;
  };

  const calculatePrice = () => {
    if (mode === "All-in-One") {
      if (passType === "One Day") return 100;
      if (passType === "Weekly") return 400;
      if (passType === "Monthly") return 1000;
    }
    const baseFare = 10;
    const distance = getDistance(from, to);
    let cost = baseFare * distance;
    if (passType === "Weekly") cost *= 5;
    if (passType === "Monthly") cost *= 20;
    return Math.max(Math.round(cost), 10);
  };

  const getPassTypeIcon = (mode) => {
    switch (mode) {
      case "Bus": return "🚌";
      case "Train": return "🚆";
      case "Metro": return "🚇";
      case "All-in-One": return "🎫";
      default: return "🎫";
    }
  };

  // Payment icon helper (currently unused but kept for future use)
  // const getPaymentIcon = (method) => {
  //   switch (method) {
  //     case "UPI": return "📱";
  //     case "Card": return "💳";
  //     case "Stripe": return "💳";
  //     case "Wallet": return "👛";
  //     default: return "💰";
  //   }
  // };

  // ------------------ Form Submit ------------------ //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setLoading(false);
      return;
    }

const finalPrice = calculatePrice();
if (!mode || !passType || !validFrom || !validTill || !finalPrice) {
      alert("Missing required fields");
      setLoading(false);
      return;
}

const passDetails = {
  amount: finalPrice,
  mode,
  startLocation: mode === "All-in-One" ? "All Zones" : from,
  endLocation: mode === "All-in-One" ? "All Zones" : to,
  validFrom,
  validTill,
  passType,
  method: paymentMethod === "UPI" ? upiApp : paymentMethod,
};

    console.log("🚀 Submitting payment request:", passDetails);

try {
      // Step 1: Process payment
  if (paymentMethod === "Stripe") {
        console.log("💳 Processing Stripe payment...");
    await api.post(
      "http://localhost:5000/api/payment/create-session",
      { price: finalPrice },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } else {
        // Mock payment processing
        console.log("💰 Processing mock payment...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("✅ Mock payment successful");
        alert(`✅ Payment successful via ${passDetails.method}`);
      }

      // Step 2: Create pass
      console.log("🎫 Creating pass...");
      const response = await api.post(
    "http://localhost:5000/api/payment/buy-pass",
    passDetails,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

      console.log("✅ Pass creation response:", response.data);

      alert("🎉 Pass purchased successfully!");
  navigate("/dashboard");
} catch (err) {
      console.error("❌ Payment/Pass creation failed:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      
      let errorMessage = "❌ Payment or pass creation failed: ";
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error occurred";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToPayment = () => {
    if (mode === "All-in-One") return true;
    if (!from || !to || !validFrom || !validTill) return false;
    if (from === to) return false;
    return true;
  };

  // ------------------ JSX ------------------ //
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🚌 Buy Transport Pass
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome, {user?.username || "Passenger"}! Choose your transport pass.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pass Selection Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pass Details</h2>
              
              <div className="space-y-6">
          {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Transport Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Bus", "Train", "Metro", "All-in-One"].map((transportMode) => (
                      <button
                        key={transportMode}
                        type="button"
                        onClick={() => {
                          setMode(transportMode);
              setFrom("");
              setTo("");
            }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          mode === transportMode
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{getPassTypeIcon(transportMode)}</div>
                        <div className="font-medium">{transportMode}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route Selection (for non-All-in-One modes) */}
                {mode && mode !== "All-in-One" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Location
                      </label>
                      <Select
                        value={from ? { value: from, label: from } : null}
                        onChange={(opt) => {
                          setFrom(opt?.value || "");
                          if (opt?.value && opt?.value === to) setTo("");
                        }}
                        options={getOptions().filter((o) => o.value !== to)}
                        placeholder="Select starting location"
                        isClearable
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Location
                      </label>
                      <Select
                        value={to ? { value: to, label: to } : null}
                        onChange={(opt) => setTo(opt?.value || "")}
                        options={getOptions().filter((o) => o.value !== from)}
                        placeholder="Select destination"
                        isClearable
                      />
                    </div>
                  </div>
                )}

                {/* Pass Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pass Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: "One Day", price: 50, icon: "🌅" },
                      { type: "Weekly", price: 250, icon: "📅" },
                      { type: "Monthly", price: 800, icon: "📆" }
                    ].map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => setPassType(option.type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          passType === option.type
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-medium text-sm">{option.type}</div>
                        <div className="text-xs text-gray-600">₹{option.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From
                    </label>
          <input
            type="date"
            value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid Till
                    </label>
                    <input
                      type="date"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      min={validFrom || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
                  </div>
                </div>

                {/* Price Display */}
                {mode && passType && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Total Price:</span>
                      <span className="text-2xl font-bold text-blue-600">₹{calculatePrice()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>
              
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "UPI", name: "UPI", icon: "📱" },
                      { id: "Card", name: "Credit/Debit Card", icon: "💳" },
                      { id: "Stripe", name: "Stripe", icon: "💳" },
                      { id: "Wallet", name: "Digital Wallet", icon: "👛" }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="font-medium text-sm">{method.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI Options */}
          {paymentMethod === "UPI" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI App
                    </label>
            <select
              value={upiApp}
              onChange={(e) => setUpiApp(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Google Pay">Google Pay</option>
                      <option value="PhonePay">PhonePay</option>
                      <option value="Paytm">Paytm</option>
                      <option value="PayPal">PayPal</option>
            </select>
                  </div>
                )}

                {/* Card Details */}
                {paymentMethod === "Card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pass Type:</span>
                      <span>{mode} {passType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span>{mode === "All-in-One" ? "All Zones" : `${from} → ${to}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{paymentMethod === "UPI" ? upiApp : paymentMethod}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span className="text-lg text-green-600">₹{calculatePrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  type="submit"
                  disabled={loading || !canProceedToPayment()}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ₹${calculatePrice()}`
                  )}
          </button>
              </div>
            </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default BuyPass;
