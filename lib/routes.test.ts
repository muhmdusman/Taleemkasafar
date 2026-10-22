import { describe, expect, it } from "vitest";
import {
  isNavActive,
  isPublicPath,
  routes,
  safeNextPath,
  shouldBounceSignedIn,
} from "./routes";

describe("routes builders", () => {
  it("builds every app URL under /dashboard", () => {
    expect(routes.dashboard).toBe("/dashboard");
    expect(routes.subjects).toBe("/dashboard/subjects");
    expect(routes.subject("maths")).toBe("/dashboard/subjects/maths");
    expect(routes.practice("maths", "ch-1")).toBe(
      "/dashboard/subjects/maths/ch-1/practice",
    );
    expect(routes.pastPaper("maths", "ch-1")).toBe(
      "/dashboard/subjects/maths/ch-1/past-paper",
    );
    expect(routes.mocks).toBe("/dashboard/mock");
    expect(routes.mock("a1")).toBe("/dashboard/mock/a1");
    expect(routes.mockResult("a1")).toBe("/dashboard/mock/a1/result");
    expect(routes.performance).toBe("/dashboard/performance");
  });

  it("builds public website URLs at the root", () => {
    expect(routes.meritCalculator).toBe("/merit-calculator");
    expect(routes.meritUniversity("nust")).toBe("/merit-calculator/nust");
    expect(routes.blog).toBe("/blog");
    expect(routes.blogPost("net-guide")).toBe("/blog/net-guide");
    expect(routes.academies).toBe("/academies");
    expect(routes.contact).toBe("/contact");
    expect(routes.signInAlias).toBe("/sign-in");
    expect(routes.registerAlias).toBe("/register");
  });
});

describe("isPublicPath (deny-by-default allowlist)", () => {
  it("allows the landing page", () => {
    expect(isPublicPath("/")).toBe(true);
  });

  it("allows /auth and everything under it", () => {
    expect(isPublicPath("/auth/login")).toBe(true);
    expect(isPublicPath("/auth/sign-up")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });

  it("allows Next metadata + static files", () => {
    for (const p of [
      "/robots.txt",
      "/sitemap.xml",
      "/favicon.ico",
      "/icon.svg",
      "/apple-icon.svg",
      "/manifest.webmanifest",
      "/opengraph-image.png",
      "/opengraph-image",
      "/twitter-image.png",
      "/_next/static/chunks/main.js",
    ]) {
      expect(isPublicPath(p), p).toBe(true);
    }
  });

  it("allows the public website pages", () => {
    for (const p of [
      "/merit-calculator",
      "/merit-calculator/nust",
      "/blog",
      "/blog/how-to-prepare-for-net",
      // Per-post OG/Twitter images (incl. Next's optional hash suffix).
      "/blog/how-to-prepare-for-net/opengraph-image",
      "/blog/how-to-prepare-for-net/twitter-image",
      "/blog/how-to-prepare-for-net/opengraph-image-1a2b3c",
      "/contact",
      "/academies",
      "/sign-in",
      "/register",
    ]) {
      expect(isPublicPath(p), p).toBe(true);
    }
  });

  it("matches public pages by segment, not by string prefix", () => {
    for (const p of [
      "/blogx",
      "/blog-admin",
      "/merit-calculatorx",
      "/merit-calculator-admin",
      "/contacts",
      "/contact/x",
      "/academiesx",
      "/academies/x",
      "/sign-in/x",
      "/sign-inx",
      "/registerx",
      "/register/x",
    ]) {
      expect(isPublicPath(p), p).toBe(false);
    }
  });

  it("protects the dashboard and everything under it", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/dashboard/subjects/x")).toBe(false);
    expect(isPublicPath("/dashboard/mock/abc/result")).toBe(false);
  });

  it("protects legacy root app paths (they 308 via next.config first)", () => {
    expect(isPublicPath("/subjects")).toBe(false);
    expect(isPublicPath("/mock")).toBe(false);
    expect(isPublicPath("/performance")).toBe(false);
  });

  it("does not leak through prefix look-alikes or odd paths", () => {
    expect(isPublicPath("/dashboardx")).toBe(false);
    expect(isPublicPath("/authx")).toBe(false);
    expect(isPublicPath("/authority")).toBe(false);
    expect(isPublicPath("//evil.com")).toBe(false);
    expect(isPublicPath("/opengraph-image/../dashboard")).toBe(false);
    expect(isPublicPath("/robots.txt/x")).toBe(false);
    expect(isPublicPath("/some-unknown-page")).toBe(false);
  });
});

describe("shouldBounceSignedIn", () => {
  it("bounces auth entry pages", () => {
    for (const p of [
      "/auth/login",
      "/auth/sign-up",
      "/auth/sign-up-success",
      "/auth/forgot-password",
    ]) {
      expect(shouldBounceSignedIn(p), p).toBe(true);
    }
  });

  it("never bounces auth flow routes", () => {
    for (const p of [
      "/auth/callback",
      "/auth/confirm",
      "/auth/update-password",
      "/auth/error",
    ]) {
      expect(shouldBounceSignedIn(p), p).toBe(false);
    }
  });

  it("lets signed-in users browse the public site", () => {
    for (const p of ["/", "/merit-calculator", "/blog", "/contact", "/academies"]) {
      expect(shouldBounceSignedIn(p), p).toBe(false);
    }
  });

  it("does not bounce app pages", () => {
    expect(shouldBounceSignedIn("/dashboard")).toBe(false);
    expect(shouldBounceSignedIn("/dashboard/subjects")).toBe(false);
  });
});

describe("safeNextPath (open-redirect guard)", () => {
  it("defaults to the dashboard", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });

  it("keeps same-origin relative paths", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/dashboard/mock?x=1")).toBe("/dashboard/mock?x=1");
    expect(safeNextPath("/")).toBe("/");
  });

  it("rejects protocol-relative, absolute and host-smuggling targets", () => {
    for (const p of [
      "//evil.com",
      "/\\evil.com",
      "https://evil.com",
      "evil.com",
      "@evil.com",
      ".evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
    ]) {
      expect(safeNextPath(p), JSON.stringify(p)).toBe("/dashboard");
    }
  });

  it("honours a custom fallback", () => {
    expect(safeNextPath("//evil.com", "/auth/login")).toBe("/auth/login");
  });
});

describe("isNavActive", () => {
  it("marks Home active on exactly /dashboard", () => {
    expect(isNavActive("/dashboard", routes.dashboard)).toBe(true);
    expect(isNavActive("/dashboard/subjects", routes.dashboard)).toBe(false);
  });

  it("marks sections active on their prefix only", () => {
    expect(isNavActive("/dashboard/subjects", routes.subjects)).toBe(true);
    expect(isNavActive("/dashboard/subjects/maths", routes.subjects)).toBe(true);
    expect(isNavActive("/dashboard/mock/a1/result", routes.mocks)).toBe(true);
    expect(isNavActive("/dashboard/mockx", routes.mocks)).toBe(false);
    expect(isNavActive("/dashboard", routes.performance)).toBe(false);
  });
});
