import type { Metadata } from "next";

// The profile page is a client component, so its title lives here
export const metadata: Metadata = {
  title: "Your Profile",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
