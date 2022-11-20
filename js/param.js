// 쿼리값을 변경시키는 함수
export const setParam = (key, value) => {
  const urlSearch = new URLSearchParams(location.search);
  for (let i = 0; i < key.length; i++) {
    urlSearch.set(key[i], value[i]);
  }
  const newUrl = `${
    window.location.origin
  }/search/search.html?${urlSearch.toString()}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

// key에 해당하는 쿼리값을 반환하는 함수
export const getParam = (key) => {
  return new URLSearchParams(location.search).get(key);
};
