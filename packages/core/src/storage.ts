import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { NovelProject } from './types.js';

export function projectArtifactPath(root: string, projectId: string): string {
  return path.join(root, '.novel-ma', 'projects', projectId, 'artifact.json');
}

export async function saveProject(root: string, project: NovelProject): Promise<string> {
  const file = projectArtifactPath(root, project.id);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(project, null, 2)}
`, 'utf8');
  return file;
}

export async function loadProject(file: string): Promise<NovelProject> {
  return JSON.parse(await readFile(file, 'utf8')) as NovelProject;
}
