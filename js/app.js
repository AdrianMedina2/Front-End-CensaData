document.addEventListener("DOMContentLoaded", () => {
    const modalContent = document.getElementById("loginModalContent");
    const loginModal = document.getElementById("loginModal");

    loginModal.addEventListener("show.bs.modal", () => {
        // Si la URL contiene /pages/, carga login.html directo
        const path = window.location.pathname.includes("/pages/")
            ? "login.html"
            : "pages/login.html";

        fetch(path)
            .then(res => res.text())
            .then(html => {
                modalContent.innerHTML = html;
            })
            .catch(() => {
                modalContent.innerHTML = "<p>Error al cargar el login.</p>";
            });
    });
});
