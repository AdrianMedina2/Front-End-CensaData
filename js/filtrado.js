document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("faqSearch");
    const items = document.querySelectorAll("#faqAccordion .accordion-item");

    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        items.forEach(item => {
            const question = item.querySelector(".accordion-button").textContent.toLowerCase();
            const answer = item.querySelector(".accordion-body").textContent.toLowerCase();
            // Se muestra solo si el término aparece en la pregunta o en la respuesta
            item.style.display = (question.includes(term) || answer.includes(term)) ? "" : "none";
        });
    });
});