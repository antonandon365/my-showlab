// app.js: ShowShelf, your finished app (read only today)

// This is your app from Day 9, tidied: the same code, in a clearer order.

// Two small things are new today (look for "Day 11"):

//   - render() calls afterRender() at its end, if extra.js has one

//   - "Your site's details", near the bottom, puts SITE from site.js on the page

//

// Loaded before this file:

//   helpers.js -> ratingLabel, yearsLabel, getByGenre, allGenres, yearOf, toShow, stripTags

//   site.js    -> SITE: your site's name, tagline and owner

// Loaded after this file:

//   extra.js   -> your own features. They can use everything in this file.

 

// ---------- Elements: the parts of the page we change ----------

 

// The home view: search, genres and the grid of shows

const grid = document.querySelector("#grid");

const searchInput = document.querySelector("#search");

const searchForm = document.querySelector("#search-form");

const emptyMessage = document.querySelector("#empty-message");

const genresBox = document.querySelector("#genres");

const statusMessage = document.querySelector("#status");

 

// The three views, and the header links that switch between them

const homeView = document.querySelector("#home-view");

const showView = document.querySelector("#show-view");

const myListView = document.querySelector("#mylist-view");

const logoLink = document.querySelector("#logo");

const homeLink = document.querySelector("#nav-home");

const myListLink = document.querySelector("#nav-mylist");

const listCount = document.querySelector("#list-count");

 

// The show view

const backButton = document.querySelector("#back-button");

const showStatus = document.querySelector("#show-status");

const showDetails = document.querySelector("#show-details");

const showPoster = document.querySelector("#show-poster");

const showName = document.querySelector("#show-name");

const showMeta = document.querySelector("#show-meta");

const showRating = document.querySelector("#show-rating");

const showGenres = document.querySelector("#show-genres");

const showSummary = document.querySelector("#show-summary");

const showListButton = document.querySelector("#show-list-button");

const castList = document.querySelector("#show-cast");

const seasonsBody = document.querySelector("#show-seasons");

 

// The My List view

const myListGrid = document.querySelector("#mylist-grid");

const myListEmpty = document.querySelector("#mylist-empty");

 

// Day 11: the places for your site's details from site.js

const heroText = document.querySelector("#tagline");

const madeBy = document.querySelector("#made-by");

const descriptionTag = document.querySelector('meta[name="description"]');

 

// ---------- State: everything on the page that can change ----------

const state = {

  view: "home",           // which view is showing: "home", "show" or "mylist"

  shows: [],              // the shows on the home page, from TVmaze (in our shape)

  genre: "",              // the chosen genre ("" means all genres)

  myList: loadMyList(),   // small objects for the shows in My List (see loadMyList below)

  currentShow: null,      // the show open in the show view (null when none is)

};

 

// ---------- My List, saved in the browser ----------

// Each show in My List is saved with what a card needs, so the My List view

// can draw it without asking TVmaze:

//   { id: 431, name: "Friends", image: null, genres: ["Comedy", "Romance"], rating: 8.8 }

 

// Read My List from localStorage (the key is "myList")

function loadMyList() {

  const saved = JSON.parse(localStorage.getItem("myList")) ?? [];

  // On Day 7 this key held plain ids, like [2, 5]. Keep only the objects.

  return saved.filter((item) => typeof item === "object");

}

 

// Save My List in the browser (localStorage keeps text only, so we turn it into JSON text)

function saveMyList() {

  localStorage.setItem("myList", JSON.stringify(state.myList));

}

 

// Is this show in My List? Gives true or false.

function isInMyList(id) {

  return state.myList.some((item) => item.id === id);

}

 

// Add the show to My List, or take it out if it's already there

function toggleMyList(show) {

  if (isInMyList(show.id)) {

    state.myList = state.myList.filter((item) => item.id !== show.id);

  } else {

    state.myList.push({

      id: show.id,

      name: show.name,

      image: show.image,

      genres: show.genres,

      rating: show.rating,

    });

  }

  saveMyList();

  render();

}

 

