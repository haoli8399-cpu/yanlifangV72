#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const info = [];

const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const versions = readJson('versions.json');

const requiredFiles = [
  versions.product.current_entry,
  versions.product.spec_file,
  versions.design.file,
  versions.architecture.as_built_file,
  ...versions.product.previous_specs,
  ...versions.architecture.evolution_documents,
  ...Object.values(versions.code_release.components).map((item) => item.version_source),
];

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) errors.push(`versions.json 引用不存在：${path}`);
}

for (const [name, component] of Object.entries(versions.code_release.components)) {
  const manifest = readJson(component.version_source);
  if (manifest.version !== component.version) {
    errors.push(`${name} 版本不一致：versions.json=${component.version}，${component.version_source}=${manifest.version ?? 'missing'}`);
  }
}

const currentPrd = readFileSync(join(root, versions.product.current_entry), 'utf8');
if (!currentPrd.includes(versions.product.spec_file.split('/').pop())) {
  errors.push(`当前 PRD 入口没有指向 ${versions.product.spec_file}`);
}

const gitFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { cwd: root, encoding: 'utf8' },
).split(/\r?\n/).filter(Boolean);

const forbiddenSegments = new Set(['node_modules', 'dist', '.output', 'coverage', '.cache']);
for (const path of gitFiles) {
  const parts = path.split('/');
  if (parts.some((part) => forbiddenSegments.has(part))) {
    errors.push(`禁止纳入版本管理的生成物：${path}`);
  }
  if (parts.at(-1) === '.DS_Store') errors.push(`禁止纳入版本管理的系统文件：${path}`);
}

const markdownFiles = gitFiles.filter((path) => path.endsWith('.md'));
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const referencedMarkdown = new Set(['docs/README.md']);

for (const markdownPath of markdownFiles) {
  const absoluteMarkdown = join(root, markdownPath);
  if (!existsSync(absoluteMarkdown)) continue;
  const content = readFileSync(absoluteMarkdown, 'utf8');
  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (!target || target.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(target)) continue;
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    try { target = decodeURIComponent(target); } catch { /* keep original */ }
    const resolved = isAbsolute(target)
      ? join(root, target.replace(/^\/+/, ''))
      : normalize(join(root, dirname(markdownPath), target));
    if (!existsSync(resolved)) {
      errors.push(`${markdownPath} 链接不存在：${match[1]}`);
    } else if (resolved.endsWith('.md')) {
      referencedMarkdown.add(relative(root, resolved).replaceAll('\\', '/'));
    }
  }
}

for (const path of markdownFiles.filter((item) => item.startsWith('docs/'))) {
  if (!referencedMarkdown.has(path)) errors.push(`孤立文档，未被任何 Markdown 索引引用：${path}`);
}

info.push(`版本清单引用：${requiredFiles.length} 项`);
info.push(`组件包版本：${Object.keys(versions.code_release.components).length} 项`);
info.push(`Markdown 文件：${markdownFiles.length} 个`);

if (errors.length) {
  console.error('治理检查失败：');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('治理检查通过：');
for (const line of info) console.log(`- ${line}`);
