// ponytail: Đánh giá sản phẩm an toàn với null/undefined reviews và rating
import { StarIcon } from 'lucide-react';
import type { Product } from '@apps/shared/types';

interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const reviews = product.reviews || [];
  const ratingVal = Number(product.rating || 0);
  const numReviews = Number(product.numReviews || reviews.length);

  const ratings = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  // Ensure all ratings (1-5) exist in the object
  const ratingCounts = {
    5: ratings[5] || 0,
    4: ratings[4] || 0,
    3: ratings[3] || 0,
    2: ratings[2] || 0,
    1: ratings[1] || 0,
  };

  const totalReviews = Object.values(ratingCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 sm:space-y-4">
      <div className="flex items-center gap-4 sm:gap-3">
        <div className="text-4xl font-bold sm:text-3xl">
          {ratingVal.toFixed(1)}
        </div>
        <div className="space-y-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 sm:h-4 sm:w-4 ${
                  i < Math.floor(ratingVal)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Dựa trên {numReviews} lượt đánh giá
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(ratingCounts)
          .reverse()
          .map(([rating, count]) => (
            <div key={rating} className="flex items-center gap-4 sm:gap-3">
              <div className="w-12 text-sm">{rating} sao</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="w-12 text-sm text-right">{count}</div>
            </div>
          ))}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6 sm:space-y-4 pt-4">
          {reviews.map((review, index) => (
            <div key={index} className="space-y-2 border-b pb-4 last:border-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-medium">{review.name}</div>
                <div className="text-sm text-muted-foreground">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ''}
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 sm:h-3 sm:w-3 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground pt-2">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
      )}
    </div>
  );
}
