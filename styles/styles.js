const modal = document.querySelector('#instruction-modal');
const activate = document.querySelector('#instruction-button');
const deactivate = document.querySelector('#instruction-close');

activate.onclick = function() {
    modal.style.display = "block";
}

deactivate.onclick = function() {
    modal.style.display = "none";
}