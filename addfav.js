const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const userList = document.querySelector("#user-list"); //使用者列表節點
const users = JSON.parse(localStorage.getItem('favoriteUsers')) //收藏清單放置處
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let filteredUsers = [];

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
        <button class="btn btn-outline-success btn-remove-favorite" data-id="${item.id}">X</button>
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
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  } //綁移除收藏按鈕
});



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

// 移除收藏清單
function removeFromFavorite (id) {
  if (!users || !users.length) return
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  users.splice (userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUserList(users)
}


renderUserList(users)
