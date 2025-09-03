import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation keys
const translations = {
  en: {
    // Header
    brand: "PhotoEshop",
    gallery: "Gallery",
    adminPanel: "Admin Panel",
    cart: "Cart",
    logout: "Logout",
    
    // Gallery
    premiumEventPhotos: "Premium Event Photos",
    galleryDescription: "Discover stunning moments captured at your events. Browse our curated collection and purchase high-quality, watermark-free photos.",
    allCategories: "All categories",
    allPhotos: "All Photos",
    recent: "Recent",
    collections: "Collections",
    allPhotosCollection: "All Photos",
    uncategorized: "Uncategorized",
    noPhotosAvailable: "No photos available yet",
    checkBackLater: "Check back later for new event photos!",
    viewFullSize: "View full size",
    addToCart: "Add to cart",
    alreadyInCart: "Already in cart",
    
    // Cart
    shoppingCart: "Shopping Cart",
    yourCart: "Your Cart",
    clearCart: "Clear Cart",
    backToGallery: "Back to Gallery",
    quantity: "Quantity",
    remove: "Remove",
    subtotal: "Subtotal",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    cartEmpty: "Your cart is empty",
    addSomePhotos: "Add some photos to get started!",
    photo: "Photo",
    photos: "Photos",
    selected: "selected",
    processingFee: "Processing fee",
    free: "Free",
    securePayment: "Secure payment powered by myPOS",
    cleanPhotosDelivered: "Clean photos delivered via email after payment",
    uploaded: "Uploaded",
    
    // Checkout
    checkout: "Checkout",
    customerInformation: "Customer Information",
    orderSummary: "Order Summary",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    city: "City",
    postalCode: "Postal Code",
    country: "Country",
    paymentProcessing: "Processing payment...",
    paymentSuccess: "Payment successful!",
    paymentError: "Payment failed. Please try again.",
    paySafelyWithMyPOS: "Pay safely with myPOS Embedded Checkout",
    fullName: "Full Name",
    emailAddress: "Email Address",
    weWillSendPhotosHere: "We'll send your photos here.",
    proceedToPayment: "Proceed to Payment",
    orderCreated: "Order Created",
    orderId: "Order ID",
    loadingPaymentForm: "Loading payment form",
    fees: "Fees",
    payment: "Payment",
    
    // Admin Panel
    managePhotos: "Manage your photo collection",
    upload: "Upload",
    galleryManagement: "Gallery Management",
    categories: "Categories",
    orders: "Orders",
    analytics: "Analytics",
    selectFiles: "Select Files",
    uploadPhotos: "Upload Photos",
    selectCategory: "Select Category",
    setPrice: "Set Price",
    pricePlaceholder: "e.g. 5 or 5.99",
    editPhoto: "Edit Photo",
    deletePhoto: "Delete Photo",
    saveChanges: "Save Changes",
    addCategory: "Add Category",
    categoryName: "Category Name",
    addNewCategory: "Add New Category",
    noCategoriesYet: "No categories yet",
    clearForm: "Clear Form",
    totalPhotos: "Total Photos",
    totalCategories: "Total Categories",
    totalOrders: "Total Orders",
    totalRevenue: "Total Revenue",
    
    // Common
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    tryAgain: "Try Again",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    
    // Photo Modal
    watermarkedPreview: "Watermarked Preview",
    photoDetails: "Photo Details",
    whatYoullGet: "What You'll Get",
    highResolutionClean: "High-resolution clean version",
    noWatermarks: "No watermarks or logos",
    professionalQuality: "Professional quality",
    instantEmailDelivery: "Instant email delivery",
    addedToCart: "Added to Cart",
    downloadPreview: "Download Preview",
    note: "Note",
    watermarkedPreviewNote: "This is a watermarked preview. Purchase to receive the clean, high-resolution version via email.",
    
    // Additional Checkout & Cart
    failedToLoadMyPOS: "Failed to load myPOS SDK",
    pleaseFillRequiredFields: "Please fill in all required fields",
    myPOSStillLoading: "myPOS is still loading…",
    checkoutFailed: "Checkout failed. Please try again.",
    backToCart: "Back to cart",
    clickProceedToPayment: "Click \"Proceed to Payment\" to load the myPOS secure card form here.",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    removeFromCart: "Remove from cart",
    
    // Admin Panel Additional
    pleaseChooseAtLeastOnePhoto: "Please choose at least one photo",
    pleaseSelectCategory: "Please select a category",
    pleaseEnterValidPrice: "Please enter a valid price (>= 0)",
    pleaseEnterPrice: "Please enter a price",
    johnDoe: "John Doe",
    uploadMultipleOnly: "Upload (Multiple Only)",
    manageGallery: "Manage Gallery",
    uploading: "Uploading...",
    filterByCategory: "Filter by category",
    selectForBulkActions: "Select for bulk actions",
    uploadFailed: "Upload failed",
    
    // Photo Gallery Additional
    category: "Category",
    timeFilter: "Time filter",
    viewMode: "View mode",
    gridView: "Grid view",
    listView: "List view",
    collectionsSidebar: "Collections sidebar",
    
    // Header Additional
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch language",
    
    // Admin Panel Final
    refresh: "Refresh",
    refreshOrders: "Refresh Orders",
    deleteSelected: "Delete Selected",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    orderHistory: "Order History",
    deleteSelectedPhotos: "Delete {count} selected photo(s)?",
    bulkDeleteFailed: "Bulk delete failed",
    bulkDeleteSuccess: "Successfully deleted {count} photos",
    deleteThisPhoto: "Delete this photo?",
    deleteFailed: "Delete failed",
    
    // Category Management
    noPhotosInCategory: "No photos found in category '{category}'",
    deleteAllPhotosFromCategory: "Delete all {count} photos from category '{category}'?",
    deleteAllPhotosFromCategorySuccess: "Successfully deleted {count} photos from category '{category}'",
    deleteAllPhotosFromCategoryFailed: "Failed to delete photos from category",
    deleteAllPhotos: "Delete All Photos",
    deleteCategory: "Delete Category"
  },
  el: {
    // Header
    brand: "PhotoEshop",
    gallery: "Γκαλερί",
    adminPanel: "Πίνακας Διαχείρισης",
    cart: "Καλάθι",
    logout: "Αποσύνδεση",
    
    // Gallery
    premiumEventPhotos: "Φωτογραφίες Εκδηλώσεων Premium",
    galleryDescription: "Ανακαλύψτε εντυπωσιακές στιγμές που καταγράφηκαν στις εκδηλώσεις σας. Περιηγηθείτε στη συλλογή μας και αγοράστε φωτογραφίες υψηλής ποιότητας χωρίς υδατόσημα.",
    allCategories: "Όλες οι κατηγορίες",
    allPhotos: "Όλες οι Φωτογραφίες",
    recent: "Πρόσφατες",
    collections: "Συλλογές",
    allPhotosCollection: "Όλες οι Φωτογραφίες",
    uncategorized: "Χωρίς Κατηγορία",
    noPhotosAvailable: "Δεν υπάρχουν διαθέσιμες φωτογραφίες ακόμα",
    checkBackLater: "Ελέγξτε ξανά αργότερα για νέες φωτογραφίες εκδηλώσεων!",
    viewFullSize: "Προβολή σε πλήρες μέγεθος",
    addToCart: "Προσθήκη στο καλάθι",
    alreadyInCart: "Ήδη στο καλάθι",
    
    // Cart
    shoppingCart: "Καλάθι Αγορών",
    yourCart: "Το Καλάθι σας",
    clearCart: "Άδειασμα Καλαθιού",
    backToGallery: "Επιστροφή στη Γκαλερί",
    quantity: "Ποσότητα",
    remove: "Αφαίρεση",
    subtotal: "Υποσύνολο",
    total: "Σύνολο",
    proceedToCheckout: "Συνέχεια στην Αγορά",
    cartEmpty: "Το καλάθι σας είναι άδειο",
    addSomePhotos: "Προσθέστε μερικές φωτογραφίες για να ξεκινήσετε!",
    photo: "Φωτογραφία",
    photos: "Φωτογραφίες",
    selected: "επιλεγμένες",
    processingFee: "Τέλος επεξεργασίας",
    free: "Δωρεάν",
    securePayment: "Ασφαλής πληρωμή με myPOS",
    cleanPhotosDelivered: "Καθαρές φωτογραφίες μετά την πληρωμή μέσω email",
    uploaded: "Ανεβλήθηκε",
    
    // Checkout
    checkout: "Αγορά",
    customerInformation: "Στοιχεία Πελάτη",
    orderSummary: "Περίληψη Παραγγελίας",
    name: "Όνομα",
    email: "Email",
    phone: "Τηλέφωνο",
    address: "Διεύθυνση",
    city: "Πόλη",
    postalCode: "Ταχυδρομικός Κώδικας",
    country: "Χώρα",
    paymentProcessing: "Επεξεργασία πληρωμής...",
    paymentSuccess: "Η πληρωμή ήταν επιτυχής!",
    paymentError: "Η πληρωμή απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
    paySafelyWithMyPOS: "Πληρωμή με ασφάλεια μέσω myPOS Embedded Checkout",
    fullName: "Ονοματεπώνυμο",
    emailAddress: "Διεύθυνση Email",
    weWillSendPhotosHere: "Θα σας στείλουμε τις φωτογραφίες εδώ.",
    proceedToPayment: "Συνέχεια στην Πληρωμή",
    orderCreated: "Η Παραγγελία Δημιουργήθηκε",
    orderId: "Αριθμός Παραγγελίας",
    loadingPaymentForm: "Φόρτωση φόρμας πληρωμής",
    fees: "Τέλη",
    payment: "Πληρωμή",
    
    // Admin Panel
    managePhotos: "Διαχείριση της συλλογής φωτογραφιών σας",
    upload: "Ανέβασμα",
    galleryManagement: "Διαχείριση Γκαλερί",
    categories: "Κατηγορίες",
    orders: "Παραγγελίες",
    analytics: "Αναλυτικά",
    selectFiles: "Επιλογή Αρχείων",
    uploadPhotos: "Ανέβασμα Φωτογραφιών",
    selectCategory: "Επιλογή Κατηγορίας",
    setPrice: "Ορισμός Τιμής",
    pricePlaceholder: "π.χ. 5 ή 5.99",
    editPhoto: "Επεξεργασία Φωτογραφίας",
    deletePhoto: "Διαγραφή Φωτογραφίας",
    saveChanges: "Αποθήκευση Αλλαγών",
    addCategory: "Προσθήκη Κατηγορίας",
    categoryName: "Όνομα Κατηγορίας",
    addNewCategory: "Προσθήκη Νέας Κατηγορίας",
    noCategoriesYet: "Δεν υπάρχουν κατηγορίες ακόμα",
    clearForm: "Καθαρισμός Φόρμας",
    totalPhotos: "Συνολικές Φωτογραφίες",
    totalCategories: "Συνολικές Κατηγορίες",
    totalOrders: "Συνολικές Παραγγελίες",
    totalRevenue: "Συνολικά Έσοδα",
    
    // Common
    loading: "Φόρτωση...",
    error: "Σφάλμα",
    retry: "Επανάληψη",
    tryAgain: "Δοκιμάστε Ξανά",
    save: "Αποθήκευση",
    delete: "Διαγραφή",
    edit: "Επεξεργασία",
    close: "Κλείσιμο",
    yes: "Ναι",
    no: "Όχι",
    confirm: "Επιβεβαίωση",
    
    // Photo Modal
    watermarkedPreview: "Προεπισκόπηση με Υδατόσημο",
    photoDetails: "Στοιχεία Φωτογραφίας",
    whatYoullGet: "Τι Θα Λάβετε",
    highResolutionClean: "Καθαρή έκδοση υψηλής ανάλυσης",
    noWatermarks: "Χωρίς υδατόσημα ή λογότυπα",
    professionalQuality: "Επαγγελματική ποιότητα",
    instantEmailDelivery: "Άμεση παράδοση μέσω email",
    addedToCart: "Προστέθηκε στο Καλάθι",
    downloadPreview: "Λήψη Προεπισκόπησης",
    note: "Σημείωση",
    watermarkedPreviewNote: "Αυτή είναι μια προεπισκόπηση με υδατόσημο. Αγοράστε για να λάβετε την καθαρή έκδοση υψηλής ανάλυσης μέσω email.",
    
    // Additional Checkout & Cart
    failedToLoadMyPOS: "Αποτυχία φόρτωσης myPOS SDK",
    pleaseFillRequiredFields: "Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία",
    myPOSStillLoading: "Το myPOS φορτώνει ακόμα…",
    checkoutFailed: "Η αγορά απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
    backToCart: "Επιστροφή στο καλάθι",
    clickProceedToPayment: "Κάντε κλικ στο \"Συνέχεια στην Πληρωμή\" για να φορτώσει η ασφαλής φόρμα κάρτας myPOS εδώ.",
    decreaseQuantity: "Μείωση ποσότητας",
    increaseQuantity: "Αύξηση ποσότητας",
    removeFromCart: "Αφαίρεση από το καλάθι",
    
    // Admin Panel Additional
    pleaseChooseAtLeastOnePhoto: "Παρακαλώ επιλέξτε τουλάχιστον μία φωτογραφία",
    pleaseSelectCategory: "Παρακαλώ επιλέξτε κατηγορία",
    pleaseEnterValidPrice: "Παρακαλώ εισάγετε έγκυρη τιμή (>= 0)",
    pleaseEnterPrice: "Παρακαλώ εισάγετε τιμή",
    johnDoe: "Γιάννης Παπαδόπουλος",
    uploadMultipleOnly: "Ανέβασμα (Μόνο Πολλαπλά)",
    manageGallery: "Διαχείριση Γκαλερί",
    uploading: "Ανέβασμα...",
    filterByCategory: "Φιλτράρισμα κατά κατηγορία",
    selectForBulkActions: "Επιλογή για μαζικές ενέργειες",
    uploadFailed: "Αποτυχία ανεβάσματος",
    
    // Photo Gallery Additional
    category: "Κατηγορία",
    timeFilter: "Φίλτρο χρόνου",
    viewMode: "Λειτουργία προβολής",
    gridView: "Προβολή πλέγματος",
    listView: "Προβολή λίστας",
    collectionsSidebar: "Πλαϊνή μπάρα συλλογών",
    
    // Header Additional
    toggleTheme: "Εναλλαγή θέματος",
    switchLanguage: "Εναλλαγή γλώσσας",
    
    // Admin Panel Final
    refresh: "Ανανέωση",
    refreshOrders: "Ανανέωση Παραγγελιών",
    deleteSelected: "Διαγραφή Επιλεγμένων",
    selectAll: "Επιλογή Όλων",
    deselectAll: "Αποεπιλογή Όλων",
    orderHistory: "Ιστορικό Παραγγελιών",
    deleteSelectedPhotos: "Διαγραφή {count} επιλεγμένων φωτογραφιών;",
    bulkDeleteFailed: "Αποτυχία μαζικής διαγραφής",
    bulkDeleteSuccess: "Επιτυχής διαγραφή {count} φωτογραφιών",
    deleteThisPhoto: "Διαγραφή αυτής της φωτογραφίας;",
    deleteFailed: "Αποτυχία διαγραφής",
    
    // Category Management
    noPhotosInCategory: "Δεν βρέθηκαν φωτογραφίες στην κατηγορία '{category}'",
    deleteAllPhotosFromCategory: "Διαγραφή όλων των {count} φωτογραφιών από την κατηγορία '{category}';",
    deleteAllPhotosFromCategorySuccess: "Επιτυχής διαγραφή {count} φωτογραφιών από την κατηγορία '{category}'",
    deleteAllPhotosFromCategoryFailed: "Αποτυχία διαγραφής φωτογραφιών από την κατηγορία",
    deleteAllPhotos: "Διαγραφή Όλων των Φωτογραφιών",
    deleteCategory: "Διαγραφή Κατηγορίας"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'el' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
