document.addEventListener("DOMContentLoaded", () => {
    // Load testimonials
    fetch("/api/testimonials")
        .then((response) => response.json())
        .then((testimonials) => {
            const container = document.getElementById("testimonialsContainer");
            testimonials.forEach((t) => {
                const card = document.createElement("div");
                card.classList.add("testimonial-card");
                card.innerHTML = `<h4>${t.name}</h4><p>${t.testimonial}</p>`;
                container.appendChild(card);
            });
        });

    // Handle contact form submission
    document.getElementById("contactForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(formData)),
        })
            .then((response) => response.json())
            .then((data) => {
                const responseText = document.getElementById("formResponse");
                responseText.textContent = data.message;
                responseText.style.color = data.success ? "green" : "red";
            });
    });
});
