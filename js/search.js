const input = document.querySelector(".search-input");
let timer;
let page = sessionStorage.getItem("page");

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
  selectYear.value = sessionStorage.getItem("y");
};

const setInput = () => {
  input.value = sessionStorage.getItem("s");
};

// input값에 변화가 생기면 실행
input.addEventListener("input", (e) => {
  sessionStorage.setItem("page", 1);
  clearTimeout(timer);
  let keyword = e.target.value.trim();
  sessionStorage.setItem("s", keyword);
  document.querySelector(".movies").innerHTML = ``;
  if (keyword.length < 1) {
    errorRender("Please enter your keyword to search.");
    return;
  }
  timer = setTimeout(getMovies, 1000);
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

  // sessionStorage 값 변경
  sessionStorage.setItem(name, value);
  sessionStorage.setItem("page", 1);
  document.querySelector(".movies").innerHTML = ``;
  // input에 값이 없을 경우 errorRender
  if (input.value.trim().length < 1) {
    errorRender("Please enter your keyword to search.");
    return;
  }

  // type 체크박스에서 체크된 type의 개수가 0인 경우
  if (
    document.querySelector("." + sessionStorage.getItem("type") + "-count")
      .textContent === "0"
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
      if (name !== "list-count")
        errorRender(
          `${value.replace(/^[a-z]/, (char) => char.toUpperCase())} not Found!`
        );
    }
    return;
  }
  getMovies(); // 위 if문들에 걸리지 않았으면 실행
};

/* 년도 select box에 변화가 생겼을 경우 실행되는 함수
   해당 년도의 영화를 검색 */
window.changeYear = (element) => {
  sessionStorage.setItem("page", 1);
  sessionStorage.setItem("y", element.value);
  document.querySelector(".movies").innerHTML = ``;
  getMovies();
};

/* 영화를 클릭했을 때 실행되는 함수
   영화 상세 페이지로 이동 */
window.goDetail = (movieId) => {
  sessionStorage.setItem("id", movieId);
  window.location.href = `/detail/detail.html`;
};

// 이전 페이지에서 선택한 type, list-count에 해당하는 체크박스에 체크 표시를 하는 함수
const checked = (name, value) => {
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((cb) => {
    if (cb.value === value) {
      cb.checked = true;
    }
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
  // document.querySelector(".main-layout nav").style.display = "none";
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

// 가져온 영화 목록을 화면에 출력하는 함수
const movieRender = (movies) => {
  movieHtml = movies.forEach((movie) => {
    const el = document.createElement("div");
    el.classList.add("movie");
    el.innerHTML = /*html*/ ` 
              <div class="movie" onclick="goDetail('${movie.imdbID}')">
                <div class="info">
                  <div class="year">${movie.Year}</div>
                  <div class="title">${movie.Title}</div>
                </div>
                <img src="${movie.Poster}" alt="movie-poster" onerror="this.src='../No_img.jpg'">
              </div>`;
    document.querySelector(".movies").append(el);
  });
  document.querySelector(".movies").style.visibility = "visible";
  document.querySelector(".spinner-border").style.display = "none";
};

// 검색하여 나온 영화 목록을 화면에 출력하는 과정을 나타내는 함수
const getMovies = async () => {
  try {
    // window.scrollTo({ top: 0, behavior: "smooth" });
    // sessionStorage에 저장한 값들 가져오기
    const selectType = sessionStorage.getItem("type");
    const listCount = sessionStorage.getItem("list-count");
    const inputValue = sessionStorage.getItem("s");
    const year = sessionStorage.getItem("y");
    const page = sessionStorage.getItem("page");

    // input에 값이 없을 경우 errorRender
    if (inputValue.length < 1) {
      errorRender("Please enter your keyword to search.");
      return;
    }

    // 필요한 값들 초기화
    let movies = [];
    let resStatus = false;
    let totalResult = 0;
    let totalPage = 0;

    // 영화 목록을 가져오기 전 로딩
    // loadingRender();

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
      console.log(totalPage);
      if (totalPage === Number(page)) {
        console.log("hi");
        infiniteScroll = false;
      }
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
    movieRender(movies);
  } catch (error) {
    // try에서 error 발생 시 errorRender
    errorRender(error.message);
  }
};

let infiniteScroll = true;
const footerEl = document.querySelector(".bottom");
// 1. 인터섹션 옵저버 생성
const io = new IntersectionObserver(
  (entry, observer) => {
    // 3. 현재 보이는 target 출력
    const ioTarget = entry[0].target;

    // 4. viewport에 target이 보이면 하는 일
    if (entry[0].isIntersecting && infiniteScroll) {
      console.log("현재 보이는 타켓", ioTarget);
      // 5. 현재 보이는 target 감시 취소해줘
      io.observe(footerEl);
      // 6. 새로운 li 추가해
      let currentPage = sessionStorage.getItem("page");
      sessionStorage.setItem("page", Number(currentPage) + 1);
      getMovies();
    }
  },
  {
    // 8. 타겟이 50% 이상 보이면 해줘!
    threshold: 1,
  }
);
// 2. li감시해!
io.observe(footerEl);

const init = () => {
  setInput();
  setYear();
  checked("type", sessionStorage.getItem("type"));
  checked("list-count", sessionStorage.getItem("list-count"));
  getMovies();
};

init();
