const input = document.querySelector(".search-input");
let timer;
let page = sessionStorage.getItem("page");

const setYear = () => {
  const selectYear = document.getElementById("year");
  const date = new Date();
  for (let i = date.getFullYear(); i >= 1985; i--) {
    const objOption = document.createElement("option");
    objOption.text = i;
    objOption.value = i;
    selectYear.options.add(objOption);
  }
};

input.addEventListener("input", (e) => {
  sessionStorage.setItem("page", 1);
  clearTimeout(timer);
  let keyword = e.target.value.trim();
  sessionStorage.setItem("s", keyword);
  if (keyword.length < 1) {
    errorRender("Please enter your keyword to search.");
    return;
  }
  timer = setTimeout(getMovies, 1000);
});

// onclick 함수 사용, parcel에서 함수 undefined 오류 떄문에 window(전역)에 설정
window.checkOnlyOne = (element, name, value) => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  const checkStatus = element.checked;
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
  element.checked = true;
  if (checkStatus === false) return;
  sessionStorage.setItem(name, value);
  sessionStorage.setItem("page", 1);
  if (input.value.trim().length < 1) {
    errorRender("Please enter your keyword to search.");
    return;
  }
  if (
    document.querySelector("." + sessionStorage.getItem("type") + "-count")
      .textContent === "0"
  ) {
    if (
      document.querySelector(".error-message") &&
      document.querySelector(".error-message").textContent ===
        "Too many results."
    )
      errorRender("Too many results.");
    else {
      if (name !== "list-count")
        errorRender(
          `${value.replace(/^[a-z]/, (char) => char.toUpperCase())} not Found!`
        );
    }
    return;
  }
  getMovies();
};

window.changeYear = (element) => {
  sessionStorage.setItem("page", 1);
  sessionStorage.setItem("y", element.value);
  getMovies();
};

window.pageClick = (pageNum) => {
  sessionStorage.setItem("page", pageNum);
  getMovies();
};

window.goDetail = (movieId) => {
  sessionStorage.setItem("id", movieId);
  window.location.href = `/detail/detail.html`;
};

const getData = async (inputValue, selectType, page, year) => {
  let url =
    `https://omdbapi.com/?apikey=7035c60c&s=${inputValue}&type=${selectType}&page=${page}` +
    (year === "all" ? `` : `&y=${year}`);
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const checked = (name, value) => {
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((cb) => {
    if (cb.value === value) {
      cb.checked = true;
    }
  });
};

const errorRender = (message) => {
  let errorHtml = `<div class="error-message">${message}</div>`;
  if (message === "Please enter your keyword to search.") {
    document.querySelector(".movie-count").textContent = "0";
    document.querySelector(".series-count").textContent = "0";
    document.querySelector(".episode-count").textContent = "0";
  }
  document.querySelector(".page-show").textContent = "0";
  document.querySelector(".total-result").textContent = "0";
  document.querySelector(".movies").innerHTML = errorHtml;
  document.querySelector(".movies").style.visibility = "visible";
  document.querySelector(".main-layout nav").style.display = "none";
  document.querySelector(".spinner-border").style.display = "none";
};

const loadingRender = () => {
  document.querySelector(".movies").style.visibility = "hidden";
  document.querySelector(".spinner-border").style.display = "block";
};

const countRender = async (inputValue, totalResult, year) => {
  const movieCount = (await getData(inputValue, "movie", 1, year)).totalResults;
  const seriesCount = (await getData(inputValue, "series", 1, year))
    .totalResults;
  const episodeCount = (await getData(inputValue, "episode", 1, year))
    .totalResults;

  document.querySelector(".total-result").textContent = totalResult || "0";
  document.querySelector(".movie-count").textContent = movieCount || "0";
  document.querySelector(".series-count").textContent = seriesCount || "0";
  document.querySelector(".episode-count").textContent = episodeCount || "0";
};

const pageRender = (totalPage, listCount, totalResult) => {
  const page = sessionStorage.getItem("page");
  let paginationHtml = "";
  let pageGroup = Math.ceil(page / 10);
  let last = pageGroup * 10;
  if (last > totalPage) {
    last = totalPage;
  }
  let first = last - 9 <= 0 ? 1 : last - 9;
  if (first >= 11 || (11 <= last && last <= 19)) {
    paginationHtml = `<li class="page-item" onclick="pageClick(1)">
                        <a class="page-link" href='javascript:void(0)'>&lt;&lt;</a>
                      </li>
                      <li class="page-item" onclick="pageClick(${page - 1})">
                        <a class="page-link" href='javascript:void(0)'>&lt;</a>
                      </li>`;
  }
  for (let i = first; i <= last; i++) {
    paginationHtml += `<li class="page-item ${i == page ? "active" : ""}">
                        <a class="page-link" href="javascript:void(0)" onclick="pageClick(${i})">${i}</a>
                      </li>`;
  }
  if (last < totalPage) {
    paginationHtml += `<li class="page-item" onclick="pageClick(${page + 1})">
                        <a  class="page-link" href='javascript:void(0)'>&gt;</a>
                       </li>
                       <li class="page-item" onclick="pageClick(${totalPage})">
                        <a class="page-link" href='javascript:void(0)'>&gt;&gt;</a>
                       </li>`;
  }
  document.querySelector(".page-show").textContent = `${
    page * listCount - listCount + 1
  } ~ ${page * listCount > totalResult ? totalResult : page * listCount}`;
  document.querySelector(".pagination").innerHTML = paginationHtml;
};

const movieRender = (movies) => {
  let movieHtml = ``;
  movieHtml = movies
    .map((movie) => {
      return `<div class="movie" onclick="goDetail('${movie.imdbID}')">
                <div class="info">
                  <div class="year">${movie.Year}</div>
                  <div class="title">${movie.Title}</div>
                </div>
                <img src="${movie.Poster}" alt="movie-poster" onerror="this.src='../No_img.jpg'">
              </div>`;
    })
    .join("");
  document.querySelector(".movies").innerHTML = movieHtml;
  document.querySelector(".movies").style.visibility = "visible";
  document.querySelector(".main-layout nav").style.display = "flex";
  document.querySelector(".spinner-border").style.display = "none";
};

const getMovies = async () => {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const selectType = sessionStorage.getItem("type");
    const listCount = sessionStorage.getItem("list-count");
    const inputValue = sessionStorage.getItem("s");
    const year = sessionStorage.getItem("y");
    const page = sessionStorage.getItem("page");
    if (inputValue.length < 1) {
      errorRender("Please enter your keyword to search.");
      return;
    }
    let movies = [];
    let resStatus = false;
    let totalResult = 0;
    let totalPage = 0;
    input.value = inputValue;
    loadingRender();
    checked("type", selectType);
    checked("list-count", listCount);
    document.querySelector("#year").value = year;
    for (let i = listCount / 10 - 1; i >= 0; i--) {
      const data = await getData(
        inputValue,
        selectType,
        (listCount / 10) * page - i,
        year
      );
      resStatus = data.Response;
      totalResult = totalResult || data.totalResults;
      totalPage = Math.ceil(totalResult / listCount);
      await countRender(inputValue, totalResult, year);
      if (resStatus === "False") {
        throw new Error(data.Error);
      }
      movies.push(...data.Search);
      if (data.Search.length < 10) break;
    }
    pageRender(totalPage, listCount, totalResult);
    movieRender(movies);
  } catch (error) {
    errorRender(error.message);
  }
};

setYear();
getMovies();
