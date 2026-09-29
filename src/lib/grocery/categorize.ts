import type { Category } from "./types";

/**
 * Keyword dictionary used to sort items into store aisles.
 * Matching is done on whole words, and the longest matching keyword wins,
 * so "almond milk" beats "almond" (Snacks) and lands in Dairy alternatives.
 */
const KEYWORDS: Record<Category, string[]> = {
  Produce: [
    "apple", "apples", "banana", "bananas", "orange", "oranges", "lemon", "lemons", "lime", "limes",
    "grape", "grapes", "strawberry", "strawberries", "blueberry", "blueberries", "raspberry", "raspberries",
    "blackberry", "blackberries", "cherry", "cherries", "peach", "peaches", "plum", "plums", "pear", "pears",
    "mango", "mangoes", "mangos", "pineapple", "watermelon", "cantaloupe", "melon", "honeydew", "kiwi",
    "avocado", "avocados", "tomato", "tomatoes", "cherry tomatoes", "potato", "potatoes", "sweet potato",
    "sweet potatoes", "onion", "onions", "red onion", "green onion", "green onions", "scallions", "shallot",
    "shallots", "garlic", "ginger", "carrot", "carrots", "celery", "lettuce", "romaine", "spinach", "kale",
    "arugula", "spring mix", "salad", "salad mix", "cabbage", "broccoli", "cauliflower", "brussels sprouts",
    "asparagus", "green beans", "peas", "snap peas", "corn", "cucumber", "cucumbers", "zucchini", "squash",
    "butternut squash", "eggplant", "bell pepper", "bell peppers", "pepper", "peppers", "jalapeno",
    "jalapenos", "jalapeño", "mushroom", "mushrooms", "radish", "radishes", "beet", "beets", "turnip",
    "leek", "leeks", "fennel", "bok choy", "cilantro", "parsley", "basil", "mint", "dill", "rosemary",
    "thyme", "herbs", "fruit", "berries", "grapefruit", "clementines", "clementine", "tangerine",
    "tangerines", "pomegranate", "figs", "dates", "coconut", "papaya", "apricot", "apricots", "nectarine",
    "nectarines", "cranberries", "sprouts", "microgreens", "tofu", "tempeh", "hummus", "guacamole", "salsa",
    "lemongrass", "plantain", "plantains", "yam", "yams", "collard greens", "chard", "swiss chard", "endive",
    "artichoke", "artichokes", "okra", "rhubarb", "persimmon", "persimmons", "lychee", "kimchi", "sauerkraut",
  ],
  Bakery: [
    "bread", "loaf", "bagel", "bagels", "bun", "buns", "hamburger buns", "hot dog buns", "roll", "rolls",
    "dinner rolls", "baguette", "sourdough", "croissant", "croissants", "muffin", "muffins", "english muffins",
    "tortilla", "tortillas", "pita", "naan", "cake", "cupcakes", "pie", "donut", "donuts", "doughnuts",
    "pastry", "pastries", "brioche", "ciabatta", "focaccia", "rye", "pumpernickel", "cookies", "biscuits",
    "wraps", "flatbread", "cinnamon rolls", "danish", "scones",
  ],
  Deli: [
    "deli", "deli meat", "lunch meat", "sliced turkey", "sliced ham", "ham", "turkey breast", "salami",
    "prosciutto", "pepperoni", "roast beef", "pastrami", "bologna", "mortadella", "cheese", "cheddar",
    "mozzarella", "parmesan", "parmigiano", "swiss", "provolone", "gouda", "brie", "feta", "goat cheese",
    "blue cheese", "gruyere", "gruyère", "havarti", "pepper jack", "monterey jack", "cream cheese",
    "string cheese", "shredded cheese", "sliced cheese", "cheese slices", "olives", "antipasto", "rotisserie chicken",
    "potato salad", "coleslaw", "macaroni salad", "charcuterie",
  ],
  "Meat & Seafood": [
    "chicken", "chicken breast", "chicken breasts", "chicken thighs", "chicken wings", "chicken legs",
    "drumsticks", "whole chicken", "ground chicken", "turkey", "ground turkey", "beef", "ground beef",
    "steak", "steaks", "ribeye", "sirloin", "filet", "brisket", "chuck roast", "roast", "short ribs", "ribs",
    "pork", "pork chops", "pork loin", "pork shoulder", "pork belly", "bacon", "sausage", "sausages",
    "bratwurst", "brats", "hot dogs", "hotdogs", "lamb", "lamb chops", "veal", "meatballs", "burgers",
    "burger patties", "patties", "fish", "salmon", "tuna steak", "cod", "tilapia", "halibut", "trout",
    "shrimp", "prawns", "scallops", "crab", "lobster", "clams", "mussels", "oysters", "calamari", "squid",
    "seafood", "meat", "chorizo", "kielbasa", "andouille", "duck", "bison", "venison", "stew meat",
    "flank steak", "skirt steak", "tenderloin", "wings", "thighs", "breasts",
  ],
  "Dairy & Eggs": [
    "milk", "whole milk", "skim milk", "2% milk", "oat milk", "almond milk", "soy milk", "coconut milk",
    "half and half", "half & half", "cream", "heavy cream", "whipping cream", "sour cream", "creamer",
    "coffee creamer", "butter", "margarine", "eggs", "egg", "egg whites", "yogurt", "greek yogurt",
    "yoghurt", "kefir", "cottage cheese", "ricotta", "whipped cream", "buttermilk", "ghee", "pudding",
    "jello", "pillsbury", "biscuit dough", "cookie dough", "crescent rolls", "orange juice", "oj",
  ],
  Frozen: [
    "frozen", "ice cream", "popsicles", "popsicle", "ice pops", "frozen pizza", "pizza", "frozen vegetables",
    "frozen veggies", "frozen peas", "frozen corn", "frozen berries", "frozen fruit", "frozen waffles",
    "waffles", "tater tots", "french fries", "fries", "hash browns", "frozen dinner", "frozen meals",
    "hot pockets", "pierogies", "dumplings", "edamame", "ice", "sorbet", "gelato", "frozen shrimp",
    "fish sticks", "chicken nuggets", "nuggets", "veggie burgers", "frozen burritos", "eggo",
  ],
  Pantry: [
    "rice", "white rice", "brown rice", "jasmine rice", "basmati", "pasta", "spaghetti", "penne", "macaroni",
    "noodles", "ramen", "lasagna noodles", "quinoa", "couscous", "lentils", "beans", "black beans",
    "kidney beans", "chickpeas", "garbanzo", "pinto beans", "canned beans", "canned tomatoes", "tomato sauce",
    "tomato paste", "diced tomatoes", "crushed tomatoes", "marinara", "pasta sauce", "alfredo", "pesto",
    "soup", "broth", "stock", "chicken broth", "chicken stock", "beef broth", "vegetable broth", "bouillon",
    "flour", "all purpose flour", "bread flour", "sugar", "brown sugar", "powdered sugar", "honey",
    "maple syrup", "syrup", "baking soda", "baking powder", "yeast", "vanilla", "vanilla extract",
    "chocolate chips", "cocoa", "cocoa powder", "oats", "oatmeal", "cereal", "granola", "pancake mix",
    "cake mix", "brownie mix", "oil", "olive oil", "vegetable oil", "canola oil", "coconut oil",
    "avocado oil", "sesame oil", "vinegar", "balsamic", "balsamic vinegar", "apple cider vinegar",
    "rice vinegar", "soy sauce", "tamari", "fish sauce", "hot sauce", "sriracha", "ketchup", "mustard",
    "dijon", "mayo", "mayonnaise", "bbq sauce", "barbecue sauce", "salad dressing", "dressing", "ranch",
    "worcestershire", "teriyaki", "hoisin", "curry paste", "curry", "salsa jar", "peanut butter",
    "almond butter", "nutella", "jam", "jelly", "preserves", "salt", "pepper grinder", "black pepper",
    "spices", "spice", "cumin", "paprika", "chili powder", "cinnamon", "oregano", "garlic powder",
    "onion powder", "red pepper flakes", "cayenne", "turmeric", "nutmeg", "bay leaves", "taco seasoning",
    "seasoning", "tuna", "canned tuna", "canned salmon", "sardines", "anchovies", "coconut cream",
    "evaporated milk", "condensed milk", "sweetened condensed milk", "cornstarch", "corn starch",
    "breadcrumbs", "bread crumbs", "panko", "croutons", "taco shells", "refried beans", "enchilada sauce",
    "canned corn", "canned", "applesauce", "raisins", "dried cranberries", "nuts", "almonds", "walnuts",
    "pecans", "cashews", "peanuts", "pistachios", "sunflower seeds", "chia seeds", "flax", "flaxseed",
    "protein powder", "coffee", "ground coffee", "coffee beans", "k cups", "k-cups", "tea", "tea bags",
    "green tea", "hot chocolate", "cocoa mix", "sprinkles", "food coloring", "gelatin", "lasagna",
    "mac and cheese", "mac & cheese", "boxed mac", "stuffing", "gravy", "gravy mix", "crackers",
    "graham crackers", "olive", "capers", "pickles", "relish", "artichoke hearts", "roasted peppers",
    "sun dried tomatoes", "coconut flakes", "molasses", "agave", "stevia", "splenda", "sweetener",
    "pumpkin puree", "pie filling", "cranberry sauce", "nutritional yeast", "miso", "tahini", "harissa",
    "gochujang", "coconut water", "tortilla chips", "instant noodles", "cup noodles", "rice cakes",
  ],
  Snacks: [
    "chips", "potato chips", "pretzels", "popcorn", "trail mix", "granola bars", "granola bar", "protein bars",
    "protein bar", "bars", "candy", "chocolate", "chocolate bar", "gummies", "gum", "mints", "cookies pack",
    "oreos", "cheez its", "cheez-its", "goldfish", "cheetos", "doritos", "fruit snacks", "fruit leather",
    "beef jerky", "jerky", "rice crackers", "pita chips", "veggie straws", "pork rinds", "snacks", "snack",
    "pop tarts", "pop-tarts", "m&ms", "skittles", "twizzlers", "licorice", "marshmallows", "nutter butter",
  ],
  Beverages: [
    "water", "sparkling water", "seltzer", "la croix", "lacroix", "soda", "pop", "coke", "coca cola",
    "pepsi", "sprite", "ginger ale", "root beer", "juice", "apple juice", "cranberry juice", "grape juice",
    "lemonade", "iced tea", "kombucha", "energy drink", "red bull", "monster", "gatorade", "powerade",
    "sports drink", "electrolytes", "beer", "wine", "red wine", "white wine", "rosé", "rose wine",
    "champagne", "prosecco", "vodka", "whiskey", "whisky", "bourbon", "rum", "tequila", "gin", "cider",
    "hard seltzer", "white claw", "cold brew", "coffee drink", "milk tea", "boba", "drinks", "beverages",
    "tonic", "tonic water", "club soda", "mixers", "smoothie", "protein shake", "ensure",
  ],
  Household: [
    "paper towels", "paper towel", "toilet paper", "tp", "tissues", "kleenex", "napkins", "paper plates",
    "plastic cups", "cups", "plates", "utensils", "forks", "trash bags", "garbage bags", "ziploc", "ziplock",
    "sandwich bags", "freezer bags", "storage bags", "aluminum foil", "foil", "plastic wrap", "saran wrap",
    "parchment paper", "wax paper", "dish soap", "dishwasher pods", "dishwasher detergent", "dish detergent",
    "sponge", "sponges", "laundry detergent", "detergent", "dryer sheets", "fabric softener", "bleach",
    "cleaner", "all purpose cleaner", "windex", "glass cleaner", "lysol", "clorox", "wipes", "cleaning wipes",
    "disinfecting wipes", "swiffer", "mop", "broom", "batteries", "light bulbs", "lightbulbs", "candles",
    "matches", "lighter", "air freshener", "febreze", "hand soap", "soap refill", "toilet bowl cleaner",
    "drain cleaner", "oven cleaner", "scrub", "magic eraser", "gloves", "rubber gloves", "vacuum bags",
    "coffee filters", "filters", "water filter", "brita", "storage containers", "tupperware",
  ],
  "Personal Care": [
    "shampoo", "conditioner", "body wash", "soap", "bar soap", "deodorant", "toothpaste", "toothbrush",
    "floss", "mouthwash", "razor", "razors", "shaving cream", "lotion", "moisturizer", "sunscreen",
    "sunblock", "lip balm", "chapstick", "tampons", "pads", "makeup", "makeup remover", "cotton balls",
    "q tips", "q-tips", "cotton swabs", "hand sanitizer", "band aids", "band-aids", "bandages", "ibuprofen",
    "advil", "tylenol", "acetaminophen", "aspirin", "allergy", "zyrtec", "claritin", "benadryl", "vitamins",
    "vitamin", "multivitamin", "melatonin", "probiotics", "cold medicine", "cough drops", "dayquil", "nyquil",
    "tums", "antacid", "pepto", "contact solution", "hair gel", "hairspray", "dry shampoo", "face wash",
    "nail polish", "nail clippers", "tweezers", "condoms", "pregnancy test",
  ],
  "Baby & Pets": [
    "diapers", "baby wipes", "formula", "baby formula", "baby food", "pacifier", "pull ups", "pull-ups",
    "dog food", "cat food", "kibble", "cat litter", "litter", "dog treats", "cat treats", "treats", "pet food",
    "fish food", "bird seed", "dog", "cat", "puppy pads", "flea", "chew toy", "poop bags",
  ],
  Other: [],
};

