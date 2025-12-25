async function getRandomRecipe() {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}`
    );
    const data = await response.json();
    console.log(data.recipes[0]);

    const recipe = data.recipes[0];
    const id = recipe.id;
    const container = document.getElementById(`recipe-container`);
    container.innerHTML = `<h1>${recipe.title}</h1>
        <img src=${recipe.image}>
        <button class="full-recipe-btn">Get Full Recipe</button>
        <button class="random-recipe-btn">Get Another Recipe</button>`;
    const randomRecipeBtn = document.getElementById(`random-recipe-btn`);
    randomRecipeBtn.addEventListener("click", () => {
      getRandomRecipe();
    });
    const getFullRecipeBtn = document.getElementById(`full-recipe-btn`);
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
      <h3>Category: ${data.dishTypes[0].charAt(0).toUpperCase() + data.dishTypes[0].slice(1)}</h3>
      <h3>Servings: ${data.servings}</h3>
      <h3>Cook Time: ${data.readyInMinutes}</h3>
      <h3>Ingredients:</h3><ul>${ingredientsList}</ul>
      <h3>Instructions: </h3><p>${data.instructions}</p>
      <div id="source-wrapper"><a href="${data.sourceUrl}" target="_blank">View Original Source</div>`;
    } catch (error) {
      console.error(`Could not find recipe. Try again.`);
    }
  }

async function searchRecipes() {
    try {
      const searchInput = document.getElementById(`search-input`).value.trim();
      const container = document.getElementById(`recipe-container`);
      const errorMessage = document.getElementById(`error-message`);

      // Check if input is empty
      if (searchInput === "" || searchInput.length === 0) {
        errorMessage.innerHTML = `<p class="error-message">Please enter valid recipe name.</p>`;
        return;
      }
      console.log(searchInput);

      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${searchInput}&apiKey=${API_KEY}`);
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
