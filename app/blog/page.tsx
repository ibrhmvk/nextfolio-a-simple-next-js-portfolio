import Link from "next/link";
import { formatDate, getBlogPosts } from "app/lib/posts";

export const metadata = {
  title: "Blog",
  description: "seekinmonky Blog",
};

export default function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <section className="w-full max-w-full sm:w-[336px] md:w-[630px] px-2 sm:px-0">
      <h1 className="mb-8 text-2xl font-medium tracking-tight">Blog</h1>
      <div>
        {allBlogs
          .sort((a, b) => {
            if (
              new Date(a.metadata.publishedAt) >
              new Date(b.metadata.publishedAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <Link
              key={post.slug}
              className="flex flex-col space-y-1 mb-5 transition-opacity duration-200 hover:opacity-80"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <h2 className="text-black dark:text-white text-base sm:text-lg break-words">
                  {post.metadata.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 tabular-nums text-xs sm:text-sm whitespace-nowrap">
                  {formatDate(post.metadata.publishedAt, false)}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
