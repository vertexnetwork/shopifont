"use client";

import Script from "next/script";
import { useConsent } from "@/components/Consent/ConsentProvider";

/**
 * Microsoft Clarity loader. Mounts the script tag only when (a) the
 * env var is set and (b) the user has actively granted consent via
 * the cookie banner. Spec §9 requires the consent gate.
 */
export function Clarity({ projectId }: { projectId: string | null }) {
  const { value } = useConsent();
  if (!projectId) return null;
  if (value !== "granted") return null;

  return (
    <Script id="clarity-init" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${projectId}");`}
    </Script>
  );
}
