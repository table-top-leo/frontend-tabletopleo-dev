"use client";

import { useParams } from "next/navigation";
import CustomerStandaloneTracking from "../../customer/CustomerStandaloneTracking";

export default function Page() {
  const params = useParams();
  const orderId = params?.orderId;

  return <CustomerStandaloneTracking orderId={orderId} />;
}