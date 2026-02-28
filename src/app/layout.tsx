import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "ClinicalAI — Diabetes Risk Assessment",
  description: "AI-powered diabetes risk prediction using Machine Learning and Gemini AI. Built for Praxis 2.0.",
  keywords: "diabetes, risk assessment, AI, machine learning, clinical decision support, Gemini",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
