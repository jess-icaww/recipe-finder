async function getRandomRecipe() {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}`);
        const data = await response.json();
        console.log(data.recipes[0]);

        const recipe = data.recipes[0];
        const container = document.getElementById(`recipe-container`);
        container.innerHTML = `<h1>${recipe.title}</h1>
        <img src=${recipe.image}>`;
    } catch (error) {
        console.error(`Error. Try again.`);
    }
}

getRandomRecipe();
