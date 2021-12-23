import Head from "next/head";

import { CoverPurchaseDetailsPage } from "@/components/pages/cover/purchase/details";

export default function CoverPurchaseDetails() {
  return (
    <>
      <Head>
        <title>Neptune Mutual</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CoverPurchaseDetailsPage />
    </>
  );
}
