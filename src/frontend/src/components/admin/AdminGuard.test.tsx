import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The admin area must be unreachable without an authenticated admin. The
 * Internet Identity hook, the caller-role hook, and the backend actor are
 * replaced with local typed mocks; this is component/integration coverage, not
 * deployed browser E2E.
 */
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

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children: ReactNode;
  } & Record<string, unknown>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => navigate,
}));

const roleQuery = {
  data: undefined as string | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

vi.mock("@/lib/backend", () => ({
  useCallerRole: () => roleQuery,
}));

import { AdminGuard } from "@/components/admin/AdminGuard";
import { CallerRole } from "@/types";

function renderGuard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(
    <AdminGuard>
      <div data-ocid="admin.secret">Shop dashboard</div>
    </AdminGuard>,
    { wrapper: Wrapper },
  );
}

describe("AdminGuard", () => {
  beforeEach(() => {
    identity.isAuthenticated = false;
    identity.isInitializing = false;
    identity.isLoggingIn = false;
    roleQuery.data = undefined;
    roleQuery.isLoading = false;
    roleQuery.isError = false;
    roleQuery.refetch.mockReset();
    navigate.mockReset();
  });

  it("hides the admin area and prompts for sign-in when unauthenticated", () => {
    renderGuard();

    expect(screen.queryByTestId("admin.secret")).not.toBeInTheDocument();
    expect(screen.getByTestId("admin.guard.login_panel")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in with Internet Identity/i }),
    ).toBeInTheDocument();
  });

  it("denies an authenticated non-admin caller", () => {
    identity.isAuthenticated = true;
    roleQuery.data = CallerRole.customer;
    renderGuard();

    expect(screen.getByTestId("admin.guard.denied_state")).toBeInTheDocument();
    expect(screen.queryByTestId("admin.secret")).not.toBeInTheDocument();
  });

  it("offers a signed-in non-admin a link back to the storefront", () => {
    identity.isAuthenticated = true;
    roleQuery.data = CallerRole.customer;
    renderGuard();

    expect(screen.getByTestId("admin.guard.home_link")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("signs a denied non-admin out and clears cached data", async () => {
    identity.isAuthenticated = true;
    roleQuery.data = CallerRole.customer;
    const user = userEvent.setup();
    renderGuard();

    await user.click(screen.getByTestId("admin.guard.signout_button"));

    expect(identity.clear).toHaveBeenCalledTimes(1);
  });

  it("renders the admin area for an authenticated admin", () => {
    identity.isAuthenticated = true;
    roleQuery.data = CallerRole.admin;
    renderGuard();

    expect(screen.getByTestId("admin.secret")).toBeInTheDocument();
  });
});
