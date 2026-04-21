"use client";
// NEW FEATURE START
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
  amount: string;
  planName: string;
  onSuccess?: () => void;
}

export default function PayPalButton({
  amount,
  planName,
  onSuccess,
}: PayPalButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="h-12 bg-gold/10 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay" }}
      createOrder={(_data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              description: `Abbassa Malik — ${planName} Package`,
              amount: { currency_code: "USD", value: amount },
            },
          ],
        });
      }}
      onApprove={async (_data, actions) => {
        if (actions.order) {
          await actions.order.capture();
          // Redirect to file upload page with plan info
          router.push(
            `/upload?plan=${encodeURIComponent(planName)}&amount=${amount}`
          );
          onSuccess?.();
        }
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        alert("Payment failed. Please try again or contact us.");
      }}
    />
  );
}
// NEW FEATURE END
