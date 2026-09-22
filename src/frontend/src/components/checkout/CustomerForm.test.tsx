import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CustomerForm } from "@/components/checkout/CustomerForm";

const EMPTY = { fullName: "", mobileNumber: "", email: "" };

describe("CustomerForm", () => {
  it("blocks submission and shows errors for invalid details", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CustomerForm
        defaultValues={EMPTY}
        onValidChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByTestId("checkout.full_name_input"), "A");
    await user.type(
      screen.getByTestId("checkout.mobile_number_input"),
      "12345",
    );
    await user.type(screen.getByTestId("checkout.email_input"), "not-an-email");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByTestId("checkout.mobile_number_error"),
      ).toHaveTextContent(/valid PH mobile number/i);
    });
    expect(screen.getByTestId("checkout.email_error")).toHaveTextContent(
      /valid email address/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid customer details", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onValidChange = vi.fn();
    render(
      <CustomerForm
        defaultValues={EMPTY}
        onValidChange={onValidChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(
      screen.getByTestId("checkout.full_name_input"),
      "Maria Santos",
    );
    await user.type(
      screen.getByTestId("checkout.mobile_number_input"),
      "09175550142",
    );
    await user.type(
      screen.getByTestId("checkout.email_input"),
      "maria@example.ph",
    );

    // The form has no submit button of its own; submit it directly as the
    // checkout page does via `requestSubmit`.
    const form = document.getElementById(
      "checkout-customer-form",
    ) as HTMLFormElement;
    await act(async () => {
      form.requestSubmit();
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: "Maria Santos",
        mobileNumber: "09175550142",
        email: "maria@example.ph",
      });
    });
  });
});
