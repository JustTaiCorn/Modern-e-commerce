import { newsArticles } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-semibold text-gray-800">Tin tức & Chính sách</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center w-full gap-4 max-w-4xl mx-auto mb-10">
          <div className="h-[2px] bg-gradient-to-r from-gray-900 to-transparent flex-1" />
          <h1 className="text-2xl md:text-3xl font-bold uppercase text-center tracking-tight text-gray-900">
            Chính sách & Tin tức
          </h1>
          <div className="h-[2px] bg-gradient-to-l from-gray-900 to-transparent flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <Link href={`/news/${article.slug}`} className="relative w-full h-56 md:h-64 block overflow-hidden bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2 block">
                    {article.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    <Link href={`/news/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>{article.date}</span>
                  <Link
                    href={`/news/${article.slug}`}
                    className="font-medium text-black group-hover:text-blue-600 transition-colors"
                  >
                    Đọc chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
