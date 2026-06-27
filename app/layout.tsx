import QueryProvider from "@/providers/query-provider";
import "./globals.css";
import { Nunito } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Metadata } from "next";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDE Jobs & Internships",
  description:
    "Discover and apply for software engineering jobs and internships. Connect with top companies, showcase your skills, and accelerate your career with SDE Jobs & Internships.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
