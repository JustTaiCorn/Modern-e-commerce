import { newsArticles } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

interface Params {
  slug: string;
}

interface NewsDetailPageProps {
  params: Promise<Params>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug: articleSlug } = await params;
  const article = newsArticles.find((a) => a.slug === articleSlug);

  if (!article) {
    notFound();
  }

  const relatedArticles = newsArticles.filter((a) => a.slug !== article.slug);

  return (
    <article className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/news"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách tin tức
        </Link>

        <header className="bg-white p-6 sm:p-8 rounded-t-lg border border-b-0 border-gray-100">
          <div className="flex items-center gap-3 mb-4 text-xs font-medium text-gray-500">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.date}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {article.excerpt}
          </p>
        </header>

        <div className="relative w-full h-72 sm:h-96 bg-gray-100 border-x border-gray-100">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-b-lg border border-t-0 border-gray-100 mb-12">
          <div
            className="text-gray-700 leading-relaxed space-y-4 text-sm sm:text-base prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {relatedArticles.length > 0 && (
          <section className="pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Các bài viết khác
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/news/${rel.slug}`}
                  className="group bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-44 bg-gray-100">
                    <Image
                      src={rel.image}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{rel.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
