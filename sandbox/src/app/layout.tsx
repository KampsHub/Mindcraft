export const metadata = {
  title: "Mindcraft Sandbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#18181C", color: "#F0EDE6" }}>
        {children}
      </body>
    </html>
  );
}
