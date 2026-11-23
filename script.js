/* ==================== EFECTO RASCA Y GANA ==================== */

(() => {
  const frame = document.getElementById("scratchPhoto");
  const canvas = document.getElementById("scratchCanvas");
  const hint = document.getElementById("scratchHint");
  if (!frame || !canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const cover = new Image();
  let isDrawing = false;
  let isRevealed = false;
  let lastCheck = 0;
  let lastPoint = null;

  function drawCover() {
    if (!cover.complete || !cover.naturalWidth || isRevealed) return;

    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Dibuja la foto original como capa superior, sin deformarla.
    const scale = Math.max(rect.width / cover.naturalWidth, rect.height / cover.naturalHeight);
    const w = cover.naturalWidth * scale;
    const h = cover.naturalHeight * scale;
    ctx.drawImage(cover, (rect.width - w) / 2, (rect.height - h) / 2, w, h);

    // Tinte rosado sutil para que se note que la imagen se puede rascar.
    ctx.fillStyle = "rgba(185, 81, 130, 0.12)";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratchTo(point) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(34, rect.width * 0.12);
    ctx.beginPath();

    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else {
      ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    lastPoint = point;
  }

  function checkProgress() {
    if (isRevealed || performance.now() - lastCheck < 180) return;
    lastCheck = performance.now();

    try {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let samples = 0;
      const step = 4 * 32;

      for (let i = 3; i < pixels.length; i += step) {
        samples++;
        if (pixels[i] < 35) clear++;
      }

      if (samples && clear / samples >= 0.38) {
        isRevealed = true;
        frame.classList.add("is-revealed");
        canvas.style.transition = "opacity .35s ease";
        canvas.style.opacity = "0";
        if (hint) hint.style.opacity = "0";
        window.setTimeout(() => {
          canvas.remove();
          if (hint) hint.remove();
        }, 380);
      }
    } catch (error) {
      console.warn("No se pudo medir el progreso del efecto rasca y gana.", error);
    }
  }

  canvas.addEventListener("pointerdown", event => {
    if (isRevealed) return;
    event.preventDefault();
    isDrawing = true;
    lastPoint = null;
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    scratchTo(getPoint(event));
  });

  canvas.addEventListener("pointermove", event => {
    if (!isDrawing || isRevealed) return;
    event.preventDefault();
    scratchTo(getPoint(event));
    checkProgress();
  });

  function stopScratch() {
    if (!isDrawing) return;
    isDrawing = false;
    lastPoint = null;
    checkProgress();
  }

  canvas.addEventListener("pointerup", stopScratch);
  canvas.addEventListener("pointercancel", stopScratch);
  canvas.addEventListener("lostpointercapture", stopScratch);

  cover.addEventListener("load", drawCover);
  cover.addEventListener("error", () => {
    console.error("No se pudo cargar assets/pruebaJuli.jpg para el efecto rasca y gana.");
    if (hint) hint.textContent = "No se pudo cargar la foto de portada";
  });
  cover.src = "assets/pruebaJuli.jpg";

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => drawCover()).observe(frame);
  } else {
    window.addEventListener("resize", drawCover);
  }

  if (cover.complete && cover.naturalWidth) drawCover();
})();
//Cambiar esto si cambia el horario 
const targetDate = new Date("2026-11-27T09:00:00-03:00").getTime();
// Fin del día del evento (medianoche en Argentina): después se muestra un agradecimiento
const endOfEventDay = new Date("2026-11-27T12:00:00-03:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = targetDate - now;
  const timer = document.querySelector(".timer");
  const todayMsg = document.getElementById("today-message");
  const todayText = document.getElementById("today-text");
  const eventDay = document.getElementById("eventDay");

  // Botones de ubicación arriba de todo: solo el día del evento, ya terminada la cuenta
  if (eventDay) eventDay.hidden = !(distance <= 0 && now < endOfEventDay);

  if (distance <= 0) {
    // La cuenta llegó a cero: ocultamos el contador y mostramos el cartel
    if (timer) timer.hidden = true;
    if (todayMsg) todayMsg.hidden = false;
    if (todayText) {
      todayText.textContent = now < endOfEventDay ? "¡¡ES HOY!!" : "¡Gracias por acompañarme!";
    }
    return;
  }

  if (timer) timer.hidden = false;
  if (todayMsg) todayMsg.hidden = true;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ==================== BRILLOS AL ABRIR LA INVITACION ==================== */

function createSparkles() {
  const container = document.createElement("div");
  container.className = "sparkle-container";
  document.body.appendChild(container);

  const colors = ["", "gold", "white"];
  const symbols = ["✦", "✧", "✴", "✦"];

  for (let i = 0; i < 65; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";

    const color = colors[Math.floor(Math.random() * colors.length)];
    if (color) {
      sparkle.classList.add(color);
    }

    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = Math.random() * 100 + "%";
    sparkle.style.animationDelay = Math.random() * 1.2 + "s";
    sparkle.style.fontSize = (10 + Math.random() * 16) + "px";

    container.appendChild(sparkle);
  }

  setTimeout(() => {
    container.remove();
  }, 4500);
}

document.getElementById("enterBtn").addEventListener("click", () => {
  createSparkles();

  document.getElementById("inicio").nextElementSibling.scrollIntoView({
    behavior: "smooth"
  });
});


const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

music.volume = 0.01;

musicBtn.addEventListener("click", async () => {
  try {
    if (music.paused) {
      await music.play();
      musicBtn.textContent = "❚❚";
    } else {
      music.pause();
      musicBtn.textContent = "♫";
    }
  } catch (error) {
    alert("Agregá tu archivo assets/musica.mp3 para activar la música.");
  }
});



/* ==================== CARRUSEL ==================== */

const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".carousel-dot");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");

let currentSlide = 0;

function showSlide(index) {
  if (index >= slides.length) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = index;
  }

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

carouselPrev.addEventListener("click", () => {
  showSlide(currentSlide - 1);
});

carouselNext.addEventListener("click", () => {
  showSlide(currentSlide + 1);
});

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    showSlide(i);
  });
});

showSlide(0);

