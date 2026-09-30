import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface NewsCardProps {
  id?: number;
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
}

export default function NewsCard({
  title,
  slug,
  date,
  category,
  excerpt,
  image,
}: NewsCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-gray-50">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link href={`/news/${slug}`}>{title}</Link>
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{excerpt}</p>

        <Link
          href={`/news/${slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm gap-1"
        >
          Đọc thêm
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
