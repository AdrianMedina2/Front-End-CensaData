import { initVisitorAuth, getAuthHeaders } from "./auth.js";

const API_BASE = "https://censadata-fxgvbqa0ghbresg0.eastus-01.azurewebsites.net";

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("reportesPublicos");

    // Spinner inicial de carga
    contenedor.innerHTML = `
        <div class="d-flex justify-content-center my-5">
        <div class="spinner-border text-brand" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        </div>
    `;

    // Inicializar autenticación visitante
    await initVisitorAuth();

    try {
        const res = await fetch(`${API_BASE}/api/reportes/publicos`, {
            headers: getAuthHeaders()
        });

        const result = await res.json();
        const reportes = result.data;

        // Limpiar spinner inicial
        contenedor.innerHTML = "";

        if (!reportes || reportes.length === 0) {
            contenedor.innerHTML = `<p class="text-muted">No hay reportes públicos disponibles.</p>`;
            return;
        }

        reportes.forEach(r => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3";
            card.innerHTML = `
                <div class="card shadow-sm h-100 hover-lift">
                <div class="card-body">
                    <h5 class="card-title fw-bold">
                    <i class="bi bi-file-earmark-text me-2"></i> Reporte: ${r.tiporeporte}
                    </h5>
                    <p class="card-text">
                    Este reporte está disponible para consulta pública y puede descargarse en formato PDF.
                    </p>
                    <button class="btn btn-brand fw-bold rounded-pill descargar-btn" 
                            data-tiporeporte="${r.tiporeporte}">
                    Descargar PDF
                    </button>
                </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

        // Listener para cada botón de descarga
        document.querySelectorAll(".descargar-btn").forEach(btn => {
            btn.addEventListener("click", async e => {
                const tipo = e.target.getAttribute("data-tiporeporte");

                // Spinner en el botón
                e.target.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Descargando...
                    `;
                e.target.disabled = true;

                try {
                    const res = await fetch(`${API_BASE}/api/reportes/publicos/pdf/?tiporeporte=${tipo}`, {
                        headers: getAuthHeaders()
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);

                    // Forzar descarga
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${tipo}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);

                    // Restaurar botón
                    e.target.innerHTML = "Descargar PDF";
                    e.target.disabled = false;

                    // Confirmación
                    mostrarConfirmacion(`Reporte "${tipo}" descargado con éxito`);

                } catch (err) {
                    console.error("Error descargando reporte:", err);
                    e.target.innerHTML = "Error";
                }
            });
        });

    } catch (err) {
        console.error("Error cargando reportes:", err);
        contenedor.innerHTML = `<p class="text-danger">Hubo un problema al cargar los reportes.</p>`;
    }
});

// Función para mostrar confirmación
function mostrarConfirmacion(mensaje) {
    const confirmDiv = document.createElement("div");
    confirmDiv.className = "position-fixed top-50 start-50 translate-middle bg-success text-white fw-bold p-3 rounded shadow";
    confirmDiv.style.zIndex = "1050";
    confirmDiv.innerText = mensaje;

    document.body.appendChild(confirmDiv);

    // Desaparece después de 3 segundos
    setTimeout(() => {
        confirmDiv.remove();
    }, 3000);
}
