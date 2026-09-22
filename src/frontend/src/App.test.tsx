import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for the app's default route, extended for the
 * dedicated staff sign-in route.
 *
 * Mounting the real router at `/` must render the home page inside the shared
 * layout rather than a blank screen, and `/admin/login` must resolve to the
 * staff sign-in page with the storefront chrome suppressed. Internet Identity
 * and the backend actor are replaced with local typed mocks; this is
 * component/integration coverage, not deployed browser E2E.
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

const getMenu = vi.fn(async () => ({
  categories: [],
  sizes: [],
  addOns: [],
  products: [],
}));

const roleQuery = {
  data: undefined as string | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

const bootstrapAccess = vi.fn();

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: { getMenu }, isFetching: false }),
  useCallerRole: () => roleQuery,
  useInitializeAccessControl: () => ({
    mutate: bootstrapAccess,
    isPending: false,
  }),
  storedFileBlob: (file: unknown) => file,
}));

import App from "@/App";

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<App />, { wrapper: Wrapper });
}

describe("App default route", () => {
  beforeEach(() => {
    identity.isAuthenticated = false;
    getMenu.mockClear();
    roleQuery.data = undefined;
    bootstrapAccess.mockReset();
  });

  it("renders the home page inside the layout instead of a blank screen", async () => {
    renderApp();

    // The shared layout chrome is present...
    expect(await screen.findByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main_content")).toBeInTheDocument();

    // ...and the default route's home content is mounted.
    await waitFor(() => {
      expect(screen.getByTestId("home.page")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { level: 1, name: /Fresh Coffee/i }),
    ).toBeInTheDocument();
  });

  it("resolves /admin/login to the staff sign-in page without storefront chrome", async () => {
    window.history.pushState({}, "", "/admin/login");
    renderApp();

    expect(await screen.findByTestId("admin.login.page")).toBeInTheDocument();
    expect(screen.getByText(/staff \/ admin/i)).toBeInTheDocument();
    // The customer header/footer are suppressed across the admin area.
    expect(screen.queryByTestId("header")).toBeNull();
    expect(screen.queryByTestId("footer")).toBeNull();
  });
});
