
document.addEventListener("DOMContentLoaded", async () => {
    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const toast = $("#toast");

    let projects = [];
    let filter = "all";
    let query = "";

    // ==============================
    // NOTIFICATIONS
    // ==============================

    function notify(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }

    // ==============================
    // SECURITY
    // ==============================

    function safe(value = "") {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function icon(name) {
        return `<i data-lucide="${safe(name)}"></i>`;
    }

    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // ==============================
    // PROFILE LINKS
    // ==============================

    function updateProfileLinks(profile = {}) {

        // Telegram
        if (profile.telegram) {
            const username = String(profile.telegram)
                .trim()
                .replace(/^@/, "")
                .replace(/^https?:\/\/t\.me\//, "")
                .replace(/\/$/, "");

            if (username) {
                const telegramURL =
                    `https://t.me/${encodeURIComponent(username)}`;

                $$('a[href*="t.me/"], a[data-social="telegram"]').forEach(link => {
                    link.href = telegramURL;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                });
            }
        }

        // GitHub
        if (profile.github) {
            const username = String(profile.github)
                .trim()
                .replace(/^@/, "")
                .replace(/^https?:\/\/github\.com\//, "")
                .replace(/\/$/, "");

            if (username) {
                const githubURL =
                    `https://github.com/${encodeURIComponent(username)}`;

                $$('a[href*="github.com/"], a[data-social="github"]').forEach(link => {
                    link.href = githubURL;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                });
            }
        }

        // Email
        if (profile.email) {
            const email = String(profile.email).trim();

            $$('a[href^="mailto:"], a[data-social="email"]').forEach(link => {
                link.href = `mailto:${encodeURIComponent(email)}`;

                const span = $("span", link);

                if (span) {
                    span.innerHTML =
                        `<small>EMAIL</small>${safe(email)}`;
                }
            });
        }

        // Bio
        if (profile.bio) {
            $$("[data-profile='bio']").forEach(element => {
                element.textContent = profile.bio;
            });
        }
    }

    // ==============================
    // PROJECT CARD
    // ==============================

    function projectCard(project) {

        const categories = {
            frontend: "Frontend",
            backend: "Backend",
            bot: "Telegram Bot",
            game: "Game"
        };

        const category =
            categories[project.category] || project.category;

        const tech = Array.isArray(project.tech)
            ? project.tech
            : String(project.tech || "")
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

        return `
        <article class="project-card">

            <div class="project-art">

                ${project.image
                    ? `<img
                        src="${safe(project.image)}"
                        alt="${safe(project.title)}"
                        loading="lazy"
                        onerror="this.remove()"
                    >`
                    : `<div class="project-art-icon">
                        ${safe(project.title.slice(0, 2).toUpperCase())}
                    </div>`
                }

            </div>

            <div class="project-body">

                <div class="project-meta">

                    <span class="category-pill">
                        ${safe(category)}
                    </span>

                    ${project.featured
                        ? `<span class="category-pill">FEATURED</span>`
                        : ""
                    }

                </div>

                <h3>${safe(project.title)}</h3>

                <p>${safe(project.description)}</p>

                <div class="tech-list">

                    ${tech.slice(0, 4).map(item =>
                        `<span>${safe(item)}</span>`
                    ).join("")}

                </div>

                <div class="project-links">

                    ${project.github_url
                        ? `<a href="${safe(project.github_url)}"
                            target="_blank"
                            rel="noopener noreferrer">
                            ${icon("github")} Source
                           </a>`
                        : ""
                    }

                    ${project.demo_url
                        ? `<a href="${safe(project.demo_url)}"
                            target="_blank"
                            rel="noopener noreferrer">
                            ${icon("external-link")}
                            ${project.category === "bot"
                                ? "Open bot"
                                : "Live demo"}
                           </a>`
                        : ""
                    }

                </div>

            </div>

        </article>`;
    }

    // ==============================
    // RENDER PROJECTS
    // ==============================

    function renderProjects() {

        const grid = $("#projectGrid");

        if (!grid) return;

        const shown = projects.filter(project => {

            const text = [
                project.title,
                project.description,
                ...(Array.isArray(project.tech)
                    ? project.tech
                    : String(project.tech || "").split(","))
            ].join(" ").toLowerCase();

            return (
                project.published !== false &&
                project.category !== "bot" &&
                (filter === "all" || project.category === filter) &&
                text.includes(query)
            );
        });

        grid.innerHTML = shown.length
            ? shown.map(projectCard).join("")
            : `<div class="loading-state">
                Loyiha topilmadi.
               </div>`;

        $("#projectEmpty")?.classList.toggle(
            "hidden",
            shown.length > 0
        );

        refreshIcons();
    }

    // ==============================
    // RENDER TELEGRAM BOTS
    // ==============================

    function renderBots() {

        const grid = $("#botGrid");

        if (!grid) return;

        const bots = projects.filter(project =>
            project.published !== false &&
            project.category === "bot"
        );

        grid.innerHTML = bots.length
            ? bots.map(project => `

                <article class="bot-card">

                    <div class="bot-icon">
                        ${icon("bot")}
                    </div>

                    <div>

                        <h3>${safe(project.title)}</h3>

                        <p>${safe(project.description)}</p>

                        ${project.demo_url
                            ? `<a href="${safe(project.demo_url)}"
                                target="_blank"
                                rel="noopener noreferrer">
                                Botni ochish ↗
                               </a>`
                            : project.github_url
                                ? `<a href="${safe(project.github_url)}"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    GitHub ↗
                                   </a>`
                                : ""
                        }

                    </div>

                </article>

            `).join("")
            : `<p class="muted">
                Hozircha botlar mavjud emas.
               </p>`;

        refreshIcons();
    }

    // ==============================
    // LANGUAGE
    // ==============================

    function setLanguage(language) {

        const dictionary =
            TRANSLATIONS[language] || TRANSLATIONS.uz;

        document.documentElement.lang = language;

        $$("[data-i18n]").forEach(element => {

            const value = dictionary[element.dataset.i18n];

            if (value) {
                element.textContent = value;
            }
        });

        $$("[data-i18n-placeholder]").forEach(element => {

            const value =
                dictionary[element.dataset.i18nPlaceholder];

            if (value) {
                element.placeholder = value;
            }
        });

        localStorage.setItem("ogabek_lang", language);
    }

    const languageSelect = $("#languageSelect");

    if (languageSelect) {

        languageSelect.value =
            localStorage.getItem("ogabek_lang") || "uz";

        setLanguage(languageSelect.value);

        languageSelect.addEventListener("change", event => {
            setLanguage(event.target.value);
        });
    }

    // ==============================
    // DARK / LIGHT MODE
    // ==============================

    function setTheme(theme) {

        document.documentElement.dataset.theme = theme;

        localStorage.setItem("ogabek_theme", theme);
    }

    setTheme(
        localStorage.getItem("ogabek_theme") || "dark"
    );

    $("#themeToggle")?.addEventListener("click", () => {

        const current =
            document.documentElement.dataset.theme;

        setTheme(current === "dark" ? "light" : "dark");
    });

    // ==============================
    // MOBILE MENU
    // ==============================

    $("#menuToggle")?.addEventListener("click", () => {
        $("#mainNav")?.classList.toggle("open");
    });

    $$(".main-nav a").forEach(link => {
        link.addEventListener("click", () => {
            $("#mainNav")?.classList.remove("open");
        });
    });

    // ==============================
    // PROJECT FILTER
    // ==============================

    $("#projectFilters")?.addEventListener("click", event => {

        const button = event.target.closest("[data-filter]");

        if (!button) return;

        filter = button.dataset.filter;

        $$(".filter-btn").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderProjects();
    });

    // ==============================
    // PROJECT SEARCH
    // ==============================

    $("#projectSearch")?.addEventListener("input", event => {

        query = event.target.value.toLowerCase().trim();

        renderProjects();
    });

    // ==============================
    // CONTACT FORM
    // ==============================

    $("#feedbackForm")?.addEventListener("submit", async event => {

        event.preventDefault();

        const form = event.currentTarget;

        const button = form.querySelector(
            'button[type="submit"]'
        );

        const status = $("#formStatus");

        button.disabled = true;

        if (status) {
            status.textContent = "Yuborilmoqda...";
        }

        const formData = new FormData(form);

        try {

            await Store.sendFeedback({

                name: String(formData.get("name") || "").trim(),

                email: String(formData.get("email") || "").trim(),

                message: String(formData.get("message") || "").trim()

            });

            form.reset();

            if (status) {
                status.textContent =
                    "Xabaringiz yuborildi. Rahmat!";
            }

            notify("Xabar muvaffaqiyatli yuborildi.");

        } catch (error) {

            if (status) {
                status.textContent =
                    "Xatolik: " +
                    (error.message || "Qayta urinib ko‘ring.");
            }

        } finally {

            button.disabled = false;
        }
    });

    // ==============================
    // LOAD DATA
    // ==============================

    try {

        projects = await Store.getProjects();

        renderProjects();

        renderBots();

        if ($("#statProjects")) {
            $("#statProjects").textContent =
                projects.length;
        }

        if ($("#statBots")) {
            $("#statBots").textContent =
                projects.filter(project =>
                    project.category === "bot"
                ).length;
        }

        // Profile
        const profile = await Store.getProfile();

        updateProfileLinks(profile);

    } catch (error) {

        const grid = $("#projectGrid");

        if (grid) {
            grid.innerHTML = `
                <div class="loading-state">
                    Ma’lumotlarni yuklashda xatolik:
                    ${safe(error.message)}
                </div>`;
        }
    }

    // ==============================
    // FOOTER YEAR
    // ==============================

    if ($("#year")) {
        $("#year").textContent =
            new Date().getFullYear();
    }

    refreshIcons();

});
