import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const MODES = ["All", "Bus", "Train", "Metro", "All-in-One"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState([]);
  const [expired, setExpired] = useState([]);
  const [selectedMode, setSelectedMode] = useState("All");
  const [showExpired, setShowExpired] = useState(false);
  const [expandedPass, setExpandedPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Role-based access control
    if (authUser?.role !== "Passenger") {
      if (authUser?.role === "Admin") {
        navigate("/admin");
      } else if (authUser?.role === "TransportManager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };

    fetchUser();
  }, [authUser, navigate]);

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/history/passes");
        setActive(res.data.active || []);
        setExpired(res.data.expired || []);
      } catch (err) {
        console.error("❌ Error fetching passes", err.response?.data || err.message);
        setActive([]);
        setExpired([]);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchPasses();
  }, [accessToken]);

  const filteredPasses = (passes) =>
    selectedMode === "All"
      ? passes
      : passes.filter((p) => p.mode === selectedMode);

  const downloadPDF = async (pass) => {
    setDownloading(true);
    try {
      const pdf = new jsPDF();
      const element = document.getElementById(`pass-pdf-content-${pass._id}`);
      if (!element) return;

      // Hide the download button before rendering the PDF
      const downloadBtn = element.querySelector(".download-button");
      if (downloadBtn) downloadBtn.style.display = "none";

      // Wait for the QR image to load
      const qrImg = element.querySelector("img");
      if (qrImg) {
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          if (qrImg.complete) resolve();
        });
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Show the download button again
      if (downloadBtn) downloadBtn.style.display = "block";

      pdf.save(`transport-pass-${pass.mode}-${pass._id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
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

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Expired";
  };

  const renderPassCard = (pass, index, isActive = true) => {
    const isOpen = expandedPass === index;
    const isExpired = !isActive;
    
    return (
      <div
        key={index}
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${
          isExpired ? "border-l-red-500" : "border-l-green-500"
        }`}
        onClick={() => setExpandedPass(isOpen ? null : index)}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getPassTypeIcon(pass.mode)}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{pass.mode}</h3>
                <p className="text-sm text-gray-600">{pass.startLocation} → {pass.endLocation}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(isActive)}`}>
                {getStatusText(isActive)}
              </span>
              <div className="text-lg font-bold text-green-600 mt-1">₹{pass.amount}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Type:</span> {pass.passType}
            </div>
            <div>
              <span className="font-medium">Valid:</span> {new Date(pass.validFrom).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Expires:</span> {new Date(pass.validTo).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">ID:</span> {pass._id.slice(-6)}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">{isOpen ? "Click to collapse" : "Click to expand"}</span>
            <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
          </div>
        </div>

        {isOpen && pass.qrCode && (
          <div className="border-t border-gray-100 p-6 bg-gray-50" id={`pass-pdf-content-${pass._id}`}>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Transport Pass</h3>
                
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  <img 
                    src={pass.qrCode} 
                    alt="QR Code" 
                    className="mx-auto w-32 h-32"
                  />
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Pass ID:</span>
                    <span>{pass._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mode:</span>
                    <span>{pass.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Route:</span>
                    <span>{pass.startLocation} → {pass.endLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{pass.passType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Valid From:</span>
                    <span>{new Date(pass.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Valid To:</span>
                    <span>{new Date(pass.validTo).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-semibold text-green-600">₹{pass.amount}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPDF(pass);
                  }}
                  disabled={downloading}
                  className="download-button bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating PDF...
                    </div>
                  ) : (
                    "📥 Download PDF"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Passenger Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.username || "Passenger"}! Manage your transport passes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Passes</p>
                <p className="text-3xl font-bold text-gray-900">{active.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Passes</p>
                <p className="text-3xl font-bold text-gray-900">{expired.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{[...active, ...expired].reduce((sum, pass) => sum + (pass.amount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter by Transport Mode</h2>
          <div className="flex flex-wrap gap-3">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedMode === mode
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {mode === "All" ? "All Modes" : `${getPassTypeIcon(mode)} ${mode}`}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Expired Passes */}
        <div className="mb-8">
          <button
            onClick={() => setShowExpired(!showExpired)}
            className="bg-white text-gray-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            {showExpired ? "Hide" : "Show"} Expired Passes
          </button>
        </div>

        {/* Active Passes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Active Passes ({filteredPasses(active).length})
          </h2>
          {filteredPasses(active).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No active passes found</h3>
              <p className="text-gray-600 mb-6">You don't have any active transport passes at the moment.</p>
              <button
                onClick={() => navigate("/buy-pass")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Buy New Pass
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPasses(active).map((pass, index) => renderPassCard(pass, index, true))}
            </div>
          )}
        </div>

        {/* Expired Passes */}
        {showExpired && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Expired Passes ({filteredPasses(expired).length})
            </h2>
            {filteredPasses(expired).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No expired passes found</h3>
                <p className="text-gray-600">Great! All your passes are currently active.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPasses(expired).map((pass, index) => renderPassCard(pass, index, false))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/buy-pass")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Buy New Pass</h3>
              <p className="text-green-100">Purchase a new transport pass</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-semibold mb-2">Pass History</h3>
              <p className="text-blue-100">View your pass history</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Transactions</h3>
              <p className="text-purple-100">View payment history</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
