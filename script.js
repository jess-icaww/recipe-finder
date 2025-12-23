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
        <button id="full-recipe-btn">Get Full Recipe</button>
        <button id="random-recipe-btn">Get Another Recipe</button>`;
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
      <div id="source-wrapper"><a href="${data.sourceUrl}" target="_blank">View Original Source</div>`
    } catch (error) {
      console.error(`Error. Try again.`);
    }
  }

const randomRecipeBtn = document.getElementById(`random-recipe-btn`);
randomRecipeBtn.addEventListener("click", () => {
  getRandomRecipe();
});
