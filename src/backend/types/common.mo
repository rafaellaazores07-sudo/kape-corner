import Storage "mo:caffeineai-object-storage/Storage";

module {
  /// Unique identifier for a product, category, add-on, order, or order line.
  public type Id = Nat;

  /// Wall-clock timestamp in nanoseconds since the Unix epoch.
  public type Timestamp = Nat;

  /// A monetary amount in Philippine centavos (₱1.00 = 100).
  public type Centavos = Nat;

  /// A reference to a file stored off-chain (product image, payment proof).
  public type FileRef = Storage.ExternalBlob;

  /// A stored file together with the metadata needed to display it.
  public type StoredFile = {
    blob : FileRef;
    filename : Text;
    mimeType : Text;
  };
};
