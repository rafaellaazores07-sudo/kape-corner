import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import AccountTypes "../types/accounts";

module {
  /// Register the caller as a customer account.
  ///
  /// Customers are always assigned the `#user` role and can never claim the
  /// first-admin slot: only the staff portal's `_initialize_access_control`
  /// path can promote the first sign-in to `#admin`. An anonymous caller is
  /// ignored, matching the authorization mixin's own registration behavior.
  public func registerCustomer(state : AccessControl.AccessControlState, caller : Principal) : () {
    if (caller.isAnonymous()) { return };
    switch (state.userRoles.get(caller)) {
      case (?_) {};
      case (null) { state.userRoles.add(caller, #user) };
    };
  };

  /// Resolve the caller's audience without trapping.
  ///
  /// Unlike `getCallerUserRole`, an unregistered or anonymous caller resolves
  /// to `#anonymous` instead of raising an opaque reject, so the frontend can
  /// route a customer to the storefront and an admin to the admin area.
  public func getCallerRole(state : AccessControl.AccessControlState, caller : Principal) : AccountTypes.CallerRole {
    if (caller.isAnonymous()) { return #anonymous };
    switch (state.userRoles.get(caller)) {
      case null { #anonymous };
      case (?role) {
        switch (role) {
          case (#admin) { #admin };
          case (_) { #customer };
        };
      };
    };
  };
};
