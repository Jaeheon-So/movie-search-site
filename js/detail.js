import { getParam } from "./param";

// imdbid를 사용해서 api에 요청을 보낸 후 나온 데이터를 반환하는 함수
const getData = async (id) => {
  let url = `https://omdbapi.com/?apikey=7035c60c&i=${id}&plot=full`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

// error가 발생 했을 시 에러화면을 출력하는 함수
const errorRender = (message) => {
  let errorHtml = `<div class="error-message">${message}</div>`;
  document.querySelector("main").innerHTML = errorHtml;
};

// 페이지 로딩 시 로딩스피너를 보여주는 함수
const loadingRender = () => {
  document.querySelector(".details").style.visibility = "hidden";
  document.querySelector(".spinner-border").style.display = "block";
};

// 화면에 가져온 영화 상세 데이터를 출력해주는 함수
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

// 최초에 실행시키는, 영화의 상세 정보를 가져오는 과정을 나타내는 함수
const getDetail = async () => {
  const movieId = getParam("id");
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
