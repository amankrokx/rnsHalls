//import '../css/loader.css'
let tl
function showLoader() {
    tl.classList.remove('hidden')
}

function hideLoader() {
    tl.classList.add('hidden')
}
window.onload = () => {
    tl = document.getElementById('loader')
}

export {hideLoader, showLoader}