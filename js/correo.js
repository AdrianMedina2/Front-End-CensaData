document.addEventListener("DOMContentLoaded", () => {
    emailjs.init({ publicKey: "H18gtlzACw8SElWPw" });

    const form = document.getElementById("contactForm");
    const toastSuccess = new bootstrap.Toast(document.getElementById("toastSuccess"), { autohide: true, delay: 3000 });
    const toastError = new bootstrap.Toast(document.getElementById("toastError"), { autohide: true, delay: 3000 });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.send("service_rkyvc9i", "template_i3xj9nn", {
            from_email: document.getElementById("email").value,
            message: document.getElementById("message").value,
            title: "CensaData - Contacto desde el sitio web"
        }).then(() => {
            toastSuccess.show(); // solo aquí se muestra
            form.reset();
        }, (err) => {
            console.error("Error:", err);
            toastError.show(); // solo aquí se muestra
        });
    });
});
