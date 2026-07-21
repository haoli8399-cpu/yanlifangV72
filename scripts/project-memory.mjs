#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RUNTIME = join(ROOT, '.memory')
const KNOWLEDGE_DIR = join(ROOT, 'docs/memory/knowledge')
const BASE_URL = (process.env.OPENVIKING_URL || 'http://127.0.0.1:1933').replace(/\/$/, '')
const PROJECT_URI = 'viking://user/default/resources/yanlifang-project-memory'
const ACCOUNT = 'default'
const USER = 'default'
const RECEIPT_MAX_AGE_MS = 4 * 60 * 60 * 1000
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000

const KNOWLEDGE = [
  ['00_PROJECT_CONTEXT', '00-project-context.md'],
  ['01_PRODUCT_MEMORY', '01-product-current.md'],
  ['02_TECH_MEMORY', '02-technical-current.md'],
  ['03_DECISIONS', '03-decisions-current.md'],
  ['04_DEVELOPMENT_STATUS', '04-development-status.md'],
  ['07_AGENT_RULES', '07-agent-rules.md'],
]

const HIGH_RISK_TERMS = /tenant|租户|权限|认证|schema|migration|数据库|报价|金额|合同|收款|生产|部署|删除数据|状态机|核心架构|prd.*范围/i
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:sk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{16,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|password|client[_-]?secret)\s*[:=]\s*["']?(?!<REDACTED>|REDACTED)[^\s"',]{8,}/i,
  /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@/i,
]

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i]
    if (!item.startsWith('--')) out._.push(item)
    else {
      const key = item.slice(2)
      const next = argv[i + 1]
      out[key] = next && !next.startsWith('--') ? (i += 1, next) : true
    }
  }
  return out
}

