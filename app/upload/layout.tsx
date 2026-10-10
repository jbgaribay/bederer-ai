import type { Metadata } from "next";

// The upload page is a client component, so its title lives here
export const metadata: Metadata = {
  title: "Analyze Your Swing",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
