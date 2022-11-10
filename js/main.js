const btnApply = document.querySelector(".btn-apply");
const input = document.querySelector(".search-input");

const goSearch = () => {
  if (input.value.trim().length < 1) {
    alert("검색어를 입력해주세요");
    input.focus();
    return;
  }
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

btnApply.addEventListener("click", goSearch);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    goSearch();
  }
});
input.focus();
