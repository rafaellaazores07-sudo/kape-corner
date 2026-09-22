import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for the admin area shell: once the guard admits an
 * admin, the dashboard renders its four management tabs, the signed-in
 * identity, the storefront link, and the sign-out action. The guard, the
 * Internet Identity hook, the caller-role hook, and each tab's data hooks are
 * replaced with local typed mocks; this is component/integration coverage, not
 * deployed browser E2E.
 */
const identity = {
  isAuthenticated: true,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  clear: vi.fn(),
  identity: {
    getPrincipal: () => ({
      toString: () => "aaaaa-bbbbb-ccccc-ddddd-eeeee-fff",
    }),
  },
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
  data: "admin" as string | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

vi.mock("@/lib/backend", () => ({
  useCallerRole: () => roleQuery,
}));

// The tab bodies are covered by their own suites; stub them so this file
// characterizes the shell and its tab wiring.
vi.mock("@/pages/admin/DashboardTab", () => ({
  DashboardTab: () => <div data-ocid="stub.dashboard" />,
}));
vi.mock("@/pages/admin/ProductsTab", () => ({
  ProductsTab: () => <div data-ocid="stub.products" />,
}));
vi.mock("@/pages/admin/OrdersTab", () => ({
  OrdersTab: () => <div data-ocid="stub.orders" />,
}));
vi.mock("@/pages/admin/PaymentsTab", () => ({
  PaymentsTab: () => <div data-ocid="stub.payments" />,
}));

import { AdminPage } from "@/pages/admin/AdminPage";

function renderAdmin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<AdminPage />, { wrapper: Wrapper });
}

describe("AdminPage", () => {
  beforeEach(() => {
    identity.isAuthenticated = true;
    identity.clear.mockReset();
    roleQuery.data = "admin";
    navigate.mockReset();
  });

  it("renders the dashboard shell with all four management tabs for an admin", () => {
    renderAdmin();

    expect(screen.getByTestId("admin.page")).toBeInTheDocument();
    const tabs = screen.getByTestId("admin.tabs");
    for (const [value, label] of [
      ["dashboard", "Dashboard"],
      ["products", "Products"],
      ["orders", "Orders"],
      ["payments", "Payments"],
    ] as const) {
      expect(
        within(tabs).getByRole("tab", { name: label }),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`admin.tab.${value}`)).toBeInTheDocument();
    }

    // The dashboard tab is the default panel.
    expect(screen.getByTestId("stub.dashboard")).toBeInTheDocument();
  });

  it("shows the signed-in admin identity and a storefront link", () => {
    renderAdmin();

    expect(screen.getByTestId("admin.identity")).toHaveTextContent(
      "aaaaa-bbb…ee-fff",
    );
    expect(screen.getByTestId("admin.storefront_link")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("switches the visible panel when another tab is selected", async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(screen.getByTestId("admin.tab.orders"));

    expect(screen.getByTestId("stub.orders")).toBeInTheDocument();
  });

  it("signs out from the admin header back to the staff login", async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(screen.getByTestId("admin.signout_button"));

    expect(identity.clear).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({
      to: "/admin/login",
      replace: true,
    });
  });
});
