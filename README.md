# Kastine Augak Portfolio

A static, mobile-first portfolio website for GitHub Pages and Netlify.

## Publish with GitHub Pages

1. Open **Settings** in this repository: https://github.com/Augak/Kastine-Augak-web/settings/pages
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/(root)**, then press **Save**.
4. Wait for the Pages deployment to complete. GitHub will show the published URL in the Pages settings.

Expected project-site URL: https://augak.github.io/Kastine-Augak-web/

If the account uses a different GitHub Pages domain or username, use the URL displayed by GitHub in Settings → Pages.

## Project notes

- `.nojekyll` is included for static asset compatibility.
- Keep page links, CSS, JavaScript and image paths relative so they work from the repository subpath.
- The public repository directory on `projects.html` fetches public repositories from the GitHub API. If the API is temporarily unavailable, visitors can still use the direct GitHub link.
- The web manifest uses a relative start URL so it can open correctly under a project-site path.
- Place the portrait at `assets/images/kastine-augak.jpg`. Optional gallery files may be named `kastine-augak-2.jpg` through `kastine-augak-6.jpg`.
- The contact form currently uses Netlify Forms. That service-specific form will not automatically submit on GitHub Pages; use a third-party form endpoint or a mail link for GitHub Pages hosting.
- The existing canonical URLs and some SEO metadata still reference the Netlify domain. Update canonical tags, sitemap and robots.txt if GitHub Pages is intended to be the primary domain.

## Netlify

The site can also be deployed on Netlify. For Netlify Forms to work, deploy to Netlify and check the Forms dashboard.

## Kastine CMS and Journal

The Netlify build now generates the public journal index from JSON articles in `content/posts/`. The editorial workspace is served at `/admin/` and uses Sveltia CMS with the GitHub backend. Saving an article opens a draft pull request; Netlify Deploy Previews provide a review link, and publishing merges the article to `main`.

- CMS setup and OAuth instructions: [docs/CMS_SETUP.md](docs/CMS_SETUP.md)
- Public journal: [journal.html](journal.html)
- Run local tests: `npm test`
- Build journal data: `npm run build`

The CMS requires GitHub write access. The OAuth client secret belongs in the Netlify dashboard, never in Git. See the setup guide before enabling editors. GitHub Pages branch publishing does not run the Netlify build command; use Netlify for the CMS publishing workflow.
