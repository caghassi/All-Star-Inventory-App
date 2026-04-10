"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  existingUrl?: string | null;
}

export default function ImageUpload({ existingUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Product Photo
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) {
            handleFile(file);
            // Update the hidden input with a DataTransfer
            const dt = new DataTransfer();
            dt.items.add(file);
            if (inputRef.current) inputRef.current.files = dt.files;
          }
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-48 rounded object-contain"
          />
        ) : (
          <div className="py-8 text-gray-500">
            <p className="text-sm">Click or drag and drop an image here</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {existingUrl && (
        <input type="hidden" name="existing_image_url" value={existingUrl} />
      )}
    </div>
  );
}
