"use client";

import { useParams } from "next/navigation";
import KioskWrapper from "../../kioskwrapper/KioskWrapper";

export default function KioskPage() {
  const params = useParams();
  const businessId = params?.businessId;

  return <KioskWrapper businessId={businessId} />;
}
