"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import MessagingSidebar from "./MessagingSidebar";

interface ScanCompleteViewProps {
  onRestart: () => void;
}

export default function ScanCompleteView({ onRestart }: ScanCompleteViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitScan = async () => {
    setIsSubmitting(true);
    try {
      const mockScanId = `scan_${Date.now()}`;
      
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scanId: mockScanId, 
          status: 'completed',
          userId: 'patient-456' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to notify clinic');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Error submitting scan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center flex-1 p-6 text-center animate-in fade-in duration-500">
        <CheckCircle2 className={`w-24 h-24 mb-6 ${isSubmitted ? 'text-blue-500' : 'text-green-500'}`} />
        <h2 className="text-3xl font-bold mb-4">
          {isSubmitted ? "Scan Submitted!" : "Scan Complete"}
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          {isSubmitted 
            ? "Your scan has been sent. The clinic has been notified and will review your images shortly."
            : "All 5 views have been successfully captured. You can now proceed to review the images or submit them for analysis."}
        </p>
        
        <div className="flex flex-col gap-4">
          {!isSubmitted && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
              onClick={handleSubmitScan}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Scan to Clinic"}
            </button>
          )}
          
          <button
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            onClick={onRestart}
          >
            Restart Scan
          </button>
        </div>
      </div>
      <MessagingSidebar />
    </>
  );
}
