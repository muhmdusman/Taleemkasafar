import { describe, expect, it } from "vitest";
import { homeFaq } from "@/config/faq";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapes < so data cannot close the script element", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("faqPageJsonLd", () => {
  it("mirrors the visible FAQ items exactly", () => {
    const data = faqPageJsonLd(homeFaq) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(data.mainEntity).toHaveLength(homeFaq.length);
    data.mainEntity.forEach((q, i) => {
      expect(q.name).toBe(homeFaq[i].question);
      expect(q.acceptedAnswer.text).toBe(homeFaq[i].answer);
    });
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from 1 with absolute URLs", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(data.itemListElement[1].item).toMatch(/^https?:\/\/[^/]+\/blog$/);
  });
});

type ArticleShape = {
  "@type": string;
  headline: string;
  datePublished: string;
  dateModified: string;
  image: string[];
  mainEntityOfPage: { "@id": string };
  publisher: { "@type": string; name: string; logo: { url: string } };
  author: Record<string, string>;
  articleSection: string;
};

describe("articleJsonLd", () => {
  const post = {
    slug: "a-post",
    title: "A post",
    description: "About things.",
    date: "2026-10-01",
    author: "Taleem ka Safar Team",
    category: "Study Strategy" as const,
    tags: ["NET", "Merit"],
  };

  it("has the fields Google expects, with absolute URLs", () => {
    const data = articleJsonLd(post) as unknown as ArticleShape;
    expect(data["@type"]).toBe("Article");
    expect(data.headline).toBe("A post");
    expect(data.datePublished).toBe("2026-10-01");
    expect(data.dateModified).toBe("2026-10-01");
    expect(data.image[0]).toMatch(/^https?:\/\/[^/]+\/blog\/a-post\/opengraph-image$/);
    expect(data.mainEntityOfPage["@id"]).toMatch(/\/blog\/a-post$/);
    expect(data.publisher).toMatchObject({ "@type": "Organization", name: "Taleem ka Safar" });
    expect(data.publisher.logo.url).toMatch(/^https?:\/\/.+\/icon\.svg$/);
    expect(data.author).toMatchObject({ "@type": "Organization", name: "Taleem ka Safar Team" });
    expect(data.articleSection).toBe("Study Strategy");
  });

  it("uses a Person author for a named byline", () => {
    const data = articleJsonLd({ ...post, author: "Ayesha Khan" }) as unknown as ArticleShape;
    expect(data.author).toEqual({ "@type": "Person", name: "Ayesha Khan" });
  });
});
