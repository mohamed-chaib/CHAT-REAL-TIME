const chatForm = document.getElementById("chat-form");
const chatmessages = document.querySelector(".chat-messages");
const roomUsers = document.getElementById("users");
const roomName = document.getElementById("room-name");

// get username and room form the url

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);
const socket = io();
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);
  chatmessages.scrollTop = chatmessages.scrollHeight;
});
socket.on("chat message", (message) => {});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.msg.value;
  socket.emit("chat message", message);
  e.target.elements.msg.value = "";
});

// functio for add a mesage into the main chat
function outputMessage(msg) {
  chatmessages.innerHTML += `
    <div class="message">
						<p class="meta">${msg.username} <span>${msg.time}</span></p>
						<p class="text">
							${msg.text}
						</p>
					</div>
    `;
}

// ADD ROOM NAME TO DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// ADD ROOM users TO DOM

function outputRoomUsers(users) {
  roomUsers.innerHTML = "";

  for (const user of users) {
    roomUsers.innerHTML += `<li>${user.username}</li>`;
  }
}
