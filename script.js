async function getFullRecipe(id) {
  try {
    // Scroll to top of page
    window.scrollTo(0, 0);

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
    );
    const data = await response.json();
    console.log(data);

    const ingredientsList = data.extendedIngredients
      .map((ingredient) => `<li>${ingredient.original}</li>`)
      .join(" ");

    const container = document.querySelector(`.container`);
    container.innerHTML = `
      <div class="recipe-details">
      <h1>${data.title}</h1>
      <img src=${data.image}>
      <h3>Category: </h3><p>${
        data.dishTypes[0].charAt(0).toUpperCase() + data.dishTypes[0].slice(1)
      }</p>
      <h3>Servings: </h3><p>${data.servings}</p>
      <h3>Cook Time: </h3><p>${data.readyInMinutes} mins</p>
      <h3>Ingredients:</h3><ul class="ingredients-list">${ingredientsList}</ul>
      <h3>Instructions: </h3><p>${data.instructions}</p>
      <div id="source-wrapper"><a href="${
        data.sourceUrl
      }" target="_blank">View Original Source</a></div>  <div id="save-favorite-container">    <button class="save-favorite-btn btn" data-id="${
      data.id
    }">
      Save to Favorites</button></div></div>`;

    const saveFavoriteBtn = document.querySelector(`.save-favorite-btn`);
    saveFavoriteBtn.addEventListener("click", () => {
      saveFavorite(data.id, data.title, data.image, data.servings, data.readyInMinutes);
    });
  } catch (error) {
    console.error(`Could not find recipe. Try again.`);
  }
}

function saveFavorite(id, title, image, servings, readyInMinutes) {
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
    showPopup("Recipe already saved!", "error");
    return;
  }


  favorites.push({
    id: id,
    title: title,
    image: image,
    servings: servings,
    readyInMinutes: readyInMinutes
  });

  // Save to local storage
  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log("Recipe saved to favorites.");
  console.log(favorites);

  showPopup("Recipe saved to favorites!");
}

function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `pop-up ${type}`;
  popup.textContent = message;

  document.body.appendChild(popup);

  // Trigger animation
  setTimeout(() => {
    popup.classList.add("show");
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 300);
  }, 3000);
}

async function displayFavorites() {
  try {
    const favoriteRecipes = document.getElementById(`favorite-recipes`);
    const errorMessage = document.querySelector(`.error-message`);
    if (!favoriteRecipes) return;

    let favorites = JSON.parse(localStorage.getItem("favorites"));
    console.log(favorites);

    if (!favorites || favorites.length === 0) {
      favoriteRecipes.innerHTML = ``;
      if (errorMessage) {
        errorMessage.innerHTML = `<p>No favorites saved. Click "Save to Favorites" to add a recipe!</p>`;
      } else {
        favoriteRecipes.innerHTML = `<p>No favorites saved. Click "Save to Favorites" to add a recipe!</p>`;
      }
      return;
    }

    favoriteRecipes.innerHTML = favorites
      .map((recipe) => {
        return `<div class="recipe-card">
        <button class="remove-favorite-btn" data-id="${recipe.id}" title="Remove from favorites">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <img src=${recipe.image} alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <div class="recipe-quick-info">
          <p>Servings: ${recipe.servings}</p>
          ${
            recipe.readyInMinutes <= 60
              ? `<p>Ready in: ${recipe.readyInMinutes} mins</p>`
              : `<p>Ready in: ${Math.round(recipe.readyInMinutes / 60)} hrs ${
                  recipe.readyInMinutes % 60
                } mins</p>`
          }
          </div>
          <button class="full-recipe-btn btn" data-id="${
            recipe.id
          }">Get Full Recipe</button>
          </div>`;
      })
      .join("");

    // Add event listeners to ALL "Get Full Recipe" buttons
    const getFullRecipeButtons = document.querySelectorAll(`.full-recipe-btn`);
    getFullRecipeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const recipeId = button.getAttribute(`data-id`);
        getFullRecipe(recipeId);
      });
    });

    // Add event listeners to "Remove Favorite" buttons
    const removeFavoriteBtns = document.querySelectorAll(`.remove-favorite-btn`);
    removeFavoriteBtns.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent card click
        const recipeId = button.getAttribute(`data-id`);
        removeFavoriteBtn(recipeId);
      })
    });
  } catch (error) {
    console.error(`Could not find any favorites. Try again.`);
  }
}

function removeFavoriteBtn(id) {
  try {
    let favorites = JSON.parse(localStorage.getItem("favorites"));

    if (favorites === null) {
      return;
    }

    // Filter out recipe with matching id
    favorites = favorites.filter((recipe) => recipe.id != id);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    showPopup("Recipe removed from favorites!", "error");

    // Refresh display
    displayFavorites();
  } catch (error) {
    console.error("Could not remove favorite. Try again.");
  }
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
    console.log(url);

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
          ${
            recipe.readyInMinutes <= 60
              ? `<p>Ready in: ${recipe.readyInMinutes} mins</p>`
              : `<p>Ready in: ${Math.round(recipe.readyInMinutes / 60)} hrs ${
                  recipe.readyInMinutes % 60
                } mins</p>`
          }
          </div>
          <button class="full-recipe-btn btn" data-id="${
            recipe.id
          }">Get Full Recipe</button>
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
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchRecipes();
  });
}

const favoriteRecipes = document.getElementById("favorite-recipes");
if (favoriteRecipes) {
  displayFavorites();
}

function handleContactForm(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const messageError = document.getElementById("message-error");

  let isValid = true;

  // Validate name
  if (name.length === 0 || name === "") {
    nameError.innerHTML = "Name is required.";
    isValid = false;
  } else if (name.length < 3) {
    nameError.innerHTML = "Name must be at least 3 characters.";
    isValid = false;
  } else {
    nameError.innerHTML = "";
  }

  // Validate email
  if (email.length === 0 || email === "") {
    emailError.innerHTML = "Email is required.";
    isValid = false;
  } else if (!email.includes("@") || !email.includes(".com")) {
    emailError.innerHTML = "Please enter valid email address.";
    isValid = false;
  } else {
    emailError.innerHTML = "";
  }

  // Validate message
  if (message.length === 0 || message === "") {
    messageError.innerHTML = "Message is required.";
    isValid = false;
  } else if (message.length < 10) {
    messageError.innerHTML = "Message must be at least 10 characters.";
    isValid = false;
  } else {
    messageError.innerHTML = "";
  }

  if(isValid) {
    const contactForm = document.getElementById("contact-form");
    contactForm.reset();

    showPopup("Message sent successfully!", "success");

    console.log(`Form submitted!
      Name: ${name}
      Email: ${email}
      Message: ${message}`);
  }
}


const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", handleContactForm);
}