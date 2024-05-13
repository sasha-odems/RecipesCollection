const recipes = [
  {
    name: "Tomato Pasta",
    ingredients: [
      { name: "Tomato", amount: "2 cups" },
      { name: "Pasta", amount: "1 pound" },
      { name: "Cheese", amount: "1/2 cup" }
    ],
    instructions: "Boil pasta. Add tomatoes and cheese.",
    photo: "public/seeds/tomato-pasta.jpg"  // Ensure this path is correct or use a URL
  },
  {
    name: "Chocolate Cake",
    ingredients: [
      { name: "Flour", amount: "2 cups" },
      { name: "Sugar", amount: "1 cup" },
      { name: "Cocoa Powder", amount: "1/2 cup" }
    ],
    instructions: "Mix ingredients. Bake for 45 minutes at 350 degrees.",
    photo: "public/seeds/chocolate-cake.jpg"
  }
];

module.exports = recipes;