// ---------- TVmaze: asking for data ----------

 

// The address of the TVmaze API. Every request starts with it.

const API = "https://api.tvmaze.com";

 

// The search address: searchUrl("the office") -> ".../search/shows?q=the%20office"

function searchUrl(term) {

  return `${API}/search/shows?q=${encodeURIComponent(term)}`;

}

 

// Search TVmaze. Gives back a list of shows in OUR shape, ready for createCard.

async function searchShows(term) {

  const response = await fetch(searchUrl(term));

  if (!response.ok) {

    throw new Error("TVmaze answered " + response.status);   // stop here: we have no shows

  }

  const results = await response.json();

  return results.map((result) => toShow(result.show));

}

 

// Page 0 of TVmaze's list of shows: the first 250

async function getShowsPage() {

  const response = await fetch(`${API}/shows?page=0`);

  if (!response.ok) {

    throw new Error("TVmaze answered " + response.status);

  }

  const apiShows = await response.json();

  return apiShows.map(toShow);

}

 

// Ask TVmaze for one show, with its cast and seasons in the same answer

// getShowById(431) -> { show: {...our shape...}, cast: [...], seasons: [...] }, or null if there's no such show

async function getShowById(id) {

  const response = await fetch(`${API}/shows/${id}?embed[]=cast&embed[]=seasons`);

  if (response.status === 404) {

    return null;   // TVmaze has no show with this id

  }

  if (!response.ok) {

    throw new Error("TVmaze answered " + response.status);

  }

  const data = await response.json();

  return {

    show: toShow(data),

    cast: data._embedded.cast,

    seasons: data._embedded.seasons,

  };

}

 

// Load the shows for the home page (page 0 when the search is empty),

// with a loading message, an error message, and a message when nothing is found

async function loadShows(term) {

  statusMessage.textContent = "Loading shows…";

  statusMessage.classList.remove("error");

  statusMessage.hidden = false;

  emptyMessage.hidden = true;   // an old "nothing found" doesn't belong to the new search

  try {

    if (term === "") {

      state.shows = await getShowsPage();   // empty search box: the first page of shows

    } else {

      state.shows = await searchShows(term);

    }

    statusMessage.hidden = true;

    state.genre = "";   // the new shows may not have the chosen genre

    emptyMessage.textContent = `No shows found for "${term}". Try another word.`;

    render();

  } catch (error) {

    // No internet, or TVmaze answered with an error: tell the person, in red

    statusMessage.textContent = "Sorry, the shows could not be loaded (" + error.message + "). Check your internet connection and try again.";

    statusMessage.classList.add("error");

  }

}

 

// ---------- One card for one show ----------

// createCard(show) builds a card and gives it back. It doesn't put it on the page.

function createCard(show) {

  const card = document.createElement("article");

  card.className = "card";

 

  const poster = document.createElement("img");

  poster.className = "poster";

  poster.src = show.image ?? "poster.svg";   // no picture (null)? use poster.svg

  poster.alt = "";                           // the name is under the poster, so no alt text

  poster.loading = "lazy";                   // load the picture only when it scrolls into view

 

  const body = document.createElement("div");

  body.className = "card-body";

 

  // Real shows can have no genres at all, so only add a badge when there is one

  if (show.genres.length > 0) {

    const badge = document.createElement("span");

    badge.className = "badge";

    badge.textContent = show.genres[0];

    body.append(badge);

  }

 

  const title = document.createElement("h3");

  title.textContent = show.name;

 

  // Real shows can have no rating yet (null)

  const rating = document.createElement("p");

  rating.className = "rating";

  if (show.rating === null) {

    rating.textContent = "No rating yet";

  } else {

    rating.textContent = "★ " + show.rating + " · " + ratingLabel(show.rating);

  }

 

  const meta = document.createElement("p");

  meta.className = "meta";

  meta.textContent = yearsLabel(show.premiered, show.ended);

 

  body.append(title, rating, meta);

  card.append(poster, body);

  card.append(createListButton(show));

  card.addEventListener("click", () => {

    openShow(show.id);

  });

  return card;

}

 

