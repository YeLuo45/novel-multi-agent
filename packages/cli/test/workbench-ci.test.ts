import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import vm from 'node:vm';

function findRoot(start: string): string {
  let current = start;
  while (true) {
    if (existsSync(path.join(current, 'package.json')) && readFileSync(path.join(current, 'package.json'), 'utf8').includes('"workspaces"')) return current;
    const parent = path.dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}

describe('web workbench and ci scaffolding', () => {
  const root = findRoot(process.cwd());

  it('ships a zero-dependency web workbench with visible create and continue sections', () => {
    const htmlPath = path.join(root, 'apps/web/index.html');
    assert.equal(existsSync(htmlPath), true);
    const html = readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('novel-multi-agent 工作台'));
    assert.ok(html.includes('根据主题创建'));
    assert.ok(html.includes('根据已有篇章续写'));
    assert.ok(html.includes('伏笔回收评分'));
    assert.ok(html.includes('项目目录索引'));
    assert.ok(html.includes('最近项目'));
    assert.ok(html.includes('导入两个 Artifact 对比'));
    assert.ok(html.includes('导入项目库 Bundle'));
    for (const label of ['Artifact 真实导入向导', '续写质量面板', '本地项目库清理面板', 'Provider 实战面板', 'Flue Workflow 适配', '桌面壳准备度', '长篇工程化控制台']) {
      assert.ok(html.includes(label), label);
    }
    const rootHtml = readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.ok(rootHtml.includes('./apps/web/'));
    assert.ok(rootHtml.includes('导入项目库 Bundle'));
    assert.ok(rootHtml.includes('GitHub Pages legacy 根入口'));
    assert.ok(rootHtml.includes('https://yeluo45.github.io/novel-multi-agent/apps/web/'));
    assert.ok(rootHtml.includes('file://'));
  });

  it('configures GitHub Actions to run install, check, test, build, coverage, and README verification', () => {
    const workflowPath = path.join(root, '.github/workflows/ci.yml');
    assert.equal(existsSync(workflowPath), true);
    const yaml = readFileSync(workflowPath, 'utf8');
    for (const command of ['npm ci', 'npm run check', 'npm test', 'npm run build', 'npm run coverage:incremental', 'npm run verify:readme']) {
      assert.ok(yaml.includes(command), command);
    }
  });

  it('exposes browser-local artifact builders for theme creation, continuation, and foreshadowing scoring', () => {
    const htmlPath = path.join(root, 'apps/web/index.html');
    const html = readFileSync(htmlPath, 'utf8');
    const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';
    const sandbox: any = {
      window: {},
      document: {
        documentElement: { dataset: {} },
        getElementById() {
          return { value: '', textContent: '', disabled: false, onclick: undefined, addEventListener() {} };
        },
      },
      Blob: class Blob {},
      URL: { createObjectURL: () => 'blob:artifact', revokeObjectURL() {} },
      localStorage: {
        data: new Map(),
        getItem(key: string) { return this.data.get(key) ?? null; },
        setItem(key: string, value: string) { this.data.set(key, value); },
        removeItem(key: string) { this.data.delete(key); },
      },
    };
    vm.runInNewContext(script, sandbox);
    const workbench = sandbox.window.NovelWorkbench;
    assert.equal(typeof workbench.createFromTheme, 'function');
    assert.equal(typeof workbench.continueFromChapters, 'function');
    assert.equal(typeof workbench.scoreForeshadowing, 'function');

    const created = workbench.createFromTheme('海底档案馆');
    assert.equal(created.title, '《海底档案馆》');
    assert.equal(created.stage, 'completed');
    assert.ok(created.artifact.outline.length >= 3);

    const continued = workbench.continueFromChapters('# 第一章 潮汐门\n她听见门后有人呼吸。\n# 第二章 盐灯\n盐灯照出另一张影子。');
    assert.equal(continued.title, '《续写项目》');
    assert.equal(continued.chapterTitle, '第3章 线索的回声');
    assert.ok(continued.artifact.continuationContext.includes('盐灯'));

    const score = workbench.scoreForeshadowing('会移动的星图:recovered\n黑匣子里的名字:open\n月尘中的脚印:overdue');
    assert.equal(score.recovered.length, 1);
    assert.equal(score.open.length, 1);
    assert.equal(score.overdue.length, 1);
    assert.ok(score.score < 100);
  });

  it('supports local library storage, artifact import/diff, memory graph, themes, and pages deployment metadata', () => {
    const htmlPath = path.join(root, 'apps/web/index.html');
    const html = readFileSync(htmlPath, 'utf8');
    const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';
    const sandbox: any = {
      window: {},
      document: {
        documentElement: { dataset: {} },
        getElementById() {
          return { value: '', textContent: '', disabled: false, onclick: undefined, addEventListener() {}, innerHTML: '' };
        },
        querySelectorAll() { return []; },
      },
      Blob: class Blob {},
      URL: { createObjectURL: () => 'blob:artifact', revokeObjectURL() {} },
      localStorage: {
        data: new Map(),
        getItem(key: string) { return this.data.get(key) ?? null; },
        setItem(key: string, value: string) { this.data.set(key, value); },
        removeItem(key: string) { this.data.delete(key); },
      },
    };
    vm.runInNewContext(script, sandbox);
    const workbench = sandbox.window.NovelWorkbench;
    for (const fn of ['createLibrary', 'importArtifact', 'compareArtifacts', 'buildMemoryGraph', 'applyTheme', 'buildLatestCatalog', 'searchLibrary', 'normalizeArtifact', 'assessContinuationQuality', 'renderLatestCatalogPanel', 'compareImportedArtifacts', 'exportLibraryBundle', 'importLibraryBundle', 'mergeLibraryBundle', 'buildImportGuide', 'renderQualityPanel', 'planLibraryCleanup', 'buildProviderReadiness', 'buildFlueWorkflowPlan', 'buildDesktopShellReadiness', 'buildLongformConsole']) {
      assert.equal(typeof workbench[fn], 'function', fn);
    }

    const library = workbench.createLibrary(sandbox.localStorage);
    const artifact = workbench.buildArtifact('theme', '星际茶馆', '银匙:recovered\n旧门:open');
    const saved = library.save(artifact);
    assert.equal(saved.projectId, artifact.projectId);
    assert.equal(library.list().length, 1);
    assert.equal(library.load(artifact.projectId).title, artifact.title);

    const imported = workbench.importArtifact(JSON.stringify(workbench.buildArtifact('continue', '# 第一章 门\n门开了。', '旧门:overdue')));
    const diff = workbench.compareArtifacts(artifact, imported);
    assert.ok(diff.some((item: any) => item.field === 'mode'));
    assert.ok(diff.some((item: any) => item.field === 'foreshadowingScore'));

    const graph = workbench.buildMemoryGraph(artifact);
    assert.ok(graph.nodes.some((node: any) => node.type === 'foreshadowing'));
    assert.ok(graph.edges.some((edge: any) => edge.type === 'mentions'));

    workbench.applyTheme('nord');
    assert.equal(sandbox.document.documentElement.dataset.theme, 'nord');
    assert.equal(sandbox.localStorage.getItem('novel-ma:theme'), 'nord');

    library.remove(artifact.projectId);
    assert.equal(library.list().length, 0);

    library.save(artifact);
    const newer = { ...artifact, projectId: 'newer-id', updatedAt: '2099-01-01T00:00:00.000Z' };
    library.save(newer);
    const latest = workbench.buildLatestCatalog(library.list());
    assert.equal(latest.groups[0].latest.projectId, 'newer-id');
    assert.equal(workbench.searchLibrary(library.list(), '星际茶馆').items.length, 2);
    assert.equal(workbench.normalizeArtifact(artifact).schemaVersion, 2);
    assert.equal(workbench.assessContinuationQuality(artifact, '主角追踪银匙，短句推进。').status, 'pass');
    const panel = workbench.renderLatestCatalogPanel(library.list());
    assert.ok(panel.includes('最近项目'));
    assert.ok(panel.includes('history'));
    const comparePair = workbench.compareImportedArtifacts(JSON.stringify(artifact), JSON.stringify(imported));
    assert.ok(comparePair.diff.length >= 1);
    assert.ok(comparePair.report.includes('mode'));

    const bundle = workbench.exportLibraryBundle(library.list());
    assert.equal(bundle.schemaVersion, 1);
    assert.equal(bundle.items.length, 2);
    const importedBundle = workbench.importLibraryBundle(JSON.stringify(bundle));
    assert.equal(importedBundle.items.length, 2);
    assert.equal(importedBundle.issues.length, 0);
    const mixedBundle = workbench.importLibraryBundle(JSON.stringify({ items: [artifact, { broken: true }] }));
    assert.equal(mixedBundle.items.length, 1);
    assert.equal(mixedBundle.issues.length, 1);
    const mergeResult = workbench.mergeLibraryBundle(library, JSON.stringify({ items: [{ ...artifact, title: '覆盖后的星际茶馆' }, { ...imported, projectId: 'imported-id' }, { broken: true }] }));
    assert.equal(mergeResult.imported, 2);
    assert.equal(mergeResult.issues.length, 1);
    assert.equal(library.load(artifact.projectId).title, '覆盖后的星际茶馆');
    assert.equal(library.load('imported-id').title, imported.title);

    const guide = workbench.buildImportGuide(JSON.stringify(artifact));
    assert.equal(guide.ok, true);
    assert.equal(guide.steps.length >= 3, true);
    const badGuide = workbench.buildImportGuide('{bad json');
    assert.equal(badGuide.ok, false);
    assert.ok(badGuide.repairHint.includes('JSON'));

    const qualityPanel = workbench.renderQualityPanel(artifact, '主角带着银匙追踪旧门，短句推进。');
    assert.ok(qualityPanel.includes('characters'));
    assert.ok(qualityPanel.includes('foreshadowing'));
    assert.ok(qualityPanel.includes('style'));

    library.save({ ...artifact, projectId: 'older-history-id', title: '覆盖后的星际茶馆', updatedAt: '2000-01-01T00:00:00.000Z' });
    const cleanup = workbench.planLibraryCleanup(library.list(), 1);
    assert.equal(cleanup.dryRun, true);
    assert.equal(cleanup.remove.length >= 1, true);
    assert.ok(cleanup.manifest.includes('prune-manifest'));

    const provider = workbench.buildProviderReadiness({ provider: 'mock', model: 'deterministic' });
    assert.equal(provider.ready, true);
    assert.ok(provider.diagnostics.some((item: string) => item.includes('mock')));
    assert.ok(workbench.buildFlueWorkflowPlan(artifact).nodes.includes('premise'));
    assert.ok(workbench.buildDesktopShellReadiness().checks.includes('local-file-open'));
    const longform = workbench.buildLongformConsole(library.list());
    assert.ok(longform.sections.includes('volume-planning'));
    assert.ok(longform.sections.includes('chapter-version-tree'));

    const workflowPath = path.join(root, '.github/workflows/pages.yml');
    assert.equal(existsSync(workflowPath), true);
    const workflow = readFileSync(workflowPath, 'utf8');
    assert.ok(workflow.includes('actions/upload-pages-artifact@v3'));
    assert.ok(workflow.includes('path: apps/web'));
  });
});
