import { Suspense } from "react";
import BookingRedirect from "./BookingRedirect";

// Intermediate landing page between Stripe success and Google's public
// appointment schedule. Reads the selected slot from the Stripe session
// metadata (set in /api/checkout/enneagram) and forwards the customer to
// Stefanie's real Google booking page, where they confirm the slot.
// Google then writes the event to Stefanie's calendar natively — no
// OAuth or Calendar API calls needed on our end.

export default function Page({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  return (
    <Suspense fallback={null}>
      <BookingRedirect searchParamsPromise={searchParams} />
    </Suspense>
  );
}
