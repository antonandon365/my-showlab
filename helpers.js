// helpers.js: small helper functions (read only)

 

// ratingLabel(9.2) -> "Must watch", ratingLabel(7.5) -> "Worth a try", ratingLabel(5) -> "Skip it"

function ratingLabel(rating) {

  if (rating >= 8.5) {

    return "Must watch";

  } else if (rating >= 7) {

    return "Worth a try";

  } else {

    return "Skip it";

  }

}

 

// yearsLabel(1994, 2004) -> "1994–2004", yearsLabel(2019, 2019) -> "2019",

// yearsLabel(2019, null) -> "2019–now" (still running), yearsLabel(null, null) -> ""

function yearsLabel(premiered, ended) {

  if (!premiered) {

    return "";

  }

  if (!ended) {

    return premiered + "–now";

  }

  if (premiered === ended) {

    return String(premiered);

  }

  return premiered + "–" + ended;

}

 

// getByGenre(shows, "Comedy") -> only the shows that have this genre

function getByGenre(list, genre) {

  return list.filter((show) => show.genres.includes(genre));

}

 

// allGenres(shows) -> ["Action", "Adventure", "Comedy", ...]: every genre once, from A to Z

function allGenres(list) {

  const result = [];

  for (const show of list) {

    for (const genre of show.genres) {

      if (!result.includes(genre)) {

        result.push(genre);

      }

    }

  }

  return result.sort();

}

 

// ---------- Helpers for TVmaze's data ----------

 

// stripTags("<p><b>Dark</b> is a mystery.</p>") -> "Dark is a mystery."

// TVmaze writes its summaries in HTML. We keep only the text.

function stripTags(html) {

  if (!html) {

    return "";

  }

  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();

}

 

// yearOf("2019-06-21") -> 2019, yearOf(null) -> null

function yearOf(date) {

  if (!date) {

    return null;

  }

  return Number(date.slice(0, 4));

}

 

// toShow(apiShow): one show in TVmaze's shape -> one show in OUR shape.

// Some of TVmaze's fields can be null, so each one gets a safe value.

function toShow(apiShow) {

  let network = "";

  if (apiShow.network) {

    network = apiShow.network.name;

  } else if (apiShow.webChannel) {

    network = apiShow.webChannel.name;   // streaming shows have a web channel instead

  }

 

  let image = null;

  if (apiShow.image) {

    image = apiShow.image.medium;        // the medium-sized poster

  }

 

  let rating = null;

  if (apiShow.rating) {

    rating = apiShow.rating.average ?? null;

  }

 

  return {

    id: apiShow.id,

    name: apiShow.name,

    genres: apiShow.genres ?? [],

    rating: rating,

    premiered: yearOf(apiShow.premiered),

    ended: yearOf(apiShow.ended),

    runtime: apiShow.averageRuntime ?? apiShow.runtime ?? null,

    network: network,

    image: image,

    summary: stripTags(apiShow.summary),

  };

}