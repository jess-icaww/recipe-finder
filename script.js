async function getRandomRecipe() {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}`
    );
    const data = await response.json();
    console.log(data.recipes[0]);

    const recipe = data.recipes[0];
    const id = recipe.id;
    console.log(id);
    const container = document.getElementById(`recipe-container`);
    container.innerHTML = `<h1>${recipe.title}</h1>
        <img src=${recipe.image}>
        <button class="full-recipe-btn">Get Full Recipe</button>
        <button class="random-recipe-btn">Get Another Recipe</button>`;
    const randomRecipeBtn = document.querySelector(`.random-recipe-btn`);
    randomRecipeBtn.addEventListener("click", () => {
      getRandomRecipe();
    });
    const getFullRecipeBtn = document.querySelector(`.full-recipe-btn`);
    getFullRecipeBtn.addEventListener("click", () => {
      getFullRecipe(id);
    });
  } catch (error) {
    console.error(`Error. Try again.`);
  }
}

async function getFullRecipe(id) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
    );
    const data = await response.json();
    console.log(data);

    const ingredientsList = data.extendedIngredients
      .map((ingredient) => `<li>${ingredient.original}</li>`)
      .join(" ");

    const container = document.getElementById(`recipe-container`);
    container.innerHTML = `
      <h1>${data.title}</h1>
      <img src=${data.image}>
      <button class="save-favorite-btn" data-id="${data.id}">
      Save to Favorites</button>
      <h3>Category: ${
        data.dishTypes[0].charAt(0).toUpperCase() + data.dishTypes[0].slice(1)
      }</h3>
      <h3>Servings: ${data.servings}</h3>
      <h3>Cook Time: ${data.readyInMinutes}</h3>
      <h3>Ingredients:</h3><ul>${ingredientsList}</ul>
      <h3>Instructions: </h3><p>${data.instructions}</p>
      <div id="source-wrapper"><a href="${
        data.sourceUrl
      }" target="_blank">View Original Source</div>`;

    const saveFavoriteBtn = document.querySelector(`.save-favorite-btn`);
    saveFavoriteBtn.addEventListener("click", () => {
      saveFavorite(data.id, data.title, data.image);
    });
  } catch (error) {
    console.error(`Could not find recipe. Try again.`);
  }
}

function saveFavorite(id, title, image) {
  // Get existing favorites from local storage
  let favorites = localStorage.getItem("favorites");

  // If no existing favorites, create array
  if (favorites === null) {
    favorites = [];
  } else {
    favorites = JSON.parse(favorites);
  }

  // Check for duplicates
  let alreadySaved = favorites.find((recipe) => recipe.id === id);
  if (alreadySaved) {
    console.log("Recipe already saved!");
    return;
  }

  favorites.push({
    id: id,
    title: title,
    image: image,
  });

  // Save to local storage
  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log("Recipe saved to favorites.");
  console.log(favorites);
}

async function searchRecipes() {
  try {
    const searchInput = document.getElementById(`search-input`).value.trim();
    const resultsGrid = document.getElementById(`results-grid`);
    const recipeContainer = document.getElementById(`recipe-container`);
    const dietFilter = document.getElementById(`diet-filter`).value;
    const mealTypeFilter = document.getElementById(`meal-type-filter`).value;

    // Check if input is empty
    if (searchInput === "" || searchInput.length === 0) {
      return;
    }

    console.log(searchInput);

    recipeContainer.innerHTML = ``;

    let url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchInput}&apiKey=${API_KEY}`;

    if (dietFilter) {
      url += `&diet=${dietFilter}`;
    }

    if (mealTypeFilter) {
      url += `&type=${mealTypeFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    console.log(data.results);

    // Map through recipes and create HTML with data-id attribute
    const recipes = data.results
      .map(
        (recipe) =>
          `<div class="recipe-card">
          <img src=${recipe.image} alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <button class="full-recipe-btn" data-id="${recipe.id}">Get Full Recipe</button>
          </div>`
      )
      .join(" ");

    resultsGrid.innerHTML = `${recipes}`;

    // Add event listeners to ALL buttons
    const buttons = document.querySelectorAll(`.full-recipe-btn`);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const recipeId = button.getAttribute(`data-id`);
        getFullRecipe(recipeId);
      });
    });
  } catch (error) {
    console.error(`Could not find recipe. Try again.`);
  }
}

