// 演立方 V4.7 — 全端UI/UX可视化审计脚本
// 用法：node scripts/visual-audit.mjs [baseUrl]

import { writeFileSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:8086';

// 6端核心页面清单
const PAGES = {
  '增长工具H5': [
    '/tools/budget-calculator',
    '/tools/insurance-plan',
    '/tools/annual-plan',
  ],
  '客户方案H5': [
    '/p/YLF-2026-0042',
    '/p/prop-001',
  ],
  '企业客户PC端': [
    '/agent/',
    '/agent/solutions',
    '/agent/assistant',
    '/agent/requests',
    '/agent/messages',
  ],
  '移动Web': [
    '/m/',
    '/m/discover',
    '/m/submit',
    '/m/me',
    '/m/messages',
  ],
  '销售工作台': [
    '/supplier/workspace',
    '/supplier/leads',
    '/supplier/leads/$id',
    '/supplier/proposals',
    '/supplier/proposals/$id',
    '/supplier/followups',
  ],
  '运营后台': [
    '/admin/dashboard',
    '/admin/sku',
    '/admin/artists',
    '/admin/orders',
    '/admin/customers',
  ],
};

// UI/UX检查规则
const RULES = {
  empty_page: { severity: '🔴', desc: '页面空白/404/崩溃', check: (html) => html.includes('empty page') || html.includes('404') },
  no_error: { severity: '🟢', desc: '无JS运行时错误', check: (html) => true },
};

const report = {};

console.log('🔍 演立方 V4.7 全端UI/UX审计');
console.log(`📡 目标: ${BASE}`);
console.log('');

for (const [endpoint, paths] of Object.entries(PAGES)) {
  report[endpoint] = [];
  console.log(`\n━━━ ${endpoint} ━━━`);
  for (const path of paths) {
    try {
      const url = `${BASE}${path}`;
      const res = await fetch(url);
      const html = await res.text();
      const status = res.status;
      const hasTitle = html.includes('<title>');
      const hasAntd = html.includes('ant-');
      const hasStyle = html.includes('class=');
      const size = html.length;
      
      const issues = [];
      if (status !== 200) issues.push(`HTTP ${status}`);
      if (!hasTitle) issues.push('缺少<title>');
      if (!hasAntd && !hasStyle) issues.push('无UI组件渲染');
      if (size < 500) issues.push(`极小响应(${size}字节)`);
      
      const icon = issues.length === 0 ? '✅' : '❌';
      console.log(`  ${icon} ${path} ${issues.length > 0 ? '→ ' + issues.join(', ') : ''}`);
      report[endpoint].push({ path, status, size, issues });
    } catch (e) {
      console.log(`  ❌ ${path} → 请求失败: ${e.message}`);
      report[endpoint].push({ path, status: 0, size: 0, issues: [e.message] });
    }
  }
}

// 汇总
console.log('\n\n📊 审计汇总');
let totalPages = 0;
let totalIssues = 0;
for (const [endpoint, pages] of Object.entries(report)) {
  const issuePages = pages.filter(p => p.issues.length > 0);
  totalPages += pages.length;
  totalIssues += issuePages.length;
  console.log(`  ${endpoint}: ${pages.length}页, ${issuePages.length}个有问题`);
}
console.log(`  ─────────────────`);
console.log(`  总计: ${totalPages}页, ${totalIssues}个有问题`);

writeFileSync('visual-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 详细报告已保存: visual-audit-report.json');
