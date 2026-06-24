import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MODE_PARITY_COMMANDS,
  buildModeParityMatrix,
  renderTuiModeParityPanel,
  renderWebModeParityPanel,
} from '../src/mode-parity.js';

describe('mode parity matrix', () => {
  it('keeps web and tui mode surfaces aligned with every CLI command', () => {
    const matrix = buildModeParityMatrix();
    const cliCommands = [
      'new',
      'continue',
      'provider-smoke',
      'provider-doctor',
      'artifact-inspect',
      'artifact-catalog',
      'artifact-latest',
      'artifact-search',
      'artifact-normalize',
      'artifact-export',
      'artifact-version-tree',
      'artifact-prune',
      'artifact-diff',
      'continuation-check',
    ];

    assert.deepEqual(MODE_PARITY_COMMANDS.map((item) => item.command), cliCommands);
    assert.equal(matrix.summary.totalCliCommands, cliCommands.length);
    assert.equal(matrix.summary.webAligned, cliCommands.length);
    assert.equal(matrix.summary.tuiAligned, cliCommands.length);
    assert.equal(matrix.summary.gaps.length, 0);
    assert.equal(matrix.rows.every((row) => row.cli && row.web && row.tui), true);
  });

  it('renders user-facing web and tui parity panels from the shared matrix', () => {
    const matrix = buildModeParityMatrix();
    const webPanel = renderWebModeParityPanel(matrix);
    const tuiPanel = renderTuiModeParityPanel(matrix);

    for (const label of ['new', 'continue', 'artifact-search', 'continuation-check']) {
      assert.ok(webPanel.includes(label), label);
      assert.ok(tuiPanel.includes(label), label);
    }
    assert.ok(webPanel.includes('CLI/Web/TUI'));
    assert.ok(tuiPanel.includes('[x]'));
    assert.ok(tuiPanel.includes('Mode Parity'));
  });
});
