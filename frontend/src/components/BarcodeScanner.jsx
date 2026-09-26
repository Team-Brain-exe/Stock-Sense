import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Icon from "./Icon.jsx";

export default function BarcodeScanner({ onScan }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const startScanner = async () => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode("barcode-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );

      setScanning(true);
    } catch (error) {
      console.error("Camera could not start:", error);
      setManual(true);
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch (error) {
      console.error(error);
    }

    scannerRef.current = null;
    setScanning(false);
  };

  const handleManualEntry = () => {
    const code = manualCode.trim();

    if (!code) return;

    onScan(code);
    setManualCode("");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="barcode-scanner">
      <div className="barcode-scanner-head">
        <div>
          <p className="panel-eyebrow">BARCODE INPUT</p>
          <h3>Scan product</h3>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setManual(!manual)}
        >
          <Icon name="keyboard" size={14} />
          {manual ? "Use camera" : "Manual entry"}
        </button>
      </div>

      {!manual ? (
        <>
          <div
            id="barcode-reader"
            className="barcode-reader"
          />

          {!scanning ? (
            <button
              type="button"
              className="primary-button full-button"
              onClick={startScanner}
            >
              <Icon name="scan" size={15} />
              Start camera
            </button>
          ) : (
            <button
              type="button"
              className="secondary-button full-button"
              onClick={stopScanner}
            >
              Stop scanner
            </button>
          )}

          <p className="scanner-help">
            Point the camera at the product barcode or SKU.
          </p>
        </>
      ) : (
        <div className="manual-scanner">
          <label>
            <span>SKU / Barcode</span>

            <input
              type="text"
              value={manualCode}
              placeholder="Example: KB-001"
              onChange={(event) => setManualCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleManualEntry();
                }
              }}
            />
          </label>

          <button
            type="button"
            className="primary-button full-button"
            onClick={handleManualEntry}
          >
            <Icon name="check" size={15} />
            Add product
          </button>
        </div>
      )}
    </div>
  );
}