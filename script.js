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

    let url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchInput}&addRecipeInformation=true&apiKey=${API_KEY}`;

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
          <div class="recipe-quick-info">
          <p>Servings: ${recipe.servings}</p>
          ${recipe.readyInMinutes <= 60 ? `<p>Ready in: ${recipe.readyInMinutes} mins</p>` : `<p>Ready in: ${Math.round(recipe.readyInMinutes /60)} hrs ${recipe.readyInMinutes % 60} mins</p>`}
          </div>
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

const searchBtn = document.getElementById(`search-btn`);
searchBtn.addEventListener("click", () => {
  searchRecipes();
});



