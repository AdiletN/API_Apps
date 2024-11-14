const apiKey = 'a4d5d24db1ba4d4eb883531a45a6cafc';

async function showSuggestions() {

    const recipeInput = document.querySelector(".recipe__text").value.trim();
    if (!recipeInput) {
        document.querySelector(".suggestions").innerHTML = '';
        return;
    }

    const apiUrl = `https://api.spoonacular.com/recipes/autocomplete?query=${recipeInput}&apiKey=${apiKey}&number=5`;
    const response = await fetch(apiUrl);
    const suggestions = await response.json();

    const suggestionList = document.querySelector(".suggestions");
    suggestionList.innerHTML = suggestions.map(s => `<li onclick="selectSuggestion('${s.title}')">${s.title}</li>`).join('');
}

function selectSuggestion(suggestion) {
    document.querySelector(".recipe__text").value = suggestion;
    document.querySelector(".suggestions").innerHTML = '';
    searchRecipe();
}
async function searchRecipe() {
    const recipeInput = document.querySelector(".recipe__text").value.trim();
    if (!recipeInput) return;

    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${recipeInput}&apiKey=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const recipeResult = document.getElementById("recipeResult");
    recipeResult.innerHTML = "";

    if (data.results && data.results.length > 0) {
        data.results.forEach(recipe => {
            recipeResult.innerHTML += `
                <div class="recipe-card" onclick="showRecipeDetails(${recipe.id})">
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <button class="favorite-btn" onclick="toggleFavorite(event, ${recipe.id})" style="margin-top:10px">
                        <i class="${isFavorite(recipe.id) ? 'fas fa-heart' : 'far fa-heart'}"></i>
                        ${isFavorite(recipe.id) ? "Remove from Favorites" : "Add to Favorites"}
                    </button>
                </div>
            `;
        });
    } 
    else {
        recipeResult.innerHTML = '<p class="error-message">There is no food. Please try another search.</p>';
    }
}

async function showRecipeDetails(recipeId) {
    const apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`;
    const response = await fetch(apiUrl);
    const recipe = await response.json();

    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = `
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p><strong>Ingredients:</strong></p>
        <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        <p><strong>Nutrition:</strong> Calories: ${recipe.nutrition.nutrients[0].amount} kcal</p>
    `;
    document.getElementById("recipeModal").classList.remove("hidden");
    document.body.classList.add("modal-open"); 
}

function closeModal() {
    document.getElementById("recipeModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
}

function toggleFavorite(event, recipeId) {
    event.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.includes(recipeId)) {
        favorites.splice(favorites.indexOf(recipeId), 1);
    } 
    else {
        favorites.push(recipeId);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    searchRecipe();
}

function isFavorite(recipeId) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.includes(recipeId);
}
