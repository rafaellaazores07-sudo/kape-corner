import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The staff sign-in page at `/admin/login` must be visually and functionally
 * distinct from the customer page: a "Staff / Admin" label, no customer
 * registration, a link to the customer sign-in, and a redirect straight to
 * `/admin` for an already-signed-in admin.
 *
 * Internet Identity, the caller-role hook, and the router are replaced with
 * local typed mocks; this is component/integration coverage, not deployed
 * browser E2E.
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
};

/**
 * The staff portal bootstraps staff access: the first signed-in caller becomes
 * the shop admin. The mutation is a local typed mock so the test can assert the
 * portal invokes it for an unregistered signed-in caller.
 */
const bootstrapAccess = vi.fn();
const initializeAccessControl = {
  mutate: bootstrapAccess,
  isPending: false,
};

vi.mock("@/lib/backend", () => ({
  useCallerRole: () => roleQuery,
  useInitializeAccessControl: () => initializeAccessControl,
}));

import { StaffLoginPage } from "@/components/admin/AdminGuard";

function renderStaffLogin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<StaffLoginPage />, { wrapper: Wrapper });
}

describe("StaffLoginPage", () => {
  beforeEach(() => {
    identity.isAuthenticated = false;
    identity.isInitializing = false;
    identity.isLoggingIn = false;
    identity.login.mockReset();
    roleQuery.data = undefined;
    initializeAccessControl.isPending = false;
    bootstrapAccess.mockReset();
    navigate.mockReset();
  });

  it("labels the page as staff-only and offers a staff sign-in action", async () => {
    const user = userEvent.setup();
    renderStaffLogin();

    expect(screen.getByTestId("admin.login.page")).toBeInTheDocument();
    expect(screen.getByText(/staff \/ admin/i)).toBeInTheDocument();
    expect(screen.queryByText(/registered automatically/i)).toBeNull();

    await user.click(screen.getByTestId("admin.login.signin_button"));
    expect(identity.login).toHaveBeenCalledTimes(1);
  });

  it("links staff back to the customer sign-in", () => {
    renderStaffLogin();

    expect(screen.getByTestId("admin.login.customer_link")).toHaveAttribute(
      "href",
      "/auth",
    );
  });

  it("redirects an already-signed-in admin straight to /admin", () => {
    identity.isAuthenticated = true;
    roleQuery.data = "admin";
    renderStaffLogin();

    expect(navigate).toHaveBeenCalledWith({ to: "/admin", replace: true });
  });

  it("shows a denied state for a signed-in non-admin", () => {
    identity.isAuthenticated = true;
    roleQuery.data = "customer";
    renderStaffLogin();

    expect(screen.getByTestId("admin.login.denied_state")).toBeInTheDocument();
    expect(screen.getByTestId("admin.login.storefront_link")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("bootstraps staff access for a signed-in caller with no role yet", () => {
    identity.isAuthenticated = true;
    roleQuery.data = "anonymous";
    renderStaffLogin();

    // The staff portal is the only surface that claims the first-admin slot.
    expect(bootstrapAccess).toHaveBeenCalledTimes(1);
  });

  it("does not bootstrap staff access for an anonymous visitor", () => {
    identity.isAuthenticated = false;
    roleQuery.data = undefined;
    renderStaffLogin();

    expect(bootstrapAccess).not.toHaveBeenCalled();
  });
});
