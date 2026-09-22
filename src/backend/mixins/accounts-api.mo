import AccessControl "mo:caffeineai-authorization/access-control";
import AccountTypes "../types/accounts";
import AccountsLib "../lib/accounts";

mixin (accessControlState : AccessControl.AccessControlState) {
  /// Register the caller as a customer account.
  ///
  /// This is the customer portal's registration path. It always assigns the
  /// `#user` role, so a customer signing in first can never claim the shop's
  /// admin account — only the staff portal's `_initialize_access_control`
  /// path can promote the first sign-in to `#admin`. Calling it again for an
  /// already-registered caller is a no-op.
  public shared ({ caller }) func registerCustomer() : async () {
    AccountsLib.registerCustomer(accessControlState, caller);
  };

  /// Resolve the caller's audience for role-aware routing.
  ///
  /// Never traps: an anonymous or not-yet-registered caller resolves to
  /// `#anonymous`, a registered customer to `#customer`, and a registered
  /// staff account to `#admin`.
  public query ({ caller }) func getCallerRole() : async AccountTypes.CallerRole {
    AccountsLib.getCallerRole(accessControlState, caller);
  };
};
