"use client";

import { useParams } from "next/navigation";
import KioskWrapper from "../KioskWrapper";

export default function Page() {
  const params = useParams();
  const businessId = params?.businessId;

  return <KioskWrapper businessId={businessId} />;
}
