"use client";
import InpaintForm from "@/components/InpaintForm";
import { useState } from "react";

export interface ImageResult {
  url: string;
}

function InpaintPage() {
  const [results, setResults] = useState<ImageResult[]>([]);

  return (
    <div className="container mx-auto space-y-8 p-4">
      <h1 className="text-center text-3xl font-bold">Inpainting Generator</h1>

      <InpaintForm onResult={setResults} />

      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Generated Images</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((image, idx) => (
              <img
                key={idx}
                src={image.url}
                alt={`Generated ${idx + 1}`}
                className="h-auto w-full rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InpaintPage;
