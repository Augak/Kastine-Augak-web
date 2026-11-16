# Kastine CMS setup

This repository now includes a Git-backed editorial workspace at `/admin/` using Sveltia CMS. The public portfolio remains public; the CMS can write only after GitHub authentication and repository permission checks.

## Architecture

- **Editor:** Sveltia CMS at `/admin/`.
- **Content source:** JSON article records in `content/posts/`.
- **Media:** small image uploads in `assets/uploads/` (committed to Git).
- **Build:** `npm run build` validates article records and creates `data/journal.json`.
- **Public reader:** `journal.html` lists articles and renders an individual article with `?slug=...`.
- **Authentication:** Sveltia's GitHub backend using Netlify as the OAuth client. No GitHub token or OAuth secret is stored in this repository.
- **Review:** Preview Workflow creates a draft pull request. Netlify can build the pull request as a Deploy Preview; publishing merges it to `main`.

## One-time Netlify and GitHub setup

1. Confirm the Netlify project `kamulindwaaugustine` is connected to `Augak/Kastine-Augak-web` and deploys the `main` branch.
2. In Netlify, enable Deploy Previews for pull requests. Preview links require successful deploy-preview builds.
3. In GitHub, register an OAuth application. Use the site URL as the homepage and set the callback URL to `https://api.netlify.com/auth/done`.
4. Copy the OAuth Client ID and generate a Client Secret. Keep the secret private.
5. In Netlify, open **Project configuration → Security → OAuth → Authentication Providers**, install the GitHub provider, and enter the Client ID and Client Secret. Do not add either secret to `admin/config.yml`, JavaScript, or Git.
6. Ensure the GitHub account used to sign in has **Write** access to this repository. Invite only trusted editors; they also need repository write permission.
7. After a successful Netlify deploy, open `https://kamulindwaaugustine.netlify.app/admin/` and sign in with GitHub.

Sveltia's GitHub backend uses Netlify's OAuth client by default when `base_url` is omitted. This configuration deliberately does **not** use Git Gateway. Netlify currently marks Git Gateway as deprecated for new setups; direct GitHub backend authentication avoids that dependency.

## Publishing workflow

1. Create or edit an article in **Journal**.
2. Save it. Sveltia creates a draft pull request rather than publishing directly to production.
3. Wait for the Netlify Deploy Preview to finish, then open the preview link from the article editor.
4. Check mobile layout, spelling, image alt text, links and metadata.
5. Use **Publish** in the CMS to merge the pull request. Netlify then builds the production site from `main`.

The `preview_path` points to `/journal.html?slug={{slug}}`, so the CMS can link to the matching article in the deploy preview.

## Content and media limits

- The first iteration manages journal articles. Existing hand-authored portfolio pages are not yet editable in the CMS.
- Uploaded images are stored in Git at `assets/uploads/`. Keep them compressed and reasonably small. Sveltia's GitHub backend does not support Git LFS; large video/audio files should use an external media host or object storage in a later phase.
- Do not upload private drafts, confidential client information, personal documents or credentials. This repository is public, so its contents and draft pull requests are publicly readable even though the CMS editor requires GitHub write access.
- The `/admin/` page is marked `noindex`; this is not an access-control boundary. Actual write access is enforced by GitHub OAuth and repository permissions.
- Do not place API tokens or OAuth secrets in this repository.

## Local checks

Requires Node.js 20 or newer.

```bash
npm test
npm run build
python3 -m http.server 8000
```

Open `http://localhost:8000/journal.html?demo=1` for the clearly labelled sample preview. To use the actual CMS locally, follow Sveltia's local development workflow and select the repository directory; remote authentication is not required for local-only editing.

## Deployment status

The Netlify project exists, but its recent deployments were skipped because the account exceeded its credit usage. The code can be tested locally and in GitHub Actions, but the CMS route and Deploy Preview workflow are not live until Netlify can complete a deployment and the OAuth provider is configured.
