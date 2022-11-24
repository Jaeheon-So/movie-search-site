import { setParam, getParam } from "./param";

const input = document.querySelector(".search-input");
let timer;
let pastInput = getParam("s");
let pastYear = getParam("y");

// input값에 변화가 생기면 실행
input.addEventListener("input", (e) => {
  clearTimeout(timer);
  const keyword = e.target.value.trim();
  pastInput = getParam("s");
  pastYear = getParam("y");
  timer = setTimeout(() => setParam(["s", "page"], [keyword, 1]), 700);
});

// url값에 변화가 생기면 실행, 59번째 줄까지 구글에 검색해서 복붙
window.addEventListener("locationChange", () => {
  if (getParam("s").length < 1)
    return errorRender("Please enter your keyword to search.");
  if (
    pastInput !== getParam("s") ||
    pastYear !== getParam("y") ||
    !findCheckboxError()
  ) {
    getMovies();
  }
});

history.pushState = ((f) =>
  function pushState() {
    let ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationChange"));
    return ret;
  })(history.pushState);

history.replaceState = ((f) =>
  function replaceState() {
    let ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationChange"));
    return ret;
  })(history.replaceState);

window.addEventListener("popstate", () => {
  pastInput = input.value;
  setInput();
  const selectYear = document.getElementById("year");
  pastYear = selectYear.value;
  selectYear.value = getParam("y");
  checked("type", getParam("type"));
  checked("list-count", getParam("list-count"));
  window.dispatchEvent(new Event("locationChange"));
});

// 체크박스에 onclick 함수 사용, 함수 undefined 오류 떄문에 window(전역)에 설정
window.checkOnlyOne = (element, name, value) => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // 체크박스에 체크가 하나만 가능하도록 만듬
  const checkStatus = element.checked;
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
  element.checked = true;

  if (checkStatus === false) return; // 이미 체크된 박스를 또 놀렀을 경우 밑에 코드 실행 안되게 return

  pastInput = getParam("s");
  pastYear = getParam("y");
  setParam([name, "page"], [value, 1]); //  쿼리값 변경
};

/* 년도 select box에 1985 ~ 올해년도까지 option을 추가해주는 함수
   이전 페이지에서 선택한 년도를 화면에 출력 */
const setYear = () => {
  const selectYear = document.getElementById("year");
  const date = new Date();
  for (let i = date.getFullYear(); i >= 1985; i--) {
    const objOption = document.createElement("option");
    objOption.text = i;
    objOption.value = i;
    selectYear.options.add(objOption);
  }
  selectYear.value = getParam("y");
};

// input 값 설정(최초 로딩, 뒤로가기, 앞으로 가기 때문에 필요)
const setInput = () => {
  input.value = getParam("s");
};

const findCheckboxError = () => {
  if (
    document.querySelector("." + getParam("type") + "-count").textContent ===
    "0"
  ) {
    // 에러 메세지가 존재하고 그것이 "Too many results."인 경우 errorRender("Too many results.")
    if (
      document.querySelector(".error-message") &&
      document.querySelector(".error-message").textContent ===
        "Too many results."
    )
      errorRender("Too many results.");
    // 그 외의 경우
    else {
      // type 체크박스가 클릭되었을 경우 errorRender("${Type} not Found!")
      errorRender(
        `${getParam("type").replace(/^[a-z]/, (char) =>
          char.toUpperCase()
        )} not found!`
      );
    }
    return true;
  }
  return false;
};

/* 년도 select box에 변화가 생겼을 경우 실행되는 함수
   해당 년도로 쿼리값 변경 */
window.changeYear = (element) => {
  pastInput = getParam("s");
  pastYear = getParam("y");
  setParam(["y", "page"], [element.value, 1]);
};

/* 페이지 클릭 시 실행되는 함수
   해당 페이지오 쿼리값 변경 */
window.pageClick = (pageNum) => {
  setParam(["page"], [pageNum]);
};

