import "./globals.css";
import RouteLoader from "@/components/RouteLoader";

export const metadata = {
  title: "ClinicOS — Appointment Management",
  description: "Modern clinic appointment scheduling system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900 min-h-screen">
        <RouteLoader />
        {children}
      </body>
    </html>
  );
}
