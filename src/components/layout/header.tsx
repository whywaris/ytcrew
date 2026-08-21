import { Navbar } from "./navbar";
import { AdSlot } from "@/components/ads/ad-slot";

export function Header() {
  return (
    <>
      <Navbar />

      {/* Header Banner Ad Slot (Cleanly separated below header bar) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <AdSlot slotName="header_banner" />
      </div>
    </>
  );
}
