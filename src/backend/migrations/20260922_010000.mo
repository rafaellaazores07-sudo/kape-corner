import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Category = {
    id : Nat;
    name : Text;
    sortOrder : Nat;
  };

  type SizeOption = {
    id : Nat;
    name : Text;
    surcharge : Nat;
  };

  type AddOn = {
    id : Nat;
    name : Text;
    price : Nat;
    available : Bool;
  };

  type StoredFile = {
    blob : Blob;
    filename : Text;
    mimeType : Text;
  };

  type Product = {
    id : Nat;
    categoryId : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?StoredFile;
    available : Bool;
    sizeOptionIds : [Nat];
    addOnIds : [Nat];
  };

  type OrderType = {
    #dineIn;
    #takeOut;
  };

  type OrderStatus = {
    #orderReceived;
    #paymentVerification;
    #orderConfirmed;
    #preparing;
    #readyForPickup;
    #completed;
    #cancelled;
  };

  type PaymentMethod = {
    #gcash;
    #maya;
    #cash;
  };

  type LineCustomization = {
    sizeId : ?Nat;
    sugarLevel : ?Text;
    iceLevel : ?Text;
    milkOption : ?Text;
    addOnIds : [Nat];
  };

  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    unitPrice : Nat;
    lineTotal : Nat;
    customization : LineCustomization;
  };

  type DineInDetails = {
    tableNumber : Text;
    numberOfCustomers : Nat;
  };

  type TakeOutDetails = {
    pickupTime : Text;
  };

  type CustomerInfo = {
    fullName : Text;
    mobileNumber : Text;
    email : Text;
  };

  type PaymentInfo = {
    method : PaymentMethod;
    referenceNumber : ?Text;
    proof : ?StoredFile;
  };

  type Order = {
    orderNumber : Text;
    customer : CustomerInfo;
    orderType : OrderType;
    dineIn : ?DineInDetails;
    takeOut : ?TakeOutDetails;
    specialInstructions : Text;
    items : [OrderItem];
    subtotal : Nat;
    serviceFee : Nat;
    total : Nat;
    payment : PaymentInfo;
    status : OrderStatus;
    createdAt : Nat;
    updatedAt : Nat;
  };

  type PaymentSettings = {
    gcashNumber : Text;
    gcashQr : ?StoredFile;
    mayaNumber : Text;
    mayaQr : ?StoredFile;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    categories : Map.Map<Nat, Category>;
    products : Map.Map<Nat, Product>;
    sizeOptions : Map.Map<Nat, SizeOption>;
    addOns : Map.Map<Nat, AddOn>;
    orders : Map.Map<Text, Order>;
    paymentSettings : { var settings : PaymentSettings };
    counters : { var nextMenuId : Nat; var nextOrderSeq : Nat; var orderDate : Text };
  };

  public func migration(_old : OldActor) : NewActor {
    // --- Seed the menu ---------------------------------------------------
    let categories = Map.empty<Nat, Category>();
    categories.add(1, { id = 1; name = "Hot Coffee"; sortOrder = 1 });
    categories.add(2, { id = 2; name = "Iced Coffee"; sortOrder = 2 });
    categories.add(3, { id = 3; name = "Non-Coffee"; sortOrder = 3 });
    categories.add(4, { id = 4; name = "Pastries & Snacks"; sortOrder = 4 });

    let sizeOptions = Map.empty<Nat, SizeOption>();
    sizeOptions.add(1, { id = 1; name = "Small"; surcharge = 0 });
    sizeOptions.add(2, { id = 2; name = "Medium"; surcharge = 2000 });
    sizeOptions.add(3, { id = 3; name = "Large"; surcharge = 4000 });

    let addOns = Map.empty<Nat, AddOn>();
    addOns.add(1, { id = 1; name = "Extra Shot"; price = 3000; available = true });
    addOns.add(2, { id = 2; name = "Extra Syrup"; price = 2000; available = true });
    addOns.add(3, { id = 3; name = "Whipped Cream"; price = 2500; available = true });

    let drinkSizes : [Nat] = [1, 2, 3];
    let drinkAddOns : [Nat] = [1, 2, 3];
    let pastrySizes : [Nat] = [];
    let pastryAddOns : [Nat] = [];

    let products = Map.empty<Nat, Product>();
    // Hot Coffee
    products.add(1, { id = 1; categoryId = 1; name = "Americano"; description = "Rich espresso shots topped with hot water for a smooth, bold cup."; price = 12000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(2, { id = 2; categoryId = 1; name = "Cappuccino"; description = "Espresso with steamed milk and a thick layer of velvety foam."; price = 15000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(3, { id = 3; categoryId = 1; name = "Café Latte"; description = "Smooth espresso blended with plenty of steamed milk."; price = 15000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(4, { id = 4; categoryId = 1; name = "Caramel Macchiato"; description = "Vanilla-infused milk, espresso, and a sweet caramel drizzle."; price = 17000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(5, { id = 5; categoryId = 1; name = "Mocha"; description = "Espresso and steamed milk with rich chocolate and cocoa."; price = 17000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(6, { id = 6; categoryId = 1; name = "Espresso"; description = "A concentrated double shot of our signature house blend."; price = 10000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    // Iced Coffee
    products.add(7, { id = 7; categoryId = 2; name = "Iced Americano"; description = "Chilled espresso over ice with a crisp, refreshing finish."; price = 13000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(8, { id = 8; categoryId = 2; name = "Iced Latte"; description = "Espresso poured over cold milk and ice for a creamy chill."; price = 16000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(9, { id = 9; categoryId = 2; name = "Iced Caramel Macchiato"; description = "Layered vanilla milk, espresso, and caramel over ice."; price = 18000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(10, { id = 10; categoryId = 2; name = "Iced Mocha"; description = "Chocolate, espresso, and cold milk shaken over ice."; price = 18000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(11, { id = 11; categoryId = 2; name = "Spanish Latte"; description = "Espresso with sweetened condensed milk served over ice."; price = 17000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    // Non-Coffee
    products.add(12, { id = 12; categoryId = 3; name = "Chocolate"; description = "Rich, creamy hot chocolate made with real cocoa."; price = 14000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(13, { id = 13; categoryId = 3; name = "Matcha Latte"; description = "Stone-ground matcha whisked with smooth steamed milk."; price = 17000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(14, { id = 14; categoryId = 3; name = "Milk Tea"; description = "Creamy milk tea with chewy pearls, a Filipino favorite."; price = 15000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    products.add(15, { id = 15; categoryId = 3; name = "Fruit Tea"; description = "Refreshing brewed tea with real fruit and a citrus lift."; price = 14000; image = null; available = true; sizeOptionIds = drinkSizes; addOnIds = drinkAddOns });
    // Pastries & Snacks
    products.add(16, { id = 16; categoryId = 4; name = "Croissant"; description = "Flaky, buttery French pastry baked fresh every morning."; price = 8000; image = null; available = true; sizeOptionIds = pastrySizes; addOnIds = pastryAddOns });
    products.add(17, { id = 17; categoryId = 4; name = "Donut"; description = "Soft glazed donut with a sweet sugar finish."; price = 6000; image = null; available = true; sizeOptionIds = pastrySizes; addOnIds = pastryAddOns });
    products.add(18, { id = 18; categoryId = 4; name = "Muffin"; description = "Moist banana-chocolate chip muffin, baked in-house."; price = 7000; image = null; available = true; sizeOptionIds = pastrySizes; addOnIds = pastryAddOns });
    products.add(19, { id = 19; categoryId = 4; name = "Cookies"; description = "Chewy chocolate chip cookies, three pieces per order."; price = 5000; image = null; available = true; sizeOptionIds = pastrySizes; addOnIds = pastryAddOns });
    products.add(20, { id = 20; categoryId = 4; name = "Sandwich"; description = "Toasted ham and cheese sandwich on soft white bread."; price = 9500; image = null; available = true; sizeOptionIds = pastrySizes; addOnIds = pastryAddOns });

    {
      accessControlState = AccessControl.initState();
      categories;
      products;
      sizeOptions;
      addOns;
      orders = Map.empty();
      paymentSettings = {
        var settings = {
          gcashNumber = "[SHOP_GCASH_NUMBER]";
          gcashQr = null;
          mayaNumber = "[SHOP_MAYA_NUMBER]";
          mayaQr = null;
        };
      };
      counters = { var nextMenuId = 21; var nextOrderSeq = 1; var orderDate = "" };
    };
  };
};
