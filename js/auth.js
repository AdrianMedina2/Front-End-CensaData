const API_BASE = "https://censadata-fxgvbqa0ghbresg0.eastus-01.azurewebsites.net";

let accessToken = null;
let refreshToken = null;

export async function initVisitorAuth() {
    try {
        const res = await fetch(`${API_BASE}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Correo: "Visitante1@gmail.com",
                password: "12345678"
            })
        });

        const data = await res.json();
        accessToken = data.access;
        refreshToken = data.refresh;

        localStorage.setItem("visitorToken", accessToken);
        localStorage.setItem("visitorRefresh", refreshToken);
    } catch (err) {
        console.error("Error autenticando visitante:", err);
    }
}

export async function refreshVisitorAuth() {
    try {
        const storedRefresh = refreshToken || localStorage.getItem("visitorRefresh");
        if (!storedRefresh) return;

        const res = await fetch(`${API_BASE}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: storedRefresh })
        });

        const data = await res.json();
        accessToken = data.access;
        localStorage.setItem("visitorToken", accessToken);
    } catch (err) {
        console.error("Error refrescando token visitante:", err);
    }
}

export function getAuthHeaders() {
    const token = accessToken || localStorage.getItem("visitorToken");
    return {
        "Authorization": `Bearer ${token}`
    };
}
