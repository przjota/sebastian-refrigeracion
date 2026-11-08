
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

// MENÚ DE NAVEGACIÓN
if (menuButton && navLinks) {
  function closeMenu() {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  }

  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      navLinks.classList.contains("open") &&
      !navLinks.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// AÑO AUTOMÁTICO
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// MENSAJE GENERAL PARA LOS BOTONES NORMALES DE WHATSAPP
(() => {
  const phone = "543624175071";

  const genericMessage =
    "Hola, me comunico desde la página web de Sebastián Refrigeración porque estoy interesado/a en consultar por un servicio de refrigeración. ¡Gracias!";

  const whatsappURL =
    `https://wa.me/${phone}?text=${encodeURIComponent(genericMessage)}`;

  // Actualizar todos los enlaces normales de WhatsApp.
  // No modifica el enlace generado por Polar.
  document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
    if (!link.classList.contains("chat-done-link")) {
      link.href = whatsappURL;
    }
  });
})();

// ASISTENTE VIRTUAL POLAR
(() => {
  const panel = document.querySelector("#chat-panel");
  const launcher = document.querySelector(".chat-launcher");
  const messages = document.querySelector("#chat-messages");
  const options = document.querySelector("#chat-options");
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");

  if (!panel || !launcher || !messages || !options || !form || !input) {
    return;
  }

  const phone = "543624175071";

  const data = {
    nombre: "",
    servicio: "",
    equipo: "",
    problema: "",
    detalle: "",
    telefono: ""
  };

  const steps = [
    {
      key: "nombre",
      question: "",
      placeholder: "Nombre y apellido completos",
      type: "text"
    },
    {
      key: "servicio",
      question: "Gracias. ¿Qué servicio necesitás?",
      choices: [
        "Instalación",
        "Limpieza",
        "Reparación",
        "Mantenimiento",
        "Otra consulta"
      ]
    },
    {
      key: "equipo",
      question: "¿Qué tipo de equipo tenés?",
      choices: [
        "Aire acondicionado split",
        "Aire de ventana",
        "Otro / No sé"
      ]
    },
    {
      key: "problema",
      question: "¿Qué inconveniente presenta?",
      choices: [
        "No enfría",
        "No enciende",
        "Pierde agua",
        "Hace ruidos",
        "Se apaga",
        "Otro / Quiero instalación"
      ]
    },
    {
      key: "detalle",
      question: "Contame brevemente algún detalle más que nos ayude a entender el trabajo.",
      placeholder: "Escribí los detalles…",
      type: "text"
    },
    {
      key: "telefono",
      question: "Por último, ¿a qué número podemos contactarte? Incluí característica si es posible.",
      placeholder: "Tu teléfono",
      type: "tel"
    }
  ];

  let stepIndex = 0;
  let completed = false;
  let footerVisible = false;

  // AGREGAR MENSAJES
  function addMessage(text, who = "bot") {
    if (!text) return;

    const el = document.createElement("div");

    el.className =
      `chat-message ${who === "user" ? "user-message" : "bot-message"}`;

    el.textContent = text;
    messages.appendChild(el);

    messages.scrollTop = messages.scrollHeight;
  }

  // ESTADO DEL BOTÓN FLOTANTE
  function updateLauncher() {
    const chatOpen = panel.classList.contains("is-open");

    launcher.classList.toggle(
      "is-hidden",
      footerVisible || chatOpen
    );
  }

  // ABRIR CHAT
  function openChat() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");

    updateLauncher();

    setTimeout(() => {
      if (!input.disabled) input.focus();
    }, 200);
  }

  // CERRAR CHAT
  function closeChat() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");

    updateLauncher();
  }

  // EVENTOS DE APERTURA Y CIERRE
  document.querySelectorAll("[data-open-chat]").forEach((button) => {
    button.addEventListener("click", openChat);
  });

  document.querySelectorAll("[data-close-chat]").forEach((button) => {
    button.addEventListener("click", closeChat);
  });

  // CERRAR CON ESCAPE
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      closeChat();
    }
  });

  // MOSTRAR PREGUNTA Y OPCIONES
  function renderStep() {
    const step = steps[stepIndex];

    if (!step) return;

    addMessage(step.question);

    options.replaceChildren();

    input.disabled = false;
    input.type = step.type || "text";
    input.placeholder = step.placeholder || "Elegí una opción…";
    input.value = "";

    if (step.choices) {
      step.choices.forEach((choice) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "chat-option";
        button.textContent = choice;

        button.addEventListener("click", () => {
          acceptAnswer(choice);
        });

        options.appendChild(button);
      });
    }

    input.focus();
  }

  // PROCESAR RESPUESTA
  function acceptAnswer(answer) {
    if (completed || stepIndex >= steps.length) return;

    const clean = answer.trim().replace(/\s+/g, " ");

    if (!clean) return;

    const step = steps[stepIndex];

    // VALIDACIÓN DEL NOMBRE COMPLETO
    if (step.key === "nombre") {
      const parts = clean.split(" ").filter(Boolean);

      if (parts.length < 2) {
        addMessage(
          "Para continuar, necesitamos tu nombre y apellido completos. Por ejemplo: Juan Pérez."
        );

        input.value = "";
        input.placeholder = "Escribí tu nombre y apellido completos";
        input.focus();

        return;
      }
    }

    data[step.key] = clean;

    addMessage(clean, "user");

    options.replaceChildren();

    stepIndex++;

    if (stepIndex < steps.length) {
      renderStep();
    } else {
      finishChat();
    }
  }

  // FINALIZAR CONVERSACIÓN
  function finishChat() {
    completed = true;

    input.disabled = true;
    input.placeholder = "Consulta completada";

    const submitButton = form.querySelector("button");

    if (submitButton) submitButton.disabled = true;

    addMessage(
      `¡Listo, ${data.nombre}! Ya completaste tu consulta. Revisá el resumen y, si está todo correcto, tocá el botón para abrir WhatsApp y enviárselo al técnico.`
    );

    // RESUMEN VISIBLE EN POLAR
    const summary = document.createElement("div");
    summary.className = "chat-summary";

    const summaryTitle = document.createElement("strong");
    summaryTitle.textContent = "Resumen de tu consulta";

    summary.appendChild(summaryTitle);

    const fields = [
      ["Nombre", data.nombre],
      ["Servicio", data.servicio],
      ["Equipo", data.equipo],
      ["Problema / motivo", data.problema],
      ["Detalles", data.detalle || "Sin detalles adicionales"],
      ["Teléfono", data.telefono]
    ];

    fields.forEach(([label, value]) => {
      const line = document.createElement("p");

      const strong = document.createElement("b");
      strong.textContent = `${label}: `;

      line.append(strong, document.createTextNode(value));

      summary.appendChild(line);
    });

    messages.appendChild(summary);

    // MENSAJE PARA WHATSAPP DE POLAR
    // Solamente se envían los cuatro datos principales.
    // No se envía el historial, los detalles adicionales ni el teléfono.
    const text = [
      "Hola, Sebastián Refrigeración. Les envío una consulta desde el asistente virtual Polar:",
      "",
      `Nombre completo: ${data.nombre}`,
      `Servicio solicitado: ${data.servicio}`,
      `Tipo de equipo: ${data.equipo}`,
      `Problema / motivo: ${data.problema}`,
      "",
      "Enviado mediante el asistente virtual Polar."
    ].join("\n");

    const link = document.createElement("a");

    link.className = "chat-done-link";
    link.href =
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Enviar consulta por WhatsApp ↗";

    messages.appendChild(link);

    const note = document.createElement("p");

    note.className = "chat-send-note";
    note.textContent =
      "Se abrirá WhatsApp con los datos de tu consulta. Para completar el envío, solo tenés que presionar Enviar.";

    messages.appendChild(note);

    messages.scrollTop = messages.scrollHeight;
  }

  // ENVIAR RESPUESTA ESCRITA
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (completed) return;

    acceptAnswer(input.value);
  });

  // OCULTAR BURBUJA CUANDO EL USUARIO LLEGA AL FOOTER
  const footer = document.querySelector("#contacto");

  if (footer && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        footerVisible = entries.some(
          (entry) => entry.isIntersecting
        );

        updateLauncher();
      },
      { threshold: 0.08 }
    );

    observer.observe(footer);
  }

  updateLauncher();
})();