/* 영화를 클릭했을 때 실행되는 함수
   영화 상세 페이지로 이동 */
window.goDetail = (movieId) => {
  window.location.href = `/detail/detail.html?id=${movieId}`;
};

// 이전 페이지에서 선택한 type, list-count에 해당하는 체크박스에 체크 표시를 하는 함수
const checked = (name, value) => {
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((cb) => {
    if (cb.value === value) cb.checked = true;
    else cb.checked = false;
  });
};

// api에 영화제목, 타입, 페이지, 년도를 사용하여 요청을 보낸 후 나온 데이터를 반환하는 함수
const getData = async (inputValue, selectType, page, year) => {
  let url =
    `https://omdbapi.com/?apikey=7035c60c&s=${inputValue}&type=${selectType}&page=${page}` +
    (year === "all" ? `` : `&y=${year}`);
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

// error가 발생 했을 시 에러화면을 출력하는 함수
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

// 페이지 로딩 시 로딩스피너를 보여주는 함수
const loadingRender = () => {
  document.querySelector(".movies").style.visibility = "hidden";
  document.querySelector(".spinner-border").style.display = "block";
};

// movie, series, episode, total result의 개수를 화면에 출력하는 함수
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

/*영화 목록 하단에 페이지 목록을 화면에 출력하는 함수
  영화 목록 상단에 전체 개수 중 몇번째(?? ~ ??)목록 범위를 보고 있는지 화면에 출력 */
const pageRender = (totalPage, listCount, totalResult) => {
  const page = getParam("page");
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

// 가져온 영화 목록을 화면에 출력하는 함수
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

// 검색하여 나온 영화 목록을 화면에 출력하는 과정을 나타내는 함수
const getMovies = async () => {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 쿼리값들 가져오기
    const selectType = getParam("type");
    const listCount = getParam("list-count");
    const inputValue = getParam("s");
    const year = getParam("y");
    const page = getParam("page");

    // input에 값이 없을 경우 errorRender
    if (inputValue.length < 1)
      return errorRender("Please enter your keyword to search.");

    // 필요한 값들 초기화
    let movies = [];
    let resStatus = false;
    let totalResult = 0;
    let totalPage = 0;

    // 영화 목록을 가져오기 전 로딩
    loadingRender();

    // 영화 목록을 10, 20, 30개 씩 가져올 경우를 생각한 반복문
    for (let i = listCount / 10 - 1; i >= 0; i--) {
      // 데이터를 가져온 후 변수에 할당
      const data = await getData(
        inputValue,
        selectType,
        (listCount / 10) * page - i,
        year
      );
      resStatus = data.Response;
      totalResult = totalResult || data.totalResults;
      totalPage = Math.ceil(totalResult / listCount);

      // 응답상태가 False 이고 첫번째 반복이면 에러를 발생시켜 catch 문으로 이동
      /* 응답상태가 False 이고 첫번째 반복이 아니면 반복문 탈출
         (ex: 전체 결과가 8개, list-count가 20이면 반복문을 2번 도는데 2번째 돌 때 응답상태가 False이다.
          이 경우 errorRender를 하지 않고 기존 8개만 출력)
      */
      if (resStatus === "False") {
        if (i !== listCount / 10 - 1) break;
        await countRender(inputValue, totalResult, year);
        throw new Error(data.Error);
      }

      // 응답상태가 False가 아니면 영화 목록에 추가
      movies.push(...data.Search);
    }

    // 각 type 별 개수와 전체 개수, 페이지 목록, 영화 목록을 화면에 출력
    await countRender(inputValue, totalResult, year);
    pageRender(totalPage, listCount, totalResult);
    movieRender(movies);
  } catch (error) {
    // try에서 error 발생 시 errorRender
    errorRender(error.message);
  }
};

const init = () => {
  setInput();
  setYear();
  checked("type", getParam("type"));
  checked("list-count", getParam("list-count"));
  getMovies();
};

init();
