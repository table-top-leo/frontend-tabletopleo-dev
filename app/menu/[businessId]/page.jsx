"use client";

import { useParams } from "next/navigation";
import CustomerWrapper from "../../cusotomerwrapper/CustomerWrapper";

export default function Page() {
  const params = useParams();
  const businessId = params?.businessId;

  return <CustomerWrapper businessId={businessId} />;
}