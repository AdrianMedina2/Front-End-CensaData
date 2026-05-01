document.addEventListener("DOMContentLoaded", () => {
    const modalContent = document.getElementById("loginModalContent");
    const loginModal = document.getElementById("loginModal");

    // Lógica del login con el modal
    if (loginModal && modalContent) {
        loginModal.addEventListener("show.bs.modal", () => {
            // Siempre carga login.html desde la carpeta /pages
            const path = "/pages/login.html";

            fetch(path)
                .then(res => res.text())
                .then(html => {
                    modalContent.innerHTML = html;

                    const form = modalContent.querySelector("#loginForm");
                    if (form) {
                        form.addEventListener("submit", (e) => {
                            e.preventDefault();

                            // Validación con Bootstrap
                            if (!form.checkValidity()) {
                                form.classList.add("was-validated");
                                return;
                            }

                            const username = form.querySelector("#username").value;
                            const password = form.querySelector("#password").value;
                            const role = form.querySelector("#role").value;

                            // Guardar sesión
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("username", username);
                            localStorage.setItem("role", role);

                            // Redirigir según rol (rutas absolutas)
                            if (role === "admin") {
                                window.location.href = "/pages/admin.html";
                            } else if (role === "investigador") {
                                window.location.href = "/pages/investigador.html";
                            } else {
                                window.location.href = "/index.html";
                            }
                        });
                    }
                })
                .catch(() => {
                    modalContent.innerHTML = "<p>Error al cargar el login.</p>";
                });
        });
    }

    // Actualizar navbar en las páginas
    actualizarNavbar();
});

// Función común para todas las páginas
function actualizarNavbar() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");
    const userDropdown = document.querySelector("#userDropdown");

    if (isLoggedIn && username && userDropdown) {
        userDropdown.innerHTML = `
        <button class="btn btn-brand-light rounded-pill dropdown-toggle d-flex align-items-center" 
                type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle me-2"></i>
            <span>${username}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li><button class="dropdown-item" id="logoutBtn">Cerrar sesión</button></li>
        </ul>
        `;

        const logoutBtn = userDropdown.querySelector("#logoutBtn");
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            alert("Sesión cerrada");
            window.location.href = "/index.html"; // vuelve a la landing
        });
    } else if (userDropdown) {
        userDropdown.innerHTML = "";
    }
}
