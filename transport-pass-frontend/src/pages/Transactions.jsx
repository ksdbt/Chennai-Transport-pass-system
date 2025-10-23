import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [expandedTxn, setExpandedTxn] = useState(null);
  const [selectedMode, setSelectedMode] = useState("All");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const accessToken = localStorage.getItem("accessToken");
  const receiptRefs = useRef({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Role-based access control: allow Passenger and TransportManager
    if (user && user.role !== "Passenger" && user.role !== "TransportManager") {
      if (user.role === "Admin") {
        navigate("/admin/transactions");
      } else {
        navigate("/");
      }
      return;
    }

    fetchTransactions();
    fetchStats();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("❌ Failed to load transactions:", err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/transactions/stats", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("❌ Failed to load transaction stats:", err.message);
    }
  };

  const filtered = transactions.filter((txn) =>
    selectedMode === "All" ? true : txn.mode === selectedMode
  );

  // Derived stats based on current filter
  const derivedTotalSpent = filtered
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const derivedAverageAmount = filtered.length
    ? Math.round(
        filtered.reduce((sum, t) => sum + (t.amount || 0), 0) / filtered.length
      )
    : 0;

  const downloadPDF = async (txn) => {
    const element = receiptRefs.current[txn.transactionId];
    if (!element) return;

    // Hide download button before rendering PDF
    const downloadBtn = element.querySelector(".download-button");
    if (downloadBtn) downloadBtn.style.display = "none";
    
    // ✅ Wait for QR image to load (if exists)
    const qrImage = element.querySelector("img");
    if (qrImage && !qrImage.complete) {
      await new Promise((resolve) => {
        qrImage.onload = resolve;
        qrImage.onerror = resolve; // still proceed even if image fails
      });
    }
  
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${txn.mode}_${txn.passType || 'pass'}_receipt.pdf`);

    // Restore button after PDF generation
    if (downloadBtn) downloadBtn.style.display = "block";
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

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              💳 Transaction History
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome, {user?.username || "Passenger"}! View your payment history.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTransactions || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedTransactions || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-yellow-600">₹{derivedTotalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Amount</p>
                <p className="text-3xl font-bold text-purple-600">₹{derivedAverageAmount}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter by Transport Mode</h2>
            <div className="flex flex-wrap gap-3">
              {["All", "Bus", "Train", "Metro", "All-in-One"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedMode === mode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getPassTypeIcon(mode)} {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">You haven't made any transactions yet.</p>
                <button
                  onClick={() => navigate("/buy-pass")}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buy Your First Pass
                </button>
              </div>
            ) : (
              filtered.map((txn, i) => {
                const isOpen = expandedTxn === i;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setExpandedTxn(isOpen ? null : i)}
                  >
                    {/* --- Collapsed Card Header --- */}
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{getPassTypeIcon(txn.mode)}</span>
                            <div>
                              <p className="font-semibold text-lg text-green-700">
                                ₹{txn.amount}
                              </p>
                              <p className="text-sm text-gray-600">
                                {txn.mode} • {txn.passType || txn.pass?.passType || "Pass"}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {txn.status === "success" ? "✅" : "❌"} Paid via{" "}
                            <strong>{txn.method || "Payment"}</strong>
                            <br />
                            {new Date(txn.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(txn.status)}`}
                          >
                            {txn.status === "success" ? "Completed" : txn.status || "N/A"}
                          </span>
                          <span className="text-sm text-gray-400">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* --- Expanded Receipt --- */}
                    {isOpen && (
                      <div
                        ref={(el) => (receiptRefs.current[txn.transactionId] = el)}
                        className="bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200"
                      >
                        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center mx-auto">
                          <h2 className="text-2xl font-bold text-green-700 mb-4">
                            🎫 Transport Pass Receipt
                          </h2>
                          
                          <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span className="font-medium">Transaction ID:</span>
                              <span>{txn.transactionId || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Transport Mode:</span>
                              <span>{txn.mode || "N/A"}</span>
                            </div>
                            {/* <div className="flex justify-between">
                              <span className="font-medium">Pass Type:</span>
                              <span>{txn.passType || txn.pass?.passType || "N/A"}</span>
                            </div> */}
                            <div className="flex justify-between">
                              <span className="font-medium">Payment Method:</span>
                              <span>{txn.method || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Amount:</span>
                              <span className="font-semibold text-green-600">₹{txn.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date:</span>
                              <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Time:</span>
                              <span>{new Date(txn.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>

                          {txn.qrCode && (
                            <div className="mt-4">
                              <img
                                src={txn.qrCode}
                                alt="QR Code"
                                className="mx-auto w-32 h-32 border rounded-lg"
                              />
                            </div>
                          )}

                          {/* PDF Download */}
                          <button
                            className="download-button mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPDF(txn);
                            }}
                          >
                            📥 Download Receipt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
