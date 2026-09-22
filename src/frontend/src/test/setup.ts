import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` hooks rather than ARIA test ids.
configure({ testIdAttribute: "data-ocid" });

afterEach(() => {
  cleanup();
});
