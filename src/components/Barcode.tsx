"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function Barcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.5,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
      } catch {
        // Invalid barcode value — clear the SVG
        if (svgRef.current) {
          svgRef.current.innerHTML = "";
        }
      }
    }
  }, [value]);

  if (!value) return null;

  return <svg ref={svgRef} />;
}
