import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { runFullPipeline } from '@novel-ma/agents';
import { saveProject, type NovelInput } from '@novel-ma/core';

export interface CliResult {
  projectId: string;
  artifactPath: string;
  title: string;
  stage: string;
  chapterTitle: string;
}

function readOption(args: string[], name: string, fallback: string): string {
  const direct = args.indexOf(name);
  if (direct >= 0 && args[direct + 1]) return args[direct + 1];
  const npmKey = `npm_config_${name.replace(/^--/, '').replaceAll('-', '_')}`;
  return process.env[npmKey] && process.env[npmKey] !== 'true' ? process.env[npmKey] : fallback;
}

function findWorkspaceRoot(start: string): string {
  let current = start;
  while (true) {
    const packagePath = path.join(current, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { workspaces?: unknown };
      if (packageJson.workspaces) return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}

function resolveRoot(root: string): string {
  return findWorkspaceRoot(root);
}

function resolveInputPath(file: string, root: string): string {
  return path.isAbsolute(file) ? file : path.join(resolveRoot(root), file);
}

export async function runNew(args: string[], root = process.cwd()): Promise<CliResult> {
  const theme = args.find((arg) => !arg.startsWith('--')) ?? '未命名主题';
  const input: NovelInput = {
    mode: 'theme',
    theme,
    targetChapters: Number(readOption(args, '--chapters', '3')),
    targetWords: Number(readOption(args, '--words', '900')),
    language: 'zh-CN',
  };
  const project = runFullPipeline(input);
  const storageRoot = resolveRoot(root);
  const artifactPath = await saveProject(storageRoot, project);
  return { projectId: project.id, artifactPath, title: project.title, stage: project.stage, chapterTitle: project.revision?.title ?? '' };
}

export async function runContinue(args: string[], root = process.cwd()): Promise<CliResult> {
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file) throw new Error('continue command requires a source file');
  const storageRoot = resolveRoot(root);
  const existingText = await readFile(resolveInputPath(file, storageRoot), 'utf8');
  const input: NovelInput = {
    mode: 'continuation',
    existingText,
    targetChapters: Number(readOption(args, '--chapters', '6')),
    targetWords: Number(readOption(args, '--words', '900')),
    language: 'zh-CN',
  };
  const project = runFullPipeline(input);
  const artifactPath = await saveProject(storageRoot, project);
  return { projectId: project.id, artifactPath, title: project.title, stage: project.stage, chapterTitle: project.revision?.title ?? '' };
}
