import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { escapeHtml, renderInlineMarkdown, renderMarkdown, validatePost, buildContent } from '../scripts/build-content.mjs';

const validPost = (overrides = {}) => ({
  title: 'A useful field note', date: '2026-11-16T09:00:00Z',
  excerpt: 'A short summary.', category: 'About Tech',
  image: '/assets/uploads/field-note.jpg', image_alt: 'A notebook beside a phone',
  tags: ['Uganda', 'Technology'],
  body: '# A heading\n\nA paragraph with **emphasis** and [a source](https://example.com).',
  ...overrides
});

test('escapes HTML special characters', () => {
  assert.equal(escapeHtml('<script>"x" & \'y\'</script>'), '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');
});
test('renders Markdown blocks and inline formatting', () => {
  const html = renderMarkdown('# Heading\n\nA **strong** line.\n\n- One\n- Two\n\n> A note');
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>strong<\/strong>/);
  assert.match(html, /<ul>[\s\S]*<li>One<\/li>[\s\S]*<li>Two<\/li>[\s\S]*<\/ul>/);
  assert.match(html, /<blockquote><p>A note<\/p><\/blockquote>/);
});
test('does not render raw HTML as executable markup', () => {
  const html = renderMarkdown('<img src=x onerror=alert(1)>');
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img/);
});
test('allows safe links and strips javascript links', () => {
  const html = renderInlineMarkdown('[safe](https://example.com) [unsafe](javascript:alert(1))');
  assert.match(html, /href="https:\/\/example\.com\//);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /<a[^>]*>unsafe<\/a>/);
});
test('validates and normalizes a post', () => {
  const post = validatePost(validPost(), 'a-useful-field-note');
  assert.equal(post.slug, 'a-useful-field-note');
  assert.equal(post.image, '/assets/uploads/field-note.jpg');
  assert.equal(post.tags.length, 2);
  assert.match(post.bodyHtml, /<h2>A heading<\/h2>/);
});
test('rejects unsafe media paths', () => {
  assert.throws(() => validatePost(validPost({ image: 'javascript:alert(1)' }), 'bad-image'), /assets\/uploads/);
  assert.throws(() => validatePost(validPost({ image: '/assets/uploads/../private.jpg' }), 'bad-image'), /assets\/uploads/);
});
test('rejects invalid slugs and missing required fields', () => {
  assert.throws(() => validatePost(validPost(), '../escape'), /Invalid post filename/);
  assert.throws(() => validatePost(validPost({ title: '' }), 'missing-title'), /title.*required/);
  assert.throws(() => validatePost(validPost({ date: 'not-a-date' }), 'bad-date'), /valid date/);
});
test('builds a deterministic newest-first journal index', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'kastine-cms-'));
  const postsDir = path.join(temp, 'posts');
  const outputFile = path.join(temp, 'data', 'journal.json');
  await mkdir(postsDir, { recursive: true });
  await writeFile(path.join(postsDir, 'older-note.json'), JSON.stringify(validPost({ title: 'Older', date: '2026-10-01T10:00:00Z' })));
  await writeFile(path.join(postsDir, 'newer-note.json'), JSON.stringify(validPost({ title: 'Newer', date: '2026-11-15T10:00:00Z' })));
  try {
    const result = await buildContent({ postsDir, outputFile, now: new Date('2026-11-16T00:00:00Z') });
    assert.deepEqual(result.posts.map(post => post.slug), ['newer-note', 'older-note']);
    const written = JSON.parse(await readFile(outputFile, 'utf8'));
    assert.equal(written.posts.length, 2);
    assert.equal(written.posts[0].title, 'Newer');
  } finally { await rm(temp, { recursive: true, force: true }); }
});
test('fails the build when a content file is malformed', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'kastine-cms-invalid-'));
  const postsDir = path.join(temp, 'posts');
  await mkdir(postsDir, { recursive: true });
  await writeFile(path.join(postsDir, 'broken.json'), '{bad json');
  try {
    await assert.rejects(buildContent({ postsDir, outputFile: path.join(temp, 'journal.json') }), /invalid JSON/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
