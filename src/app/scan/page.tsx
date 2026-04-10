import ScanClient from "@/components/ScanClient";

export default function ScanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan Barcode</h1>
      <ScanClient />
    </div>
  );
}