// The round button on a card: "+" adds the show, "✓" means it's in My List

function createListButton(show) {

  const button = document.createElement("button");

  button.className = "list-btn";

  if (isInMyList(show.id)) {

    button.textContent = "✓";

  } else {

    button.textContent = "+";

  }

  button.setAttribute("aria-pressed", isInMyList(show.id));   // "true" when the show is in My List

  button.setAttribute("aria-label", "My List: " + show.name);

  button.addEventListener("click", (event) => {

    event.stopPropagation();   // a click on the button is not a click on the card

    toggleMyList(show);

  });

  return button;

}

 

// ---------- Draw the page from the state ----------

 

function render() {

  // Show the view that matches state.view, and hide the other two

  homeView.hidden = state.view !== "home";

  showView.hidden = state.view !== "show";

  myListView.hidden = state.view !== "mylist";

 

  let list = state.shows;

  if (state.genre !== "") {

    list = getByGenre(list, state.genre);

  }

 

  renderGrid(list);

  renderGenres();

  listCount.textContent = state.myList.length;

  renderMyList();

  renderShowListButton();

 

  // Day 11: if extra.js has a function called afterRender, it runs at the end of every render

  if (typeof afterRender === "function") {

    afterRender();

  }

}

 

// Draw a list of shows in the grid

function renderGrid(list) {

  grid.replaceChildren();   // remove the old cards first

  for (const show of list) {

    grid.append(createCard(show));

  }

  emptyMessage.hidden = list.length > 0;   // show the message only when there are no shows

}

 

// One button (a "chip") per genre. The chosen one gets the class "active".

function renderGenres() {

  genresBox.replaceChildren();

  for (const genre of allGenres(state.shows)) {

    const chip = document.createElement("button");

    chip.className = "chip";

    chip.textContent = genre;

    if (genre === state.genre) {

      chip.classList.add("active");

    }

    chip.addEventListener("click", () => {

      if (state.genre === genre) {

        state.genre = "";      // clicked the chosen genre again: all genres

      } else {

        state.genre = genre;

      }

      render();

    });

    genresBox.append(chip);

  }

}

 

// Draw the saved shows, with the same createCard as the home page

function renderMyList() {

  myListGrid.replaceChildren();

  for (const show of state.myList) {

    myListGrid.append(createCard(show));

  }

  myListEmpty.hidden = state.myList.length > 0;

}

 

// The My List button in the show view. Its text follows the state.

function renderShowListButton() {

  if (!state.currentShow) {

    return;   // no show is open yet

  }

  if (isInMyList(state.currentShow.id)) {

    showListButton.textContent = "✓ In My List";

  } else {

    showListButton.textContent = "+ Add to My List";

  }

  showListButton.setAttribute("aria-pressed", isInMyList(state.currentShow.id));

}

 

// ---------- The show view ----------

 

// Open the show view for one show (a click on a card calls this)

async function openShow(id) {

  state.view = "show";

  render();

  window.scrollTo(0, 0);   // start at the top of the page

 

  // While loading: hide the old show and say what's happening

  showDetails.hidden = true;

  showStatus.textContent = "Loading show…";

  showStatus.classList.remove("error");

  showStatus.hidden = false;

 

  try {

    const data = await getShowById(id);

    if (data === null) {

      showStatus.textContent = "Show not found. Go back and pick another one.";

      return;

    }

    state.currentShow = data.show;

    renderShow(data.show);

    renderCast(data.cast);

    renderSeasons(data.seasons);

    renderShowListButton();

    showStatus.hidden = true;

    showDetails.hidden = false;

  } catch (error) {

    // No internet, or TVmaze answered with an error

    showStatus.textContent = "Sorry, this show could not be loaded (" + error.message + "). Check your internet connection and try again.";

    showStatus.classList.add("error");

  }

}

 

// Fill the show view with one show (in our shape)

