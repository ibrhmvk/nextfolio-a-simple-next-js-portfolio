import React from "react";
import type { Metadata } from "next";
import { ImageGrid } from "app/components/image-grid";

export const metadata: Metadata = {
  title: "Photos",
  description: "My Photos",
};

export default function Photos() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-medium tracking-tight">Photos</h1>
      <ImageGrid
        columns={3}
        images={[
          {
            src: "/1.webp",
            alt: "ibrahim",
          },
          {
            src: "/9.webp",
            alt: "ibrahim",
          },
          {
            src: "/3.webp",
            alt: "ibrahim",
          },
          {
            src: "/4.webp",
            alt: "ibrahim",
          },
          {
            src: "/5.webp",
            alt: "ibrahim",
          },
          {
            src: "/13.webp",
            alt: "ibrahim",
          },
        ]}
      />

      <ImageGrid
        columns={2}
        images={[
          { src: "/17.webp", alt: "ibrahim" },
          { src: "/2.webp", alt: "ibrahim" },
          { src: "/14.webp", alt: "ibrahim" },
          { src: "/10.webp", alt: "ibrahim" },
        ]}
      />

      <ImageGrid
        columns={4}
        images={[
          { src: "/7.webp", alt: "ibrahim" },
          { src: "/15.webp", alt: "ibrahim" },
          { src: "/6.webp", alt: "ibrahim" },
          { src: "/12.webp", alt: "ibrahim" },
          { src: "/8.webp", alt: "ibrahim" },
          { src: "/11.webp", alt: "ibrahim" },
        ]}
      />
    </section>
  );
}