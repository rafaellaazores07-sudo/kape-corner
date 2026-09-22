import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The shared layout must show the customer storefront chrome (header and
 * footer) on storefront routes and suppress it across the whole admin area,
 * including the staff sign-in page at `/admin/login`. The router is not under
 * test, so `Link` renders a plain anchor and `useRouterState` reports a fixed
 * pathname. Internet Identity is replaced with a local typed mock, matching the
 * seam used by Header.test.tsx. This is component/integration coverage with
 * local mocks — not deployed browser E2E.
 */
let pathname = "/";

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
  useNavigate: () => vi.fn(),
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname } }),
}));

const identity = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  clear: vi.fn(),
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => identity,
}));

import { Layout } from "@/components/Layout";

function renderLayout() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(
    <Layout>
      <div data-ocid="layout.child" />
    </Layout>,
    { wrapper: Wrapper },
  );
}

describe("Layout", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it("shows the customer header and footer on a storefront route", () => {
    pathname = "/menu";
    renderLayout();

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("layout.child")).toBeInTheDocument();
  });

  it("suppresses the storefront header and footer across the admin area", () => {
    pathname = "/admin";
    renderLayout();

    expect(screen.queryByTestId("header")).toBeNull();
    expect(screen.queryByTestId("footer")).toBeNull();
    expect(screen.getByTestId("layout.child")).toBeInTheDocument();
  });

  it("suppresses the storefront chrome on the staff sign-in page too", () => {
    pathname = "/admin/login";
    renderLayout();

    expect(screen.queryByTestId("header")).toBeNull();
    expect(screen.queryByTestId("footer")).toBeNull();
  });
});
