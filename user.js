const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const userList = document.querySelector("#user-list"); //使用者列表節點
const users = []; //全部使用者列表放置處
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let filteredUsers = [];
const USERS_PER_PAGE = 36
const paginator = document.querySelector('#paginator')

// 寫入全部使用者列表
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="card">
      <img src=${item.avatar} class="card-img-top" alt="avatar" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
      <div class="card-body">
        <h5 class="card-title">${item.name}</h5>
      </div>
      <div class="card-footer d-flex flex-row-reverse">
        <button class="btn btn-outline-success btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </div>
    `;
  });
  userList.innerHTML = rawHTML;
}

// 使用者列表舍監聽、綁事件，點擊圖片會跳出視窗
userList.addEventListener("click", function onListClicked(event) {
  if (event.target.tagName === "IMG") {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  } //綁收藏按鈕
});

// 收藏功能
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const user = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("此名使用者已在收藏清單中");
  }
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

// 跳出視窗內容
function showUserModal(id) {
  const modalName = document.querySelector(".modal-title");
  const modalImage = document.querySelector(".modal-avatar");
  const modalInfo = document.querySelector(".modal-user-info");

  modalName.textContent = "";
  modalImage.src = "";
  modalInfo.textContent = "";

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;

      modalName.innerText = data.name;
      modalImage.src = data.avatar;
      modalInfo.innerHTML = `
      <p>gender: ${data.gender}</p>
      <p>age: ${data.age}</p>
      <p>region: ${data.region}</p>
      <p>birthday: ${data.birthday}</p>
      <p>email: ${data.email}</p>
    `;
    })
    .catch((error) => console.log(error));
}

// 設定搜尋功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );
  // if (!keyword.length) {
  //   return alert("請輸入有效字串");
  // }
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字:${keyword}無符合的使用者`);
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1));
});

// 設每頁要顯示的資料
function getUsersByPage (page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page-1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 設頁數
function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>  
    `
  }
  paginator.innerHTML = rawHTML
}

// 設點擊頁數事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
    const page = Number(event.target.dataset.page)
    renderUserList(getUsersByPage(page))
})


// 串接使用者列表資料API
axios
  .get(INDEX_URL)
  .then((response) => {
    // console.log(response.data.results);
    users.push(...response.data.results);
    renderUserList(getUsersByPage(1));
    renderPaginator(users.length)
  })
  .catch((err) => console.log(err));
