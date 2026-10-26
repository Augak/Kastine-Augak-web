(() => {
  "use strict";
  const grid = document.getElementById("repo-grid");
  const status = document.getElementById("repo-status");
  const count = document.getElementById("repo-count");
  const search = document.getElementById("repo-search");
  if (!grid || !status || !count || !search) return;

  let repositories = [];
  const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = repositories.filter((repo) =>
      [repo.name, repo.description, repo.language, ...(repo.topics || [])]
        .filter(Boolean).join(" ").toLowerCase().includes(term)
    );
    count.textContent = `${filtered.length} of ${repositories.length} public repositories`;
    grid.innerHTML = "";
    if (!filtered.length) {
      status.hidden = false;
      status.textContent = term ? "No repositories match that search. Try another keyword." : "No public repositories were returned.";
      return;
    }
    status.hidden = true;
    const fragment = document.createDocumentFragment();
    filtered.forEach((repo) => {
      const article = document.createElement("article");
      article.className = "repo-card";
      const description = repo.description || "Public repository by Kastine Augak. Open the repository to explore its code and documentation.";
      const topics = (repo.topics || []).slice(0, 3).map((topic) => `<span>#${escapeText(topic)}</span>`).join("");
      const language = repo.language ? escapeText(repo.language) : "Project";
      const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined, {year:"numeric",month:"short"}) : "";
      article.innerHTML = `
        <h3>${escapeText(repo.name)}</h3>
        <p>${escapeText(description)}</p>
        <div class="repo-meta"><span>${language}</span>${updated ? `<span>Updated ${escapeText(updated)}</span>` : ""}${topics}</div>
        <a class="repo-link" href="${escapeText(repo.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeText(repo.name)} repository on GitHub">View repository ↗</a>`;
      fragment.appendChild(article);
    });
    grid.appendChild(fragment);
  }

  async function loadRepositories() {
    status.hidden = false;
    status.textContent = "Loading public repositories from GitHub…";
    try {
      const response = await fetch("https://api.github.com/users/Augak/repos?per_page=100&type=public&sort=updated", {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error("GitHub API returned " + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected GitHub response");
      repositories = data.filter((repo) => repo && repo.private === false && repo.html_url && repo.name)
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      render();
      if (!repositories.length) {
        status.hidden = false;
        status.textContent = "No public repositories were found. You can still browse the GitHub profile directly.";
      }
    } catch (error) {
      count.textContent = "Repository list unavailable";
      status.hidden = false;
      status.textContent = "GitHub could not load the live list right now. Please try again later or open the complete repository list directly on GitHub.";
      const fallback = document.createElement("a");
      fallback.href = "https://github.com/Augak?tab=repositories";
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.className = "repo-link";
      fallback.textContent = "Browse public repositories on GitHub ↗";
      status.appendChild(document.createTextNode(" "));
      status.appendChild(fallback);
    }
  }

  search.addEventListener("input", render);
  loadRepositories();
})();