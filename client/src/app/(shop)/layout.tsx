import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import ChatWidget from "@/components/features/ai-chat/ChatWidget";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