function renderShow(show) {

  showPoster.src = show.image ?? "poster.svg";

  showPoster.alt = "Poster for " + show.name;

  showName.textContent = show.name;

 

  showMeta.textContent = yearsLabel(show.premiered, show.ended);

  if (show.network !== "") {

    showMeta.textContent += " · " + show.network;   // += adds to the end of the text

  }

 

  if (show.rating === null) {

    showRating.textContent = "No rating yet";

  } else {

    showRating.textContent = "★ " + show.rating + " · " + ratingLabel(show.rating);

  }

 

  // textContent, never innerHTML: the summary is text from the internet

  showSummary.textContent = show.summary;

  if (show.summary === "") {

    showSummary.textContent = "No summary yet.";

  }

 

  // One badge per genre

  showGenres.replaceChildren();

  for (const genre of show.genres) {

    const badge = document.createElement("span");

    badge.className = "badge";

    badge.textContent = genre;

    showGenres.append(badge);

    showGenres.append(" ");   // a space between the badges

  }

}

 

// The cast as a list: "Jennifer Aniston as Rachel Green"

function renderCast(cast) {

  castList.replaceChildren();

  for (const member of cast) {

    const item = document.createElement("li");

    item.textContent = member.person.name + " as " + member.character.name;

    castList.append(item);

  }

  if (cast.length === 0) {

    const empty = document.createElement("li");

    empty.textContent = "No cast information yet.";

    castList.append(empty);

  }

}

 

// One table cell (<td>) with some text

function createCell(text) {

  const cell = document.createElement("td");

  cell.textContent = text;

  return cell;

}

 

// The seasons as table rows: season number, episodes, year

function renderSeasons(seasons) {

  seasonsBody.replaceChildren();

  for (const season of seasons) {

    const row = document.createElement("tr");

    row.append(

      createCell(season.number),

      createCell(season.episodeOrder),

      createCell(yearOf(season.premiereDate))

    );

    seasonsBody.append(row);

  }

}

 

// ---------- Events: what happens when someone uses the page ----------

 

// Pressing Enter or Search asks TVmaze

searchForm.addEventListener("submit", (event) => {

  event.preventDefault();   // don't reload the page

  loadShows(searchInput.value.trim());

});

 

// The back button in the show view goes home

backButton.addEventListener("click", () => {

  state.view = "home";

  render();

});

 

// The logo goes home

logoLink.addEventListener("click", (event) => {

  event.preventDefault();   // don't follow the link: we switch views ourselves

  state.view = "home";

  render();

});

 

// The Home link goes home too

homeLink.addEventListener("click", (event) => {

  event.preventDefault();

  state.view = "home";

  render();

});

 

// The My List link opens the My List view

myListLink.addEventListener("click", (event) => {

  event.preventDefault();

  state.view = "mylist";

  render();

});

 

// Add the open show to My List, or take it out

showListButton.addEventListener("click", () => {

  toggleMyList(state.currentShow);

});

 

// ---------- Day 11: your site's details, from site.js ----------

 

// SITE comes from site.js. If site.js has a mistake, SITE doesn't exist,

// so we use an empty object and the page keeps its normal text.

let siteInfo = {};

if (typeof SITE === "object" && SITE !== null) {

  siteInfo = SITE;

}

 

// The text of one field of SITE, or "" when it's missing or isn't text

function siteText(field) {

  if (typeof siteInfo[field] !== "string") {

    return "";

  }

  return siteInfo[field].trim();

}

 

if (siteText("name") !== "") {

  logoLink.textContent = siteText("name");   // the logo

  document.title = siteText("name");         // the browser tab

}

if (siteText("tagline") !== "") {

  heroText.textContent = siteText("tagline");   // under the big heading

}

if (siteText("owner") !== "") {

  madeBy.textContent = "Made by " + siteText("owner");   // the footer

  madeBy.hidden = false;

}

if (siteText("description") !== "") {

  descriptionTag.setAttribute("content", siteText("description"));   // for search engines

}

 

// ---------- Start: load the first shows from TVmaze ----------

loadShows("");

 