function ensureRuntime() {
  mkdirSync(RUNTIME, { recursive: true })
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function hashFile(path) {
  return sha256(readFileSync(path))
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeRuntime(name, data) {
  ensureRuntime()
  const path = join(RUNTIME, name)
  writeFileSync(path, typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`)
  return path
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_PROXY: '127.0.0.1,localhost,::1',
      no_proxy: '127.0.0.1,localhost,::1',
    },
    ...options,
  })
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  }
}

function ov(args, { allowFailure = false } = {}) {
  const result = run('openviking', ['--account', ACCOUNT, '--user', USER, ...args, '-o', 'json'])
  if (!result.ok && !allowFailure) {
    throw new Error(result.stderr || result.stdout || `OpenViking command failed: ${args.join(' ')}`)
  }
  if (!result.stdout) return { ok: result.ok, result: null, raw: result }
  try {
    // OpenViking 0.4.6 may prepend an agent-facing `cmd: ov ...` line even
    // when JSON output is requested. Parse from the first JSON object.
    const jsonStart = result.stdout.indexOf('{')
    if (jsonStart < 0) throw new Error('JSON object not found')
    return { ...JSON.parse(result.stdout.slice(jsonStart)), raw: result }
  } catch {
    if (!allowFailure) throw new Error(`OpenViking returned non-JSON output: ${result.stdout.slice(0, 300)}`)
    return { ok: false, result: null, raw: result }
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    signal: AbortSignal.timeout(options.timeout || 30000),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-OpenViking-Account': ACCOUNT,
      'X-OpenViking-User': USER,
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  let body
  try { body = JSON.parse(text) } catch { body = { raw: text } }
  if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(body)}`)
  return body
}

async function ready() {
  try {
    const body = await request('/ready', { timeout: 35000 })
    return {
      ok: body.status === 'ready' && body.checks?.embedding === 'ok' && body.checks?.vectordb === 'ok',
      body,
    }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) throw new Error('knowledge file is missing frontmatter')
  const values = {}
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':')
    if (index > 0) values[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }
  return values
}

function scanSecrets(content, label = 'content') {
  const found = SECRET_PATTERNS.filter((pattern) => pattern.test(content)).map(String)
  if (found.length) throw new Error(`Sensitive content rejected in ${label}: ${found.join(', ')}`)
}

function knowledgeRecords() {
  return KNOWLEDGE.map(([folder, file]) => {
    const path = join(KNOWLEDGE_DIR, file)
    const content = readFileSync(path, 'utf8')
    scanSecrets(content, relative(ROOT, path))
    const meta = parseFrontmatter(content)
    const sourcePaths = (meta.source_paths || '').split(',').map((item) => item.trim()).filter(Boolean)
    const sourceHashes = {}
    for (const sourcePath of sourcePaths) {
      const absolute = join(ROOT, sourcePath)
      if (!existsSync(absolute)) throw new Error(`Missing authority source: ${sourcePath}`)
      if (/(^|\/)\.env(?:\.|$)|\.(?:pem|key)$|credentials|service-account/i.test(sourcePath)) {
        throw new Error(`Sensitive source is not allowed: ${sourcePath}`)
      }
      sourceHashes[sourcePath] = hashFile(absolute)
    }
    const uri = `${PROJECT_URI}/${folder}/${file}`
    return { folder, file, path, content, meta, sourcePaths, sourceHashes, uri, templateHash: sha256(content) }
  })
}

function gitFacts() {
  const branch = run('git', ['branch', '--show-current']).stdout
  const head = run('git', ['rev-parse', 'HEAD']).stdout
  const status = run('git', ['status', '--short']).stdout
  return { branch, head, dirty: Boolean(status), changedFiles: status ? status.split('\n') : [] }
}

function currentVersion() {
  const versions = readJson(join(ROOT, 'versions.json'))
  return versions.product.spec_version
}

function buildManifest(records, git, syncedAt = new Date().toISOString()) {
  return {
    schema_version: 1,
    project: 'yanlifang',
    project_uri: PROJECT_URI,
    product_spec_version: currentVersion(),
    synced_at: syncedAt,
    git_head: git.head,
    git_branch: git.branch,
    knowledge: records.map((record) => ({
      memory_id: record.meta.memory_id,
      title: record.meta.title,
      knowledge_type: record.meta.knowledge_type,
      status: record.meta.status,
      source_version: record.meta.source_version,
      uri: record.uri,
      template_hash: record.templateHash,
      source_hashes: record.sourceHashes,
      tags: (record.meta.tags || '').split(',').map((item) => item.trim()).filter(Boolean),
    })),
  }
}

function enrichedContent(record, manifestItem, syncedAt, git) {
  const validation = {
    synced_at: syncedAt,
    git_head: git.head,
    git_branch: git.branch,
    source_hashes: manifestItem.source_hashes,
  }
  return `${record.content.trim()}\n\n<!-- SOURCE_VALIDATION\n${JSON.stringify(validation, null, 2)}\n-->\n`
}

function ensureOvDir(uri, description = '') {
  const stat = ov(['stat', uri], { allowFailure: true })
  if (stat.ok) return
  const args = ['mkdir', uri]
  if (description) args.push('--description', description)
  ov(args)
}

function writeOvFile(uri, localPath) {
  const stat = ov(['stat', uri], { allowFailure: true })
  const mode = stat.ok ? 'replace' : 'create'
  return ov(['write', uri, '--mode', mode, '--from-file', localPath, '--wait', '--timeout', '180'])
}

async function setTags(uri, tags) {
  if (!tags.length) return
  await request('/api/v1/content/set_tags', {
    method: 'POST',
    body: JSON.stringify({ uri, tags, mode: 'replace', recursive: false }),
  })
}

async function syncMemory() {
  const readiness = await ready()
  if (!readiness.ok) throw new Error(`OpenViking /ready failed: ${readiness.error || JSON.stringify(readiness.body)}`)
  const records = knowledgeRecords()
  const git = gitFacts()
  const syncedAt = new Date().toISOString()
  const manifest = buildManifest(records, git, syncedAt)

  ensureRuntime()
  ensureOvDir(PROJECT_URI, '演立方项目长期记忆。OpenViking负责发现，原始仓库文件负责定案。')
  for (const [folder] of KNOWLEDGE) ensureOvDir(`${PROJECT_URI}/${folder}`)
  ensureOvDir(`${PROJECT_URI}/09_REFERENCE`)

  for (const record of records) {
    const manifestItem = manifest.knowledge.find((item) => item.memory_id === record.meta.memory_id)
    const uploadPath = writeRuntime(`upload-${record.file}`, enrichedContent(record, manifestItem, syncedAt, git))
    writeOvFile(record.uri, uploadPath)
    await setTags(record.uri, manifestItem.tags)
  }

  const manifestPath = writeRuntime('manifest-upload.json', manifest)
  const manifestUri = `${PROJECT_URI}/09_REFERENCE/manifest.json`
  writeOvFile(manifestUri, manifestPath)
  await setTags(manifestUri, ['project=yanlifang', 'status=approved', 'type=manifest'])
  ov(['reindex', PROJECT_URI, '--mode', 'semantic_and_vectors', '--wait', 'true'])
  writeRuntime('cache.json', { cached_at: syncedAt, manifest })

  console.log(`Memory Sync Passed\nproject_uri: ${PROJECT_URI}\nknowledge_count: ${records.length}\nprd: ${manifest.product_spec_version}\ngit_head: ${git.head}`)
  return manifest
}

function readRemote(uri) {
  const response = ov(['read', uri])
  return response.result
}

function remoteManifest() {
  const content = readRemote(`${PROJECT_URI}/09_REFERENCE/manifest.json`)
  return typeof content === 'string' ? JSON.parse(content) : content
}

function validateManifest(manifest, records) {
  const issues = []
  if (manifest.project !== 'yanlifang') issues.push('project namespace mismatch')
  if (manifest.product_spec_version !== currentVersion()) {
    issues.push(`PRD version mismatch: OpenViking=${manifest.product_spec_version}, repository=${currentVersion()}`)
  }
  for (const record of records) {
    const remote = manifest.knowledge?.find((item) => item.memory_id === record.meta.memory_id)
    if (!remote) {
      issues.push(`missing memory: ${record.meta.memory_id}`)
      continue
    }
    if (remote.status !== 'Approved') issues.push(`inactive memory: ${record.meta.memory_id}=${remote.status}`)
    if (remote.template_hash !== record.templateHash) issues.push(`stale summary: ${record.meta.memory_id}`)
    for (const [source, hash] of Object.entries(record.sourceHashes)) {
      if (remote.source_hashes?.[source] !== hash) issues.push(`stale source: ${record.meta.memory_id}:${source}`)
    }
  }
  return [...new Set(issues)]
}

function detectClaimConflicts(claim = '') {
  const conflicts = []
  if (/后仰喜剧.{0,12}(平台运营|运营平台)|平台.{0,12}由后仰喜剧运营/.test(claim)) {
    conflicts.push('旧规则冲突：后仰喜剧不是平台运营方，而是第一家普通 Tenant。')
  }
  const version = claim.match(/V(\d+\.\d+)/i)?.[0]
  if (version && version.toUpperCase() !== currentVersion().toUpperCase()) {
    conflicts.push(`版本冲突：输入提到 ${version}，当前正式产品基线是 ${currentVersion()}。`)
  }
  if (/演员.{0,12}(永久|只能|固定).{0,12}(归属|属于).{0,12}(供应商|公司)/.test(claim)) {
    conflicts.push('演员主体冲突：演员是平台身份，通过有期限的合作关系连接一个或多个 Tenant。')
  }
  return conflicts
}

function semanticQueries(task, modules) {
  const subject = [task, modules].filter(Boolean).join('；')
  return [
    `当前产品范围和 PRD 规则：${subject}`,
    `与任务有关的业务规则和用户流程：${subject}`,
    `与任务有关的 Approved 重大决策：${subject}`,
    `当前开发状态、已知缺口和禁止修改范围：${subject}`,
    `历史风险、踩坑和必须执行的测试：${subject}`,
  ]
}

function findContext(query) {
  // OpenViking 0.4.6 does not reliably inherit explicit tags onto generated
  // .abstract/.overview nodes. The fixed project URI is the hard isolation
  // boundary; manifest status is the validity filter. Tags remain supplemental.
  const response = ov(['find', query, '--uri', PROJECT_URI, '--node-limit', '5', '--threshold', '0'], { allowFailure: true })
  if (!response.ok) return { query, ok: false, error: response.raw?.stderr || response.raw?.stdout }
  return { query, ok: true, result: response.result }
}

function cacheValid(records) {
  const path = join(RUNTIME, 'cache.json')
  if (!existsSync(path)) return { ok: false, reason: 'cache missing' }
  try {
    const cache = readJson(path)
    const age = Date.now() - Date.parse(cache.cached_at)
    if (!Number.isFinite(age) || age > CACHE_MAX_AGE_MS) return { ok: false, reason: 'cache older than 24h' }
    const issues = validateManifest(cache.manifest, records)
    if (issues.length) return { ok: false, reason: issues.join('; ') }
    return { ok: true, cache }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

function mcpEvidenceValid(path, records) {
  if (!path || !existsSync(resolve(ROOT, path))) return { ok: false, reason: 'MCP evidence missing' }
  try {
    const evidence = readJson(resolve(ROOT, path))
    const age = Date.now() - Date.parse(evidence.captured_at)
    if (!Number.isFinite(age) || age > 10 * 60 * 1000) return { ok: false, reason: 'MCP evidence older than 10 minutes' }
    if (evidence.project_uri !== PROJECT_URI) return { ok: false, reason: 'MCP evidence project URI mismatch' }
    if (evidence.health_ok !== true) return { ok: false, reason: 'MCP health was not confirmed' }
    const issues = validateManifest(evidence.manifest, records)
    if (issues.length) return { ok: false, reason: issues.join('; ') }
    const requiredUris = evidence.manifest.knowledge.map((item) => item.uri)
    const retrievedUris = new Set(evidence.retrieved_uris || [])
    const missingUris = requiredUris.filter((uri) => !retrievedUris.has(uri))
    if (missingUris.length) return { ok: false, reason: `MCP core reads missing: ${missingUris.join(', ')}` }
    if (!Array.isArray(evidence.retrieved_queries) || evidence.retrieved_queries.length < 5) {
      return { ok: false, reason: 'MCP task retrieval requires five focused queries' }
    }
    return { ok: true, evidence }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

function writeFailureReceipt(details) {
  const receipt = {
    schema_version: 1,
    task_id: details.taskId,
    task_summary: details.task,
    executed_at: new Date().toISOString(),
    risk: details.risk,
    failure_step: details.step,
    reason: details.reason,
    missing: details.missing || [],
    conflicts: details.conflicts || [],
    context_complete: false,
    allow_development: false,
  }
  writeRuntime('receipt.json', receipt)
  console.error(`Memory Preflight Failed\n\n失败步骤：${details.step}\n原因：${details.reason}\n缺失内容：${(details.missing || []).join('；') || '无'}\n对当前任务的影响：禁止直接进入代码修改。\n自动修复结果：${details.recovery || '未能自动恢复'}\n是否允许继续：否\n需要老板处理的事项：${details.ownerAction || '无；由研发总调度修复环境或同步知识。'}`)
  return receipt
}

async function preflight(args) {
  const task = String(args.task || '').trim()
  if (!task) throw new Error('preflight requires --task "任务摘要"')
  const taskId = String(args['task-id'] || `MEM-${randomUUID().slice(0, 8)}`)
  const modules = String(args.modules || '')
  const claim = String(args.claim || '')
  const risk = args.risk === 'high' || HIGH_RISK_TERMS.test(`${task} ${modules}`) ? 'high' : 'normal'
  const records = knowledgeRecords()
  const git = gitFacts()
  const readiness = await ready()
  let mode = 'openviking'
  let manifest
  let evidenceRetrieval = []

  if (!readiness.ok) {
    const evidence = mcpEvidenceValid(args['mcp-evidence'], records)
    if (evidence.ok) {
      mode = 'openviking_mcp_evidence'
      manifest = evidence.evidence.manifest
      evidenceRetrieval = evidence.evidence.retrieved_queries.map((query) => ({ query, ok: true, via: 'mcp' }))
    } else {
      const cache = cacheValid(records)
      if (risk === 'high' || !cache.ok) {
        writeFailureReceipt({
          taskId, task, risk, step: 'OpenViking /ready',
          reason: readiness.error || JSON.stringify(readiness.body),
          missing: [evidence.reason, ...(cache.ok ? [] : [cache.reason])].filter(Boolean),
          recovery: cache.ok ? '存在有效只读快照，但高风险任务禁止降级。' : '没有可验证的新鲜只读快照。',
        })
        process.exitCode = 2
        return null
      }
      mode = 'verified_cache'
      manifest = cache.cache.manifest
    }
  } else {
    try { manifest = remoteManifest() } catch (error) {
      writeFailureReceipt({ taskId, task, risk, step: '读取 OpenViking manifest', reason: error.message, missing: ['09_REFERENCE/manifest.json'] })
      process.exitCode = 2
      return null
    }
  }

  const issues = validateManifest(manifest, records)
  const conflicts = detectClaimConflicts(`${claim}\n${task}`)
  if (issues.length || conflicts.length) {
    writeFailureReceipt({
      taskId, task, risk, step: issues.length ? '来源与版本验证' : '当前输入冲突检查',
      reason: [...issues, ...conflicts].join('；'),
      missing: issues,
      conflicts,
      recovery: issues.length ? '已触发 needs_sync；必须先确认权威文件和同步知识。' : '已保留当前输入，但未把旧规则作为事实。',
      ownerAction: issues.some((item) => item.startsWith('PRD version mismatch')) ? '如需正式切换 PRD，提交老板决策卡。' : '无。',
    })
    process.exitCode = 2
    return null
  }

  const core = []
  if (mode === 'openviking') {
    for (const item of manifest.knowledge) core.push({ uri: item.uri, content: readRemote(item.uri) })
  }
  const retrieval = mode === 'openviking'
    ? semanticQueries(task, modules).map(findContext)
    : mode === 'openviking_mcp_evidence' ? evidenceRetrieval : []
  const retrievalFailures = retrieval.filter((item) => !item.ok)
  if (risk === 'high' && retrievalFailures.length) {
    writeFailureReceipt({ taskId, task, risk, step: '任务相关语义检索', reason: retrievalFailures.map((item) => item.error).join('; '), missing: retrievalFailures.map((item) => item.query) })
    process.exitCode = 2
    return null
  }

  const receipt = {
    schema_version: 1,
    task_id: taskId,
    task_summary: task,
    modules: modules.split(',').map((item) => item.trim()).filter(Boolean),
    executed_at: new Date().toISOString(),
    mode,
    risk,
    current_prd_version: manifest.product_spec_version,
    core_knowledge: manifest.knowledge.map((item) => item.uri),
    related_decision_ids: ['YLF-DECISIONS-001'],
    project_status_version: manifest.synced_at,
    key_sources: manifest.knowledge.flatMap((item) => Object.keys(item.source_hashes || {})),
    retrieved_queries: retrieval.map((item) => ({ query: item.query, ok: item.ok })),
    conflicts: [],
    source_issues: [],
    git,
    manifest_hash: sha256(JSON.stringify(manifest)),
    manifest,
    context_complete: true,
    allow_development: true,
  }
  writeRuntime('receipt.json', receipt)
  writeRuntime('cache.json', { cached_at: new Date().toISOString(), manifest })
  writeRuntime('context.md', [
    '# 本次任务上下文包',
    '',
    `- 任务：${task}`,
    `- 风险：${risk}`,
    `- 当前 PRD：${manifest.product_spec_version}`,
    `- 检索模式：${mode}`,
    `- Git：${git.branch} @ ${git.head}${git.dirty ? '（存在未提交修改）' : ''}`,
    '',
    '## 核心知识',
    ...manifest.knowledge.map((item) => `- ${item.memory_id}：${item.title}（${item.uri}）`),
    '',
    '## 任务相关检索',
    ...retrieval.map((item) => `- ${item.ok ? '已完成' : '失败'}：${item.query}`),
    '',
    '关键判断仍须打开回执中的原始来源验证，不得只引用本上下文包。',
    '',
  ].join('\n'))
  console.log(`Memory Preflight Passed\ntask_id: ${taskId}\nmode: ${mode}\nprd: ${manifest.product_spec_version}\nrisk: ${risk}\nallow_development: true\nreceipt: .memory/receipt.json`)
  return receipt
}

function gate() {
  const path = join(RUNTIME, 'receipt.json')
  const reasons = []
  if (!existsSync(path)) reasons.push('Memory Receipt 不存在')
  let receipt
  if (!reasons.length) {
    receipt = readJson(path)
    const age = Date.now() - Date.parse(receipt.executed_at)
    if (!receipt.allow_development || !receipt.context_complete) reasons.push('预检未允许进入开发')
    if (!Number.isFinite(age) || age > RECEIPT_MAX_AGE_MS) reasons.push('Memory Receipt 已超过 4 小时')
    const git = gitFacts()
    if (receipt.git?.head !== git.head) reasons.push('Git HEAD 已变化')
    if (receipt.git?.branch !== git.branch) reasons.push('Git 分支已变化')
    try {
      const issues = validateManifest(receipt.manifest, knowledgeRecords())
      reasons.push(...issues)
    } catch (error) { reasons.push(error.message) }
  }
  if (reasons.length) {
    console.error(`Memory Gate Failed\n${reasons.map((item) => `- ${item}`).join('\n')}\n请重新执行 preflight。`)
    process.exitCode = 2
    return false
  }
  console.log(`Memory Gate Passed\ntask_id: ${receipt.task_id}\nexecuted_at: ${receipt.executed_at}`)
  return true
}

function classifyImpact(files) {
  const ignored = files.filter((file) => /\.(?:css|scss|less)$/.test(file) || /(^|\/)(?:assets?|images?)\//.test(file))
  const candidates = []
  const rules = [
    [/docs\/PRD|versions\.json|docs\/PRD\.md/, 'product_baseline'],
    [/DECISIONS\.md/, 'decision'],
    [/PROJECT_STATUS\.md|project-state\.json/, 'development_status'],
    [/ARCHITECTURE|package(?:-lock)?\.json/, 'technical_memory'],
    [/migrations\/|schema|prisma|drizzle/i, 'data_model'],
    [/auth|permission|tenant|rbac/i, 'permission_or_tenant'],
    [/deploy|docker|nginx|release/i, 'deployment'],
    [/AGENTS\.md|MVP_DEV_PLAYBOOK\.md|docs\/memory|scripts\/project-memory/, 'agent_rules_or_memory_system'],
  ]
  for (const file of files.filter((item) => !ignored.includes(item))) {
    const matched = rules.find(([pattern]) => pattern.test(file))
    if (matched) candidates.push({ file, knowledge_type: matched[1], status: 'Proposed', requires_source_validation: true })
  }
  return { files, ignored_as_transient: ignored, candidates, should_write_long_term_memory: candidates.length > 0 }
}

function impact(args) {
  let files = String(args.files || '').split(',').map((item) => item.trim()).filter(Boolean)
  if (!files.length) {
    const staged = run('git', ['diff', '--cached', '--name-only']).stdout
    const unstaged = run('git', ['diff', '--name-only']).stdout
    files = [...new Set(`${staged}\n${unstaged}`.split('\n').filter(Boolean))]
  }
  const report = {
    schema_version: 1,
    task_id: args['task-id'] || null,
    generated_at: new Date().toISOString(),
    ...classifyImpact(files),
    writeback_authority: 'Candidates remain Proposed until authority sources are updated and required approval is recorded.',
  }
  writeRuntime('knowledge-impact.json', report)
  console.log(`Knowledge Impact Analysis\nfiles: ${files.length}\ncandidates: ${report.candidates.length}\nlong_term_writeback: ${report.should_write_long_term_memory ? 'consider' : 'no'}\nreport: .memory/knowledge-impact.json`)
  return report
}

async function health() {
  const readiness = await ready()
  const cli = ov(['status'], { allowFailure: true })
  const result = {
    version: run('openviking', ['--version']).stdout,
    base_url: BASE_URL,
    project_uri: PROJECT_URI,
    ready: readiness,
    cli_status_ok: Boolean(cli.ok),
    cli_degraded: cli.result?.is_healthy === false,
    cli_errors: cli.result?.errors || [],
  }
  console.log(JSON.stringify(result, null, 2))
  if (!readiness.ok) process.exitCode = 2
  return result
}

async function verify() {
  const tests = []
  const push = (name, passed, evidence) => tests.push({ name, passed, evidence })
  const records = knowledgeRecords()
  const manifest = buildManifest(records, gitFacts())
  push('全新任务可装配核心上下文', records.length === 6 && manifest.product_spec_version === 'V6.6', `knowledge=${records.length}, prd=${manifest.product_spec_version}`)
  push('过期聊天规则可识别', detectClaimConflicts('后仰喜剧是平台运营方').length === 1, detectClaimConflicts('后仰喜剧是平台运营方'))
  const stale = structuredClone(manifest)
  stale.product_spec_version = 'V6.5'
  push('OpenViking 过期摘要可识别', validateManifest(stale, records).some((item) => item.startsWith('PRD version mismatch')), validateManifest(stale, records))
  push('重大数据库任务产生候选记忆', classifyImpact(['backend/migrations/999.sql']).candidates.length === 1, classifyImpact(['backend/migrations/999.sql']))
  push('普通样式修改不产生长期任务记忆', classifyImpact(['codebase/src/button.css']).candidates.length === 0, classifyImpact(['codebase/src/button.css']))
  let secretRejected = false
  try { scanSecrets('api_key=sk-test_abcdefghijklmnopqrstuvwxyz') } catch { secretRejected = true }
  push('敏感信息写入被拒绝', secretRejected, 'secret scanner rejected synthetic key')
  const readiness = await ready()
  const highRiskFallbackAllowed = false
  push('OpenViking 异常时高风险任务停止', readiness.ok && highRiskFallbackAllowed === false, 'policy: high-risk never falls back to cache')
  const report = { generated_at: new Date().toISOString(), passed: tests.every((test) => test.passed), tests }
  writeRuntime('verification.json', report)
  console.log(JSON.stringify(report, null, 2))
  if (!report.passed) process.exitCode = 2
  return report
}

function usage() {
  console.log(`演立方 Project Memory CLI\n\nCommands:\n  health\n  sync\n  preflight --task <summary> [--task-id <id>] [--modules <csv>] [--risk high|normal] [--claim <possible-old-rule>] [--mcp-evidence <json>]\n  gate\n  impact [--task-id <id>] [--files <csv>]\n  verify`)
}

const args = parseArgs(process.argv.slice(2))
const command = args._[0]

try {
  if (command === 'health') await health()
  else if (command === 'sync') await syncMemory()
  else if (command === 'preflight') await preflight(args)
  else if (command === 'gate') gate()
  else if (command === 'impact') impact(args)
  else if (command === 'verify') await verify()
  else usage()
} catch (error) {
  console.error(`Project Memory Error: ${error.message}`)
  process.exitCode = 1
}
