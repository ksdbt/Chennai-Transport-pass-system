const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth"); // ✅ FIXED
const Pass = require("../models/Pass");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

router.get("/passes", auth, async (req, res) => {
  try {
    const passes = await Pass.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const active = passes.filter(p => {
      const validTo = new Date(p.validTo);
      validTo.setHours(23, 59, 59, 999);
      return validTo >= now;
    });

    const expired = passes.filter(p => {
      const validTo = new Date(p.validTo);
      validTo.setHours(23, 59, 59, 999);
      return validTo < now;
    });

    res.status(200).json({ active, expired, all: passes });
  } catch (err) {
    console.error("❌ Error fetching passes:", err.message);
    res.status(500).json({ message: "Error fetching pass history" });
  }
});

// ✅ PDF Download
router.get("/download/pdf", auth, async (req, res) => {
  try {
    const passes = await Pass.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pass_history.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("Transport Pass History", { align: "center" });
    doc.moveDown();

    passes.forEach((pass, index) => {
      doc.fontSize(12).text(
        `${index + 1}) ${pass.mode} | From: ${pass.startLocation} → ${
          pass.endLocation
        }
Valid: ${pass.validFrom.toDateString()} to ${pass.validTo.toDateString()}`
      );
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("❌ PDF error:", err);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

// ✅ CSV Download
router.get("/download/csv", auth, async (req, res) => {
  try {
    const passes = await Pass.find({ userId: req.user.id });

    const fields = [
      "mode",
      "startLocation",
      "endLocation",
      "validFrom",
      "validTo",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(passes);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pass_history.csv"
    );
    res.status(200).end(csv);
  } catch (err) {
    console.error("❌ CSV error:", err);
    res.status(500).json({ message: "Error generating CSV" });
  }
});

module.exports = router;
