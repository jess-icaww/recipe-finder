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
    })
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

      const ingredientsList = data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join(" ");

      const container = document.getElementById(`recipe-container`);
      container.innerHTML = `
      <h1>${data.title}</h1>
      <img src=${data.image}>
      <button class="save-favorite-btn" data-id="${data.id}">
      Save to Favorites</button>
      <h3>Category: ${data.dishTypes[0].charAt(0).toUpperCase() + data.dishTypes[0].slice(1)}</h3>
      <h3>Servings: ${data.servings}</h3>
      <h3>Cook Time: ${data.readyInMinutes}</h3>
      <h3>Ingredients:</h3><ul>${ingredientsList}</ul>
      <h3>Instructions: </h3><p>${data.instructions}</p>
      <div id="source-wrapper"><a href="${data.sourceUrl}" target="_blank">View Original Source</div>`;

      const saveFavoriteBtn = document.querySelector(`.save-favorite-btn`);
      saveFavoriteBtn.addEventListener("click", () => {
        saveFavorite(data.id, data.title, data.image);
      })
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
  let alreadySaved = favorites.find(recipe => recipe.id === id);
  if (alreadySaved) {
    console.log("Recipe already saved!");
    return;
  }

  favorites.push({
    id: id,
    title: title,
    image: image
  });

  // Save to local storage
  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log("Recipe saved to favorites.");
  console.log(favorites);
}

async function searchRecipes() {
    try {
      const searchInput = document.getElementById(`search-input`).value.trim();
      const container = document.getElementById(`recipe-container`);
      const errorMessage = document.getElementById(`error-message`);
      const dietFilter = document.getElementById(`diet-filter`).value;
      const mealTypeFilter = document.getElementById(`meal-type-filter`).value;

      // Check if input is empty
      if (searchInput === "" || searchInput.length === 0) {
        errorMessage.innerHTML = `<p class="error-message">Please enter valid recipe name.</p>`;
        return;
      }
      console.log(searchInput);

      errorMessage.innerHTML = ``;

      let url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchInput}&apiKey=${API_KEY}`;

      if(dietFilter) {
        url += `&diet=${dietFilter}`;
      }

      if (mealTypeFilter) {
        url += `&type=${mealTypeFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Map through recipes and create HTML with data-id attribute
      const recipes = data.results.map(recipe => 
        `<div class="recipe-card">
        <h3>${recipe.title}</h3>
        <img src=${recipe.image} alt="${recipe.title}">
        <button class="full-recipe-btn" data-id="${recipe.id}">Get Full Recipe</button>
        </div>`).join(" ");
        
      container.innerHTML = `${recipes}`;

      // Add event listeners to ALL buttons
      const buttons = document.querySelectorAll(`.full-recipe-btn`);
      buttons.forEach(button => {
        button.addEventListener("click", () => {
          const recipeId = button.getAttribute(`data-id`);
          getFullRecipe(recipeId);
        })
      })
    }
    catch (error) {
        console.error(`Could not find recipe. Try again.`);
    }
}

const searchBtn = document.getElementById(`search-btn`);
searchBtn.addEventListener("click", () => {
  searchRecipes();
})

const randomRecipeBtn = document.getElementById(`random-recipe-btn`);
randomRecipeBtn.addEventListener("click", () => {
  getRandomRecipe();
});

// Navigation handlers
document.getElementById(`random-recipe-link`).addEventListener("click", () => {
  getRandomRecipe();
})