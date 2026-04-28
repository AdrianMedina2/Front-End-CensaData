document.addEventListener("DOMContentLoaded", () => {
    const modalContent = document.getElementById("loginModalContent");
    const loginModal = document.getElementById("loginModal");

    // Cargar login.html en el modal
    loginModal.addEventListener("show.bs.modal", () => {
        const path = window.location.pathname.includes("/pages/")
            ? "login.html"
            : "pages/login.html";

        fetch(path)
            .then(res => res.text())
            .then(html => {
                modalContent.innerHTML = html;

                // Enganchar el submit del formulario después de insertar el HTML
                const form = modalContent.querySelector("#loginForm");
                if (form) {
                    form.addEventListener("submit", (e) => {
                        e.preventDefault();

                        const username = form.querySelector("#username").value;
                        const role = form.querySelector("#role").value;

                        // Validación de no campos vacíos
                        if (!username || !password || !role) {
                            alert("Por favor, completa todos los campos antes de iniciar sesión.");
                            return;
                        }
                        // Guardar sesión en localStorage
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("username", username);
                        localStorage.setItem("role", role);

                        // Cerrar modal
                        const modalInstance = bootstrap.Modal.getInstance(loginModal);
                        modalInstance.hide();

                        // Actualizar navbar
                        actualizarNavbar();
                    });
                }
            })
            .catch(() => {
                modalContent.innerHTML = "<p>Error al cargar el login.</p>";
            });
    });

    // Función para actualizar navbar según sesión
    function actualizarNavbar() {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const username = localStorage.getItem("username");

        const loginBtn = document.querySelector("[data-bs-target='#loginModal']");
        const navbar = document.querySelector(".navbar");

        if (isLoggedIn && username) {
            if (loginBtn) loginBtn.style.display = "none";

            let userDropdown = document.querySelector("#userDropdown");
            if (!userDropdown) {
                // Dropdown
                const dropdown = document.createElement("div");
                dropdown.className = "dropdown ms-3";
                dropdown.id = "userDropdown";

                dropdown.innerHTML = `
                    <button class="btn btn-brand-light rounded-pill dropdown-toggle d-flex align-items-center" 
                            type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle me-2"></i>
                        <span>${username}</span>
                    </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                    <li><button class="dropdown-item" id="logoutBtn">Cerrar sesión</button></li>
                    </ul>
                    `;
                navbar.appendChild(dropdown);

                // Logout
                const logoutBtn = dropdown.querySelector("#logoutBtn");
                logoutBtn.addEventListener("click", () => {
                    localStorage.clear();
                    actualizarNavbar();
                    alert("Sesión cerrada");
                });
            } else {
                // Actualizar nombre si ya existe
                userDropdown.querySelector("span").textContent = username;
            }
        } else {
            if (loginBtn) loginBtn.style.display = "inline-block";
            const userDropdown = document.querySelector("#userDropdown");
            if (userDropdown) userDropdown.remove();
        }
    }



    // Ejecutar al cargar la página
    actualizarNavbar();
});
