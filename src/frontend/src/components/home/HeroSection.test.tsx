import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// The hero only needs `Link` to render a navigable anchor; the router itself is
// not under test here, so it is replaced with a plain anchor.
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { HeroSection } from "@/components/home/HeroSection";

describe("HeroSection", () => {
  it("shows the headline and the Order Now call to action", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Fresh Coffee.",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Great Moments.",
    );

    const orderNow = screen.getByRole("link", { name: /Order Now/i });
    expect(orderNow).toHaveAttribute("href", "/menu");
  });

  it("links to the about page from the secondary action", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /Our story/i })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
