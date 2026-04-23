"use client";
// NEW FEATURE START
import { X, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WiseBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: string;
}

const WISE_DETAILS = {
  accountName: process.env.NEXT_PUBLIC_WISE_ACCOUNT_NAME || "Abbassa Malik",
  iban: process.env.NEXT_PUBLIC_WISE_IBAN || "Contact me for IBAN details",
  bic: process.env.NEXT_PUBLIC_WISE_BIC || "TRWIBEB1XXX",
  bankName: process.env.NEXT_PUBLIC_WISE_BANK_NAME || "Wise (TransferWise)",
  currency: process.env.NEXT_PUBLIC_WISE_CURRENCY || "USD",
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gold-light/30 last:border-0">
      <div>
        <p className="text-xs text-muted uppercase tracking-wide font-medium">{label}</p>
        <p className="text-charcoal font-mono text-sm mt-0.5 break-all">{value}</p>
      </div>
      <button
        onClick={copy}
        className="ml-3 flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 hover:bg-gold/20 flex items-center justify-center transition-colors"
        title="Copy"
      >
        {copied ? (
          <CheckCheck size={14} className="text-gold" />
        ) : (
          <Copy size={14} className="text-muted" />
        )}
      </button>
    </div>
  );
}

export default function WiseBankModal({
  isOpen,
  onClose,
  planName,
  amount,
}: WiseBankModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center hover:bg-charcoal/20 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Wise logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#9FE870] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1A1A1A">
                  <path d="M12.5 2L2 22h20L12.5 2zm0 4.5l6.5 13h-13l6.5-13z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif font-bold text-charcoal text-lg">
                  Direct Bank Transfer via Wise
                </h3>
                <p className="text-muted text-sm">
                  {planName} Package — <strong className="text-gold">${amount}</strong>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6">
              <CopyField label="Account Name" value={WISE_DETAILS.accountName} />
              <CopyField label="IBAN / Account Number" value={WISE_DETAILS.iban} />
              <CopyField label="BIC / SWIFT" value={WISE_DETAILS.bic} />
              <CopyField label="Bank" value={WISE_DETAILS.bankName} />
              <CopyField label="Currency" value={WISE_DETAILS.currency} />
              <CopyField label="Reference" value={`AM-${planName.toUpperCase()}-${Date.now().toString().slice(-6)}`} />
            </div>

            <div className="bg-gold/10 rounded-xl p-4 text-sm text-charcoal leading-relaxed">
              <strong className="block mb-1">⚠️ Important:</strong>
              After completing the transfer, please send a screenshot or confirmation to me via{" "}
              <a
                href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-semibold underline"
              >
                Upwork
              </a>{" "}
              or{" "}
              <a
                href="https://www.linkedin.com/in/abbassamalik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A66C2] font-semibold underline"
              >
                LinkedIn
			  </a>{" "}
or{" "}
<a
  href="mailto:abbassamalik@gmail.com"
  className="text-red-500 font-semibold underline"
>
  abbassamalik@gmail.com
</a>{" "}
              to activate your order.
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full py-3 rounded-full border-2 border-charcoal/20 hover:border-gold hover:text-gold font-semibold text-sm transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// NEW FEATURE END
