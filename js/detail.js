const getData = async (id) => {
  let url = `https://omdbapi.com/?apikey=7035c60c&i=${id}&plot=full`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const errorRender = (message) => {
  let errorHtml = `<div class="error-message">${message}</div>`;
  document.querySelector("main").innerHTML = errorHtml;
};

const loadingRender = () => {
  document.querySelector(".details").style.visibility = "hidden";
  document.querySelector(".spinner-border").style.display = "block";
};

const renderDetails = (details) => {
  document.querySelector(
    ".movie-poster"
  ).innerHTML = `<img src="${details.Poster}" alt="movie-poster" onerror="this.src='../No_img.jpg'">`;
  document.querySelector(".movie-details .title").innerText =
    details.Title || "N/A";
  document.querySelector(".labels .released").innerText =
    details.Released || "N/A";
  document.querySelector(".labels .runtime").innerText =
    details.Runtime || "N/A";
  document.querySelector(".labels .country").innerText =
    details.Country || "N/A";
  document.querySelector(".plot").innerText = details.Plot || "N/A";
  document.querySelector(".ratings span").innerText =
    `${details.imdbRating} / 10` || "N/A / 10";
  document.querySelector(".actors span").innerText = details.Actors || "N/A";
  document.querySelector(".director span").innerText =
    details.Director || "N/A";
  document.querySelector(".production span").innerText =
    details.Production || "N/A";
  document.querySelector(".genre span").innerText = details.Genre;
  document.querySelector(".details").style.visibility = "visible";
  document.querySelector(".spinner-border").style.display = "none";
};

const getDetail = async () => {
  const movieId = sessionStorage.getItem("id");
  try {
    loadingRender();
    const details = await getData(movieId);
    if (details.Response === "False") {
      throw new Error(details.Error);
    }
    renderDetails(details);
  } catch (error) {
    errorRender(error.message);
  }
};

getDetail();
