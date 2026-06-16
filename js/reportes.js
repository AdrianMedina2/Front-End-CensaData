import { initVisitorAuth, getAuthHeaders } from "./auth.js";

const API_BASE = "https://censadata-fxgvbqa0ghbresg0.eastus-01.azurewebsites.net";

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("reportesPublicos");

    // Inicializar autenticación visitante
    await initVisitorAuth();

    try {
        const res = await fetch(`${API_BASE}/api/reportes/publicos/`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        if (!data || data.length === 0) {
            contenedor.innerHTML = `<p class="text-muted">No hay reportes públicos disponibles.</p>`;
            return;
        }

        data.forEach(r => {
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
                        <a href="${API_BASE}/api/reportes/publicos/pdf/?tiporeporte=${r.tiporeporte}" 
                        class="btn btn-brand fw-bold rounded-pill">
                        Descargar PDF
                        </a>
                    </div>
                    </div>
                `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando reportes:", err);
        contenedor.innerHTML = `<p class="text-danger">Hubo un problema al cargar los reportes.</p>`;
    }
});
