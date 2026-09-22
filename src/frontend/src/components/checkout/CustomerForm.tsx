import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CustomerInfo } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Please enter your mobile number.")
    .regex(
      /^(?:\+63|0)9\d{9}$/,
      "Enter a valid PH mobile number, e.g. 0917 123 4567.",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Enter a valid email address."),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  defaultValues: CustomerInfo;
  /** Called on every valid change so the checkout draft stays current. */
  onValidChange: (values: CustomerInfo) => void;
  /** Called with the latest values when the customer submits. */
  onSubmit: (values: CustomerInfo) => void;
}

/** Full name, mobile number, and email with required-field validation. */
export function CustomerForm({
  defaultValues,
  onValidChange,
  onSubmit,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    mode: "onTouched",
  });

  return (
    <Form {...form}>
      <form
        id="checkout-customer-form"
        data-ocid="checkout.customer_form"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          onValidChange(values);
          onSubmit(values);
        })}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-ocid="checkout.full_name_input"
                  autoComplete="name"
                  placeholder="Juan Dela Cruz"
                  className="h-11 rounded-xl"
                />
              </FormControl>
              <FormMessage data-ocid="checkout.full_name_error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-ocid="checkout.mobile_number_input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0917 123 4567"
                  className="h-11 rounded-xl"
                />
              </FormControl>
              <FormMessage data-ocid="checkout.mobile_number_error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-ocid="checkout.email_input"
                  type="email"
                  autoComplete="email"
                  placeholder="juan@email.com"
                  className="h-11 rounded-xl"
                />
              </FormControl>
              <FormMessage data-ocid="checkout.email_error" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
