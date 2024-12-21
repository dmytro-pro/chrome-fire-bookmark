document.body.addEventListener("bookmarkEffect", (event) => {
    const { effect, count } = event.detail;

    const effectDiv = document.createElement("div");
    effectDiv.classList.add("bookmark-effect");

    if (effect === "fire") {
        effectDiv.textContent = `🔥${count}`;
    } else if (effect === "ice") {
        effectDiv.textContent = count > 0 ? `❄️${count}` : "⚠️";
    } else if (effect === "warning") {
        effectDiv.textContent = "⚠️";
    }

    effectDiv.style.top = `${window.innerHeight / 2}px`;
    effectDiv.style.left = `${window.innerWidth / 2}px`;

    document.body.appendChild(effectDiv);
    setTimeout(() => effectDiv.remove(), 300);
});
