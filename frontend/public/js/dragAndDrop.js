// Handle dragenter
document.addEventListener("dragenter", function (e) {
  e.stopPropagation();
  e.preventDefault();
});

// Handle dragover
document.addEventListener("dragover", function (e) {
  e.stopPropagation();
  e.preventDefault();
});

// Handle drop
document.addEventListener("drop", function (e) {
  e.stopPropagation();
  e.preventDefault();

  // Get the files that were dropped
  var file = e.dataTransfer.files;
  if (file.length !== 1) {
    return alert("only one file at a time!");
  }
  document.getElementById("file").files = file;
  showLoading();
  document.getElementById("fileLabel").classList =
    "uk-align-center uk-button uk-button-large uk-first-column btn-login-green";
  document.getElementById("fileLabel").innerHTML = "please wait";
  document.getElementById("form").submit();
});