interface Entry {
  keyword: string;
  category: Category;
}

const ENTRIES: Entry[] = Object.entries(KEYWORDS)
  .flatMap(([category, words]) => words.map((keyword) => ({ keyword, category: category as Category })))
  // Longest keywords first so multi-word matches win over single words.
  .sort((a, b) => b.keyword.length - a.keyword.length);

/** Lowercase, drop punctuation, collapse whitespace. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}&%\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick the aisle for an item name. Falls back to "Other" when nothing matches,
 * so the user can fix it with one tap.
 */
export function categorize(name: string): Category {
  const text = ` ${normalizeName(name)} `;
  if (!text.trim()) return "Other";

  for (const entry of ENTRIES) {
    if (text.includes(` ${entry.keyword} `)) return entry.category;
  }

  // Try singular/plural variants for single-word names ("tomatos", "eggs").
  const words = text.trim().split(" ");
  for (const word of words) {
    const variants = new Set<string>([word]);
    if (word.endsWith("ies")) variants.add(word.slice(0, -3) + "y");
    if (word.endsWith("es")) variants.add(word.slice(0, -2));
    if (word.endsWith("s")) variants.add(word.slice(0, -1));
    for (const v of variants) {
      const hit = ENTRIES.find((e) => e.keyword === v);
      if (hit) return hit.category;
    }
  }

  return "Other";
}
