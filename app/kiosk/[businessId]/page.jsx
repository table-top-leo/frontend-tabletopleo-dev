"use client";

import { useParams } from "next/navigation";
import KioskV3Wrapper from "../../kioskv3/KioskV3Wrapper";

export default function KioskPage() {
  const params = useParams();
  const businessId = params?.businessId;

  return <KioskV3Wrapper businessId={businessId} />;
}
