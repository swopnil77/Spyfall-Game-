import "./globals.css";

export const metadata = {
  title: "SpyFall A Game By Milkymamba",
  description:
    "Ask sly questions, spot the impostor, or bluff your way through as the spy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}