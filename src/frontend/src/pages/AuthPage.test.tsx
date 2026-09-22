import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The dedicated customer auth page must let a visitor trigger Internet Identity
 * and must reflect the signed-in state with the principal and a sign-out
 * action. It must also route an admin away to the admin area.
 *
 * Internet Identity and the caller-role hook are replaced with local typed
 * mocks, matching the seam used by AdminGuard.test.tsx. The router is not under
 * test, so `Link` renders a plain anchor and `useNavigate` is a spy. This is
 * component/integration coverage with local mocks — not deployed browser E2E,
 * and it does not exercise the real II flow.
 */
const identity = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  clear: vi.fn(),
  identity: null as { getPrincipal: () => { toString: () => string } } | null,
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
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
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
 * The customer portal registers the signed-in caller as a customer account.
 * `registerCustomer()` always assigns the non-admin `user` role, so it can
 * never claim the shop's first-admin slot. The mutation is a local typed mock
 * so the test can assert the portal invokes it for an unregistered caller.
 */
const register = vi.fn();
const registerCustomer = {
  mutate: register,
  isPending: false,
};

vi.mock("@/lib/backend", () => ({
  useCallerRole: () => roleQuery,
  useRegisterCustomer: () => registerCustomer,
}));

import { AuthPage } from "@/pages/AuthPage";

function renderAuthPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<AuthPage />, { wrapper: Wrapper });
}

describe("AuthPage", () => {
  beforeEach(() => {
    identity.isAuthenticated = false;
    identity.isInitializing = false;
    identity.isLoggingIn = false;
    identity.identity = null;
    identity.login.mockReset();
    identity.clear.mockReset();
    roleQuery.data = undefined;
    registerCustomer.isPending = false;
    register.mockReset();
    navigate.mockReset();
  });

  it("offers a sign-in action that triggers Internet Identity", async () => {
    const user = userEvent.setup();
    renderAuthPage();

    expect(screen.getByTestId("auth.page")).toBeInTheDocument();
    expect(screen.queryByTestId("auth.signed_in_panel")).toBeNull();

    const signIn = screen.getByTestId("auth.signin_button");
    expect(signIn).toHaveTextContent(/sign in with internet identity/i);

    await user.click(signIn);
    expect(identity.login).toHaveBeenCalledTimes(1);
  });

  it("shows the signed-in principal and a sign-out action once authenticated", async () => {
    identity.isAuthenticated = true;
    identity.identity = {
      getPrincipal: () => ({
        toString: () => "aaaaa-bbbbb-ccccc-ddddd-eeeee-fff",
      }),
    };
    const user = userEvent.setup();
    renderAuthPage();

    expect(screen.getByTestId("auth.signed_in_panel")).toBeInTheDocument();
    expect(screen.queryByTestId("auth.signin_button")).toBeNull();
    expect(screen.getByTestId("auth.principal")).toHaveTextContent(
      "aaaaa-bbb…ee-fff",
    );

    await user.click(screen.getByTestId("auth.signout_button"));
    expect(identity.clear).toHaveBeenCalledTimes(1);
  });

  it("disables the sign-in action while initializing", () => {
    identity.isInitializing = true;
    renderAuthPage();

    expect(screen.getByTestId("auth.signin_button")).toBeDisabled();
  });

  it("links customers to the staff portal", () => {
    renderAuthPage();

    expect(screen.getByTestId("auth.admin_link")).toHaveAttribute(
      "href",
      "/admin/login",
    );
  });

  it("redirects an admin to the admin area", () => {
    identity.isAuthenticated = true;
    roleQuery.data = "admin";
    renderAuthPage();

    expect(navigate).toHaveBeenCalledWith({ to: "/admin", replace: true });
  });

  it("registers a signed-in caller with no role yet as a customer", () => {
    identity.isAuthenticated = true;
    roleQuery.data = "anonymous";
    renderAuthPage();

    // The customer portal is the registration path; it never claims the
    // first-admin slot (that is the staff portal's `_initialize_access_control`).
    expect(register).toHaveBeenCalledTimes(1);
  });

  it("does not register an anonymous visitor", () => {
    identity.isAuthenticated = false;
    roleQuery.data = undefined;
    renderAuthPage();

    expect(register).not.toHaveBeenCalled();
  });

  it("labels the page as customer-facing and never exposes an admin link", () => {
    renderAuthPage();

    expect(screen.getByText(/^customer$/i)).toBeInTheDocument();
    // The only staff-facing affordance is the link to the staff portal; the
    // customer page must not link straight into the admin area.
    expect(screen.queryByTestId("auth.admin_link")).toHaveAttribute(
      "href",
      "/admin/login",
    );
    expect(screen.queryByRole("link", { name: /^admin$/i })).toBeNull();
  });
});
