"use client";

import { useEffect, useState } from "react";

const LINKS: { href: string; label: string; description?: string }[] = [
  { href: "/", label: "Home", description: "Product inventory" },
  { href: "/scan", label: "Scan", description: "Scan a barcode" },
  { href: "/drawers", label: "Drawers", description: "Drawer locations & true-ups" },
  { href: "/print", label: "Print Labels", description: "Batch print product labels" },
  { href: "/reports", label: "Reports", description: "Inventory analytics" },
  { href: "/products/new", label: "Add Product", description: "Create a new item" },
];

export default function NavDrawer() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Side drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-xl z-50 flex flex-col transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="font-medium text-gray-900">{link.label}</div>
                  {link.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {link.description}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
