"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProductBySku } from "@/lib/actions";
import type { Product } from "@/lib/types";
import { parseDrawerBarcode } from "@/lib/drawers";
import QuickAdjustDialog from "./QuickAdjustDialog";

type ScanState =
  | { mode: "scanning" }
  | { mode: "found"; product: Product }
  | { mode: "not_found"; scannedValue: string };

export default function ScanClient() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>({ mode: "scanning" });
  const [error, setError] = useState<string | null>(null);
  const [manualSku, setManualSku] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  async function handleDecodedValue(decodedText: string) {
    // Check if this is a drawer barcode — if so, navigate to it
    const drawerNumber = parseDrawerBarcode(decodedText);
    if (drawerNumber !== null) {
      router.push(`/drawers/${drawerNumber}`);
      return;
    }

    // Look up product by SKU
    try {
      const product = await getProductBySku(decodedText);
      if (product) {
        setState({ mode: "found", product });
      } else {
        setState({ mode: "not_found", scannedValue: decodedText });
      }
    } catch (err) {
      setError(
        `Lookup failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async function lookupManual(e: React.FormEvent) {
    e.preventDefault();
    const sku = manualSku.trim();
    if (!sku) return;
    setLookingUp(true);
    setError(null);

    // Stop the camera before navigating/transitioning
    const qr = html5QrCodeRef.current as {
      stop: () => Promise<void>;
      isScanning?: boolean;
    } | null;
    if (qr?.isScanning) {
      try {
        await qr.stop();
      } catch {
        // ignore
      }
    }

    await handleDecodedValue(sku);
    setLookingUp(false);
  }

  useEffect(() => {
    if (state.mode !== "scanning") return;

    let cancelled = false;

    async function startScanner() {
      let mod;
      try {
        mod = await import("html5-qrcode");
      } catch (err) {
        setError(
          `Scanner library failed to load: ${err instanceof Error ? err.message : String(err)}`
        );
        return;
      }
      if (cancelled) return;

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = mod;

      if (!scannerRef.current) return;

      const scannerId = "barcode-scanner";
      scannerRef.current.id = scannerId;

      let html5QrCode;
      try {
        // Explicitly enable 1D formats. Without this, html5-qrcode mainly
        // decodes QR codes and ignores CODE128 labels.
        html5QrCode = new Html5Qrcode(scannerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      } catch (err) {
        setError(
          `Scanner init failed: ${err instanceof Error ? err.message : String(err)}`
        );
        return;
      }

      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
          },
          async (decodedText: string) => {
            // Stop scanning immediately so we only process the first hit
            try {
              await html5QrCode.stop();
            } catch {
              // Ignore stop errors
            }
            await handleDecodedValue(decodedText);
          },
          () => {
            // Per-frame scan error — camera is working but no code in frame.
            // Ignore silently.
          }
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/permission|denied|NotAllowed/i.test(msg)) {
          setError(
            "Camera access denied. Enable camera permission for this site in your browser settings and reload."
          );
        } else if (/NotFound|NotReadable|OverConstrained/i.test(msg)) {
          setError(
            `No camera available: ${msg}. You can still enter the SKU or drawer code manually below.`
          );
        } else {
          setError(`Scanner error: ${msg}`);
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      const qr = html5QrCodeRef.current as {
        stop: () => Promise<void>;
        isScanning?: boolean;
      } | null;
      if (qr && qr.isScanning) {
        qr.stop().catch(() => {});
      }
      html5QrCodeRef.current = null;
    };
    // handleDecodedValue is stable for the lifetime of this component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode]);

  function resetScanner() {
    setError(null);
    setManualSku("");
    setState({ mode: "scanning" });
  }

  if (state.mode === "found") {
    return <QuickAdjustDialog product={state.product} onDone={resetScanner} />;
  }

  return (
    <div className="max-w-lg mx-auto">
      {state.mode === "not_found" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Product not found</p>
          <p className="text-sm mt-1">
            No product matches SKU:{" "}
            <code className="bg-yellow-100 px-1 rounded">
              {state.scannedValue}
            </code>
          </p>
          <button
            onClick={resetScanner}
            className="mt-2 text-sm text-yellow-900 underline hover:no-underline"
          >
            Scan again
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Scanner problem</p>
          <p className="text-sm mt-1 break-words">{error}</p>
        </div>
      )}

      {state.mode === "scanning" && (
        <>
          <div
            ref={scannerRef}
            className="rounded-lg overflow-hidden border-2 border-gray-300 min-h-[240px] bg-gray-50"
          />
          <p className="text-center text-sm text-gray-500 mt-4">
            Point your camera at a barcode to scan
          </p>

          <form
            onSubmit={lookupManual}
            className="mt-6 border-t border-gray-200 pt-4"
          >
            <label
              htmlFor="manual-sku"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Or enter a SKU / drawer code manually
            </label>
            <div className="flex gap-2">
              <input
                id="manual-sku"
                type="text"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                placeholder="e.g. SKU-ABC123 or DRAWER-05"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <button
                type="submit"
                disabled={lookingUp || !manualSku.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {lookingUp ? "..." : "Go"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

