import { createCharacterCard } from "./components/CharacterCard/CharacterCard.js";
import { create_button } from "./components/NavButton/NavButton.js";
import { create_pagination } from "./components/NavPagination/NavPagination.js";
import { initSearchbar } from "./components/SearchBar/SearchBar.js";

const cardContainer = document.querySelector('[data-js="card-container"]');
const navigation_container = document.querySelector('[data-js="navigation"]');
const searchBar = document.querySelector('[data-js="search-bar"]');
const title_element = document.querySelector('h1');

// States
let maxPage = 1;
let page = 1;
let searchQuery = "";
// flag to track loading state and prevent 429 (too many requests) errors from rapid clicking
let is_loading = false;

function render_navigation()
{
  navigation_container.innerHTML = "";

  // prev button
  const prev_button = create_button({
    text: "previous",
    onClick: async () => {
      if (is_loading || page <= 1) return;
      page--;
      await fetchCharacters();
    },
  });

  prev_button.classList.add("button--prev");
  prev_button.setAttribute("data-js", "button-prev");
  prev_button.disabled = page <= 1 || is_loading;

  const pagination = create_pagination(page, maxPage);

  // next button
  const next_button = create_button({
    text: "next",
    onClick: async () => {
      if (is_loading || page >= maxPage) return;
      page++;
      await fetchCharacters();
    },
  });
  
  next_button.classList.add("button--next");
  next_button.setAttribute("data-js", "button-next");
  next_button.disabled = page >= maxPage || is_loading;

  navigation_container.append(prev_button, pagination, next_button);
}

initSearchbar(searchBar, (text) => {
  searchQuery = text;
  page = 1;
  fetchCharacters();
});

// clickable title to return to main page
if (title_element)
{
  title_element.addEventListener("click", () => {
    searchQuery = "";
    page = 1;

    fetchCharacters();
  });
}
  
async function fetchCharacters()
{
  if (is_loading) return;
  is_loading = true;

  render_navigation();
  
  try
  {
    const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}&name=${searchQuery}`);
    
    if (!response.ok)
    {
      if (response.status === 429)
      {
        throw new Error("Too many clicks. Please wait a moment");
      }
      throw new Error("Error loading data");
    }
  
    const data = await response.json();

    // get max page infos from api and update display
    maxPage = data.info.pages;
    
    cardContainer.innerHTML = "";
    
    data.results.forEach(characterData => {
      const card = createCharacterCard(characterData);
      cardContainer.append(card);
    });

    render_navigation();
    
  }
  catch (error)
  {
    console.warn("Warning:", error.message);
  
    page = 1;
    maxPage = 1;

    cardContainer.innerHTML = `
      <div class="no-results">
        <h2>Interdimensional Error! 🛸</h2>
        <p>No characters found in this dimension.</p>
      </div>
    `;

    render_navigation();
  }
  finally
  {
    is_loading = false;
    render_navigation();
  }
}

fetchCharacters();
