"use client";

import Link from "next/link";
import { newsArticles } from "@/data/news";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5.19-3L10 9v6z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-black text-white w-full border-t border-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-2xl tracking-wider uppercase text-white">
              ATINO FASHION
            </h2>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Thương hiệu thời trang nam hiện đại, phong cách tối giản và tinh tế.
              Đồng hành cùng quý khách kiến tạo phong cách tự tin mỗi ngày.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="text-xs text-gray-400 block mb-2 font-medium">
                Đăng ký nhận thông tin khuyến mãi:
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Cảm ơn bạn đã đăng ký nhận bản tin!");
                }}
                className="relative flex items-center"
              >
                <Input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 pr-10 text-xs rounded-full"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Cột 2: Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              THÔNG TIN LIÊN HỆ
            </h3>
            <div className="space-y-2 text-xs md:text-sm text-gray-400">
              <p>Hotline: <strong className="text-white">1900 1234</strong></p>
              <p>Email: <strong className="text-white">support@atino.vn</strong></p>
              <p>Địa chỉ: 123 Đường Cầu Giấy, Quận Cầu Giấy, TP. Hà Nội</p>
              <p>Thời gian làm việc: 8:30 - 22:00 hàng ngày</p>
            </div>
          </div>

          {/* Cột 3: Chính sách khách hàng */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              CHÍNH SÁCH KHÁCH HÀNG
            </h3>
            <div className="flex flex-col space-y-2 text-xs md:text-sm text-gray-400">
              {newsArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Cột 4: Mạng xã hội */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              KẾT NỐI VỚI CHÚNG TÔI
            </h3>
            <p className="text-xs text-gray-400">
              Theo dõi chúng tôi trên mạng xã hội để cập nhật những bộ sưu tập mới nhất:
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-900 hover:bg-primary text-gray-300 hover:text-white rounded-full transition-all duration-200"
                  aria-label={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-900 mt-12 pt-6 text-center text-xs text-gray-500">
          <p>© 2026 ATINO FASHION. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
