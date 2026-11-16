import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_POSTS_DIR = path.join(ROOT, 'content', 'posts');
const DEFAULT_OUTPUT_FILE = path.join(ROOT, 'data', 'journal.json');

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function safeLink(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function renderInlineMarkdown(source = '') {
  const links = [];
  const withLinkTokens = String(source).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, rawUrl) => {
    const href = safeLink(rawUrl);
    links.push(href
      ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      : escapeHtml(label));
    return `\u0000${links.length - 1}\u0000`;
  });
  let html = escapeHtml(withLinkTokens);
  html = html
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
  return html.replace(/\u0000(\d+)\u0000/g, (_match, index) => links[Number(index)] ?? '');
}

export function renderMarkdown(source = '') {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let paragraph = [];
  let listType = null;
  let codeLines = null;
  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) { output.push(`</${listType}>`); listType = null; }
  };
  for (const line of lines) {
    if (codeLines) {
      if (/^\s*```\s*$/.test(line)) {
        output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = null;
      } else codeLines.push(line);
      continue;
    }
    if (/^\s*```/.test(line)) { flushParagraph(); closeList(); codeLines = []; continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); output.push(`<h2>${renderInlineMarkdown(heading[1])}</h2>`); continue; }
    if (/^\s*(---|\*\s*\*\s*\*)\s*$/.test(line)) { flushParagraph(); closeList(); output.push('<hr>'); continue; }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) { flushParagraph(); closeList(); output.push(`<blockquote><p>${renderInlineMarkdown(quote[1])}</p></blockquote>`); continue; }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType !== nextType) { closeList(); output.push(`<${nextType}>`); listType = nextType; }
      output.push(`<li>${renderInlineMarkdown((unordered ?? ordered)[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  if (codeLines) output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  return output.join('\n');
}

function requiredText(value, field, slug) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${slug}: "${field}" is required.`);
  return value.trim();
}

function safeImagePath(value, slug) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') throw new Error(`${slug}: image must be a local upload path.`);
  const normalized = value.replaceAll('\\\\', '/');
  if (!/^\/?assets\/uploads\/[a-zA-Z0-9._/-]+$/.test(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`${slug}: image must be inside assets/uploads/.`);
  }
  return `/${normalized.replace(/^\/+/, '')}`;
}

export function validatePost(input, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid post filename "${slug}". Use lowercase words separated by hyphens.`);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`${slug}: post data must be a JSON object.`);
  const title = requiredText(input.title, 'title', slug);
  const dateText = requiredText(input.date, 'date', slug);
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) throw new Error(`${slug}: date must be a valid date.`);
  const excerpt = requiredText(input.excerpt, 'excerpt', slug);
  const category = requiredText(input.category, 'category', slug);
  const body = requiredText(input.body, 'body', slug);
  const tags = input.tags == null ? [] : input.tags;
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) throw new Error(`${slug}: tags must be a list of text values.`);
  return {
    slug, title, date: date.toISOString(), excerpt, category,
    image: safeImagePath(input.image, slug),
    imageAlt: typeof input.image_alt === 'string' ? input.image_alt.trim() : '',
    tags: tags.map(tag => tag.trim()).filter(Boolean),
    bodyHtml: renderMarkdown(body)
  };
}

export async function buildContent({ postsDir = DEFAULT_POSTS_DIR, outputFile = DEFAULT_OUTPUT_FILE, now = new Date() } = {}) {
  let files = [];
  try {
    files = (await readdir(postsDir, { withFileTypes: true }))
      .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
      .map(entry => entry.name).sort();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const posts = [];
  for (const file of files) {
    const slug = path.basename(file, '.json');
    let parsed;
    try { parsed = JSON.parse(await readFile(path.join(postsDir, file), 'utf8')); }
    catch { throw new Error(`${file}: invalid JSON.`); }
    posts.push(validatePost(parsed, slug));
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const payload = { generatedAt: now.toISOString(), posts };
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  try {
    const result = await buildContent();
    console.log(`Built journal index with ${result.posts.length} article(s).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
