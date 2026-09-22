module {
  /// The audience a signed-in caller belongs to, as seen by the frontend.
  ///
  /// - `#anonymous` — no Internet Identity session, or a session that has not
  ///   registered with this backend yet.
  /// - `#customer` — a registered customer account. Customers may browse the
  ///   menu, place orders, and track orders, but never reach admin operations.
  /// - `#admin` — a registered staff account with full shop management access.
  public type CallerRole = {
    #anonymous;
    #customer;
    #admin;
  };
};
