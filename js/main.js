const btnApply = document.querySelector(".btn-apply");
const input = document.querySelector(".search-input");

// 년도 select box에 1985 ~ 올해년도까지 option을 추가해주는 함수
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

// apply 버튼이 클릭되거나 input에서 enter가 눌렸을 때 실행되는 함수
const goSearch = () => {
  // input에 값이 없을 때 실행
  if (input.value.trim().length < 1) {
    alert("검색어를 입력해주세요");
    input.focus();
    return;
  }
  // sessionStorage에 필요한 값들 저장 후 search page로 이동
  const selectType = document.querySelector("#type").value;
  const listCount = document.querySelector("#list-count").value;
  const year = document.querySelector("#year").value;
  sessionStorage.setItem("type", selectType);
  sessionStorage.setItem("list-count", listCount);
  sessionStorage.setItem("s", input.value.trim());
  sessionStorage.setItem("y", year);
  sessionStorage.setItem("page", 1);
  window.location.href = `./search/search.html`;
};

//apply 버튼이 클릭되거나 input에서 enter가 눌렸을 때 goSearch 함수 실행
btnApply.addEventListener("click", goSearch);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    goSearch();
  }
});

input.focus();
setYear();
