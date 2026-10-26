(() => {
  "use strict";
  const grid = document.getElementById("repo-grid");
  const status = document.getElementById("repo-status");
  const count = document.getElementById("repo-count");
  const search = document.getElementById("repo-search");
  if (!grid || !status || !count || !search) return;
  let repositories = [];
  let loading = false;
  const escapeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = repositories.filter(repo => [repo.name,repo.description,repo.language,...(repo.topics||[])].filter(Boolean).join(" ").toLowerCase().includes(term));
    count.textContent = loading ? `${filtered.length} loaded · checking for more…` : `${filtered.length} of ${repositories.length} public repositories`;
    grid.replaceChildren();
    if (!filtered.length) {
      status.hidden = false;
      status.textContent = term ? "No repositories match that search. Try another keyword." : (loading ? "Loading public repositories…" : "No public repositories were returned.");
      return;
    }
    status.hidden = true;
    const fragment = document.createDocumentFragment();
    filtered.forEach(repo => {
      const article = document.createElement("article"); article.className = "repo-card reveal is-visible";
      const description = repo.description || "Public repository by Kastine Augak. Open the repository to explore its code and documentation.";
      const topics = (repo.topics || []).slice(0,4).map(topic => `<span>#${escapeText(topic)}</span>`).join("");
      const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined,{year:"numeric",month:"short"}) : "";
      article.innerHTML = `<h3>${escapeText(repo.name)}</h3><p>${escapeText(description)}</p><div class="repo-meta"><span>${escapeText(repo.language || "Project")}</span><span>★ ${Number(repo.stargazers_count)||0}</span>${updated ? `<span>Updated ${escapeText(updated)}</span>` : ""}${topics}</div><a class="repo-link" href="${escapeText(repo.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeText(repo.name)} repository on GitHub">View repository ↗</a>`;
      fragment.appendChild(article);
    });
    grid.appendChild(fragment);
  }
  async function loadRepositories() {
    if (loading) return;
    loading = true; status.hidden = false; status.textContent = "Loading every public repository from GitHub…";
    try {
      let page = 1;
      while (true) {
        const response = await fetch(`https://api.github.com/users/Augak/repos?per_page=100&page=${page}&type=public&sort=updated`, {headers:{"Accept":"application/vnd.github+json"}});
        if (!response.ok) {
          if (response.status === 403 || response.status === 429) throw new Error("GitHub rate limit reached");
          throw new Error("GitHub API returned " + response.status);
        }
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected GitHub response");
        repositories.push(...data.filter(repo => repo && repo.private === false && repo.html_url && repo.name));
        render();
        if (data.length < 100) break;
        page++;
      }
      repositories.sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0));
      render();
      if (!repositories.length) { status.hidden = false; status.textContent = "No public repositories were found. Browse the GitHub profile directly."; }
    } catch (error) {
      count.textContent = repositories.length ? `${repositories.length} repositories loaded; more could not be fetched` : "Repository list unavailable";
      status.hidden = false;
      status.textContent = repositories.length ? "GitHub limited the live request, so this list may be incomplete. You can open the full list directly." : "GitHub could not load the live list right now. Try again later or browse the full repository list directly.";
      const link = document.createElement("a"); link.href="https://github.com/Augak?tab=repositories"; link.target="_blank"; link.rel="noopener noreferrer"; link.className="repo-link"; link.textContent="Browse public repositories on GitHub ↗"; status.append(document.createTextNode(" "),link);
    } finally { loading = false; if (repositories.length) render(); }
  }
  search.addEventListener("input", render);
  loadRepositories();
})();