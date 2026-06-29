/*
 * ALLURE — product catalog (single source of truth)
 *
 * This data drives every page. It's a plain .js file (not products.json) so the
 * site works when you open the HTML files directly by double-clicking them —
 * browsers block fetch() of local JSON over the file:// protocol.
 *
 * When you deploy to a real web server you can move this array into a
 * products.json file and load it with fetch('products.json') instead.
 *
 * Fields:
 *   id       unique slug, used in cart + product.html?id=
 *   name     display name
 *   brand    used for filtering / display
 *   price    number, in Naira (no symbol)
 *   image    product photo URL
 *   category "new-arrivals" | "gift-sets"
 *   gender   "men" | "women" | "unisex"
 *   family   "amber" | "woody" | "floral" | "fresh" | "fruity" | "spicy"
 *   size     bottle size text
 *   notes    { top, heart, base } scent pyramid
 *   description short marketing copy
 */
const PRODUCTS = [
  {
    id: "gucci-oud-intense-90",
    name: "Gucci Oud Intense Men EDP 90ml",
    brand: "Gucci",
    price: 48000,
    image: "https://www.essenza.ng/cdn/shop/products/gucci_oud_intense_men_edp_90ml-min_1_3b848e42-c09d-430f-85f3-6d8f1942d362_500x.jpg?v=1629886008",
    category: "new-arrivals",
    gender: "men",
    family: "amber",
    size: "90ml EDP",
    sizes: [
      { label: "50ml", price: 32000 },
      { label: "90ml", price: 48000 },
    ],
    notes: { top: "Raspberry, Saffron", heart: "Bulgarian Rose, Oud", base: "Patchouli, Amber" },
    description: "A bold, smoky oriental built around precious oud and warm amber — an unmistakable statement scent.",
  },
  {
    id: "nishane-hacivat-50",
    name: "Nishane Hacivat 50ml",
    brand: "Nishane",
    price: 95000,
    image: "https://www.essenza.ng/cdn/shop/products/1_a56ef2c4-1a49-4cbe-9550-df96cc2d8ee3_500x.jpg?v=1629906365",
    category: "new-arrivals",
    gender: "unisex",
    family: "woody",
    size: "50ml Extrait",
    sizes: [
      { label: "50ml", price: 95000 },
      { label: "100ml", price: 165000 },
    ],
    notes: { top: "Pineapple, Bergamot", heart: "Oakmoss, Jasmine", base: "Cedar, Patchouli" },
    description: "A fruity-chypre powerhouse: juicy pineapple over a sophisticated mossy, woody base.",
  },
  {
    id: "ysl-y-men-100",
    name: "YSL Y Men EDP 100ml",
    brand: "Yves Saint Laurent",
    price: 210000,
    image: "https://www.essenza.ng/cdn/shop/products/yves_saint_laurent_y_edp_100ml_perfume_for_men_700x.jpg?v=1629984925",
    category: "new-arrivals",
    gender: "men",
    family: "fresh",
    size: "100ml EDP",
    sizes: [
      { label: "60ml", price: 150000 },
      { label: "100ml", price: 210000 },
    ],
    notes: { top: "Apple, Ginger, Bergamot", heart: "Sage, Geranium", base: "Tonka Bean, Cedar, Amberwood" },
    description: "Fresh and modern with a confident woody-aromatic dry-down. A versatile everyday signature.",
  },
  {
    id: "franck-olivier-oud-touch-100",
    name: "Franck Olivier Oud Touch EDP 100ml",
    brand: "Franck Olivier",
    price: 120000,
    image: "https://www.essenza.ng/cdn/shop/products/franck_olivier_oud_touch_edp_100ml-min_078c8666-c7ae-4024-b7c8-06aa04aca808_900x.jpg?v=1629884168",
    category: "new-arrivals",
    gender: "unisex",
    family: "amber",
    size: "100ml EDP",
    notes: { top: "Bergamot, Spices", heart: "Oud, Rose", base: "Amber, Musk, Vanilla" },
    description: "A rich, affordable oud blend — warm, resinous and long-lasting for cooler evenings.",
  },
  {
    id: "armani-acqua-di-gio-profumo-125",
    name: "Armani Acqua Di Gio Profumo 125ml",
    brand: "Giorgio Armani",
    price: 88000,
    image: "https://www.essenza.ng/cdn/shop/products/armani_acqua_di_gio_profumo_edp_pack_125ml_900x.jpg?v=1611606036",
    category: "new-arrivals",
    gender: "men",
    family: "fresh",
    size: "125ml Parfum",
    sizes: [
      { label: "75ml", price: 62000 },
      { label: "125ml", price: 88000 },
    ],
    notes: { top: "Sea Notes, Bergamot", heart: "Geranium, Rosemary, Sage", base: "Incense, Patchouli" },
    description: "The iconic aquatic, deepened with smoky incense. Crisp marine freshness with a refined edge.",
  },
  {
    id: "armaf-club-de-nuit-intense-105",
    name: "Armaf Club De Nuit Intense Man EDT 105ml",
    brand: "Armaf",
    price: 198000,
    image: "https://www.essenza.ng/cdn/shop/products/Untitleddesign_54_800x.jpg?v=1616575312",
    category: "new-arrivals",
    gender: "men",
    family: "spicy",
    size: "105ml EDT",
    notes: { top: "Pineapple, Blackcurrant, Apple", heart: "Birch, Jasmine, Rose", base: "Vanilla, Musk, Ambergris" },
    description: "A fan-favourite fruity-smoky blend with serious projection and value. A wardrobe essential.",
  },
  {
    id: "amouage-floral-woman-3x100",
    name: "Amouage Floral Woman EDP 3x100ml",
    brand: "Amouage",
    price: 528000,
    image: "https://www.essenza.ng/cdn/shop/products/Untitleddesign_39_800x.jpg?v=1616575264",
    category: "gift-sets",
    gender: "women",
    family: "floral",
    size: "Gift Set · 3x100ml",
    notes: { top: "Bergamot, Pink Pepper", heart: "Rose, Jasmine, Orris", base: "Amber, Musk, Sandalwood" },
    description: "A luxurious trio of opulent florals — a statement gift for the discerning collector.",
  },
  {
    id: "ch-212-vip-black-100",
    name: "Carolina Herrera 212 VIP Black 100ml EDP",
    brand: "Carolina Herrera",
    price: 255000,
    image: "https://www.essenza.ng/cdn/shop/products/Carolina-Herrera-212-VIP-Black-Set-5-600x600_600x.jpg?v=1616575475",
    category: "gift-sets",
    gender: "men",
    family: "spicy",
    size: "Gift Set · 100ml EDP",
    notes: { top: "Absinthe, Black Pepper", heart: "Lavender", base: "Vanilla, Musk, Leather" },
    description: "A dark, addictive party scent — boozy absinthe over sweet vanilla. Made for the night.",
  },
  {
    id: "ch-212-nyc-edt-100",
    name: "Carolina Herrera 212 NYC EDT 100ml",
    brand: "Carolina Herrera",
    price: 210000,
    image: "https://www.essenza.ng/cdn/shop/products/20_a94e2113-09e7-467f-b17b-47358c18a650_1000x.jpg?v=1616575469",
    category: "gift-sets",
    gender: "unisex",
    family: "floral",
    size: "Gift Set · 100ml EDT",
    notes: { top: "Bergamot, Bourbon", heart: "Gardenia, Magnolia", base: "Musk, Sandalwood" },
    description: "Clean, metropolitan and effortlessly chic — the cosmopolitan classic from Carolina Herrera.",
  },
  {
    id: "amouage-dia-woman-100",
    name: "Amouage Dia Woman EDP 100ml + Body Lotion",
    brand: "Amouage",
    price: 310000,
    image: "https://www.essenza.ng/cdn/shop/products/5dedd2cb-c0f3-40cd-805d-aebe89d27bc6_800x.jpg?v=1616575261",
    category: "gift-sets",
    gender: "women",
    family: "floral",
    size: "Gift Set · 100ml + BL",
    notes: { top: "Bergamot, Cyclamen", heart: "Peony, Orris, Incense", base: "Musk, Sandalwood, Vanilla" },
    description: "A soft, powdery floral of rare elegance, paired with a matching body lotion.",
  },
  {
    id: "hugo-boss-no6-travel-100",
    name: "Hugo Boss No 6 Travel Edition 100ml + Shampoo",
    brand: "Hugo Boss",
    price: 148000,
    image: "https://www.essenza.ng/cdn/shop/products/A_900x.jpg?v=1616576866",
    category: "gift-sets",
    gender: "men",
    family: "fresh",
    size: "Gift Set · 100ml + Shower Gel",
    notes: { top: "Apple, Bergamot", heart: "Geranium, Jasmine", base: "Sandalwood, Vetiver, Olive Blossom" },
    description: "The timeless fresh-fruity classic, packaged as a complete grooming gift set.",
  },
  {
    id: "versace-dylan-blue-turquoise-100",
    name: "Versace Dylan Blue Turquoise EDT 100ml + 5ml",
    brand: "Versace",
    price: 98000,
    image: "https://www.essenza.ng/cdn/shop/products/download_2_304x.jpg?v=1673615730",
    category: "gift-sets",
    gender: "women",
    family: "fruity",
    size: "Gift Set · 100ml + 5ml",
    notes: { top: "Granny Smith Apple, Kiwi, Bergamot", heart: "Guava, Jasmine, Peony", base: "Musk, Amber, Sandalwood" },
    description: "A vibrant, summery fruity-floral with a splash of aquatic freshness, plus a travel mini.",
  },
];

// Expose the catalog for both classic <script> usage and module bundlers.
if (typeof window !== "undefined") window.PRODUCTS = PRODUCTS;
// Allow the Node backend to import this catalog for seeding the database.
if (typeof module !== "undefined" && module.exports) module.exports = PRODUCTS;
