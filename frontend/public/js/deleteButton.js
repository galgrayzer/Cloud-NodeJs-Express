let input = document.querySelector("#input");
let button = document.querySelector("#button");
let username = document.querySelector("#username");

function stateHandle() {
  if (document.querySelector("#input").value === username.value) {
    button.disabled = false;
    button.style.backgroundColor = "white";
  } else {
    button.disabled = true;
    button.style.backgroundColor = "rgba(95, 85, 85, 0.644)";
  }
}