// Add this function to display test cards
function displayTestCards() {
  const resultsGrid = document.getElementById(`results-grid`);
  
  const testRecipes = [
    {
      id: 1,
      title: "Spaghetti Carbonara",
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
      servings: 4,
      readyInMinutes: 30,
      preparationMinutes: 10
    },
    {
      id: 2,
      title: "Chicken Tikka Masala",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
      servings: 6,
      readyInMinutes: 45,
      preparationMinutes: 15
    },
    {
      id: 3,
      title: "Caesar Salad",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      servings: 2,
      readyInMinutes: 15,
      preparationMinutes: 15
    },
    {
      id: 4,
      title: "Chocolate Chip Cookies",
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
      servings: 24,
      readyInMinutes: 25,
      preparationMinutes: 10
    },
    {
      id: 5,
      title: "Grilled Salmon",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      servings: 2,
      readyInMinutes: 20,
      preparationMinutes: 5
    },
    {
      id: 6,
      title: "Vegetable Stir Fry",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
      servings: 3,
      readyInMinutes: 20,
      preparationMinutes: 10
    }
  ];
  
  const recipes = testRecipes
    .map(
      (recipe) =>
        `<div class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <div class="recipe-quick-info">
            <p>Servings: ${recipe.servings}</p>
            <p>Ready in: ${recipe.readyInMinutes} mins</p>
            ${recipe.preparationMinutes ? `<p>Prep Time: ${recipe.preparationMinutes} mins</p>` : ''}
          </div>
          <button class="full-recipe-btn" data-id="${recipe.id}">Get Full Recipe</button>
        </div>`
    )
    .join("");
    
  resultsGrid.innerHTML = recipes;
}

// Call this on page load to show test cards
window.addEventListener('DOMContentLoaded', displayTestCards);

async function searchRecipes() {
  try {
    const searchInput = document.getElementById(`search-input`).value.trim();
    const resultsGrid = document.getElementById(`results-grid`);
    const recipeContainer = document.getElementById(`recipe-container`);
    const dietFilter = document.getElementById(`diet-filter`).value;
    const mealTypeFilter = document.getElementById(`meal-type-filter`).value;

    // Check if input is empty - show test cards instead
    if (searchInput === "" || searchInput.length === 0) {
      displayTestCards(); // Show test cards when search is empty
      return;
    }

    console.log(searchInput);

    recipeContainer.innerHTML = ``;
    resultsGrid.innerHTML = `<p>Loading recipes...</p>`;

    let url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchInput}&apiKey=${API_KEY}`;

    if (dietFilter) {
      url += `&diet=${dietFilter}`;
    }

    if (mealTypeFilter) {
      url += `&type=${mealTypeFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    console.log(data.results);

    // Map through recipes and create HTML with data-id attribute
    const recipes = data.results
      .map(
        (recipe) =>
          `<div class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <button class="full-recipe-btn" data-id="${recipe.id}">Get Full Recipe</button>
          </div>`
      )
      .join(" ");

    resultsGrid.innerHTML = `${recipes}`;

    // Add event listeners to ALL buttons
    const buttons = document.querySelectorAll(`.full-recipe-btn`);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const recipeId = button.getAttribute(`data-id`);
        getFullRecipe(recipeId);
      });
    });
  } catch (error) {
    console.error(`Could not find recipe. Try again.`);
    resultsGrid.innerHTML = `<p>Error loading recipes. Please try again.</p>`;
  }
}

const searchBtn = document.getElementById(`search-btn`);
searchBtn.addEventListener("click", () => {
  searchRecipes();
});

const randomRecipeBtn = document.getElementById(`random-recipe-btn`);
randomRecipeBtn.addEventListener("click", () => {
  getRandomRecipe();
});

// Navigation handlers
document.getElementById(`random-recipe-link`).addEventListener("click", () => {
  getRandomRecipe();
});
