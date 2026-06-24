import { advanceStage, buildContinuationContext, createEmptyMemory, extractStyleFingerprint, splitChapters, type ChapterCard, type CritiqueCard, type DraftCard, type NovelInput, type NovelProject, type StoryBible } from '@novel-ma/core';

function now(): string {
  return new Date().toISOString();
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9一-龥]+/gi, '-').replace(/^-|-$/g, '').slice(0, 32) || 'novel';
}

function audit(project: NovelProject, agent: string, inputSummary: string, outputSummary: string): void {
  project.auditLog.push({ stage: project.stage, agent, inputSummary, outputSummary, createdAt: now() });
}

export function createProject(input: NovelInput): NovelProject {
  const seed = input.theme ?? input.existingText?.slice(0, 24) ?? 'novel';
  const project: NovelProject = {
    id: `${slug(seed)}-${Date.now().toString(36)}`,
    title: input.theme ? `《${input.theme.slice(0, 24)}》` : '《续写项目》',
    stage: 'intake',
    input,
    outline: [],
    memory: createEmptyMemory(),
    auditLog: [],
  };
  audit(project, 'intake-agent', input.mode, project.title);
  return project;
}

export function runBibleAgent(project: NovelProject): NovelProject {
  const theme = project.input.theme ?? '承接已有篇章的悬疑冒险';
  const existingText = project.input.existingText ?? '';
  const sourceStyle = existingText ? extractStyleFingerprint(existingText) : ['中文长篇叙事', '悬念递进', '角色成长'];
  if (existingText.includes('林澈')) project.memory.characters['林澈'] = '守夜人，从被动观察转为主动追查。';
  if (existingText.includes('墨塔')) project.memory.characters['墨塔'] = '失忆 AI，掌握被遮蔽的远航线索。';
  if (existingText.includes('会移动的星图')) project.memory.foreshadowing.push('会移动的星图必须回收');
  project.memory.styleFingerprint = sourceStyle;
  const bible: StoryBible = {
    premise: `围绕“${theme}”展开，一名主角在看似日常的秩序中发现隐藏系统，并被迫做出改变世界的选择。`,
    genre: '科幻悬疑 / 长篇连载',
    tone: sourceStyle.join('；'),
    worldRules: ['每个关键发现必须留下代价', '伏笔先以日常细节出现，再在三章内回收', '角色关系变化必须由行动触发'],
    characters: ['主角：承担守望职责的人', '同行者：掌握缺失记忆的智能体', '对手：维护旧秩序的隐形组织'],
    promises: ['隐藏真相逐层揭开', '人物信任关系会反复受考验', '终局选择改变世界规则'],
  };
  project.bible = bible;
  audit(project, 'story-bible-agent', theme, bible.premise);
  project.stage = advanceStage(project.stage, 'bible');
  return project;
}

export function runOutlineAgent(project: NovelProject): NovelProject {
  const total = Math.max(1, project.input.targetChapters);
  const outline: ChapterCard[] = Array.from({ length: total }, (_, index) => {
    const number = index + 1;
    return {
      number,
      title: `第${number}章 ${number === 1 ? '异常的开端' : number === total ? '代价与门扉' : '线索的回声'}`,
      purpose: number === 1 ? '建立主角、核心异常与故事承诺' : '推进线索、加深冲突并埋设后续回收点',
      conflict: `第${number}个关键选择暴露更深层规则`,
      foreshadowing: [`伏笔${number}: 一个被忽视的细节将在后续回收`],
    };
  });
  project.outline = outline;
  audit(project, 'outline-agent', `${total} chapters`, `created ${outline.length} chapter cards`);
  project.stage = advanceStage(project.stage, 'outline');
  return project;
}

export function runWriterAgent(project: NovelProject): NovelProject {
  const existingChapters = splitChapters(project.input.existingText ?? '');
  const card = project.outline[existingChapters.length] ?? project.outline[0];
  const continuationContext = project.input.mode === 'continuation'
    ? buildContinuationContext({
        existingText: project.input.existingText ?? '',
        memory: project.memory,
        nextChapterTitle: card.title,
      })
    : null;
  const context = continuationContext ? continuationContext.promptBlock : `故事设定：${project.bible?.premise ?? ''}`;
  const body = [
    `${card.title}`,
    '',
    `${context}。`,
    `这一章的核心冲突是：${card.conflict}。主角意识到，真正危险的不是异常本身，而是所有人都习惯把异常解释成日常。`,
    '他开始整理线索：一个反复出现的地点、一句被不同人物说过的话，以及某个看似无用却从未离身的物件。每条线索都指向同一个答案——有人在提前改写他们的选择。',
    `章节末尾，${card.foreshadowing[0]}。主角没有立刻胜利，只获得了继续追问的资格。`,
  ].join('\n');
  const draft: DraftCard = { chapterNumber: card.number, title: card.title, body, targetWords: project.input.targetWords };
  project.draft = draft;
  audit(project, 'writer-agent', card.title, `${body.length} chars draft`);
  project.stage = advanceStage(project.stage, 'draft');
  return project;
}

export function runCriticAgent(project: NovelProject): NovelProject {
  const body = project.draft?.body ?? '';
  const critique: CritiqueCard = {
    continuity: body.includes('伏笔') ? ['伏笔已出现，需要后续章节回收'] : ['缺少明确伏笔'],
    style: ['保持中文连载节奏', '增加具象动作以减少说明感'],
    revisionPlan: ['补强章节末尾钩子', '明确主角下一步行动'],
    accepted: body.length > 120,
  };
  project.critique = critique;
  audit(project, 'critic-agent', `${body.length} chars`, critique.revisionPlan.join('；'));
  project.stage = advanceStage(project.stage, 'critique');
  return project;
}

export function runRevisionAgent(project: NovelProject): NovelProject {
  if (!project.draft) throw new Error('Draft is required before revision');
  const revised: DraftCard = {
    ...project.draft,
    body: `${project.draft.body}

修订补强：他把那件物件放到星光下，第一次看见上面浮现出并不属于自己的名字。下一章，他必须决定是追查名字的来源，还是先保护仍然相信他的人。`,
  };
  project.revision = revised;
  audit(project, 'revision-agent', project.critique?.revisionPlan.join('；') ?? '', `${revised.body.length} chars revised`);
  project.stage = advanceStage(project.stage, 'revision');
  return project;
}

export function runMemoryAgent(project: NovelProject): NovelProject {
  const finalDraft = project.revision ?? project.draft;
  if (!finalDraft) throw new Error('Final draft is required before memory update');
  project.memory.chapterSummaries.push(`${finalDraft.title}: 主角发现异常背后存在选择改写机制。`);
  project.memory.foreshadowing.push(...(project.outline.find((card) => card.number === finalDraft.chapterNumber)?.foreshadowing ?? []));
  project.memory.characters['主角'] = '已从被动观察转为主动追查。';
  project.memory.styleFingerprint = extractStyleFingerprint(finalDraft.body);
  audit(project, 'memory-agent', finalDraft.title, `memory summaries=${project.memory.chapterSummaries.length}`);
  project.stage = advanceStage(project.stage, 'memory');
  project.stage = advanceStage(project.stage, 'completed');
  return project;
}

export function runFullPipeline(input: NovelInput): NovelProject {
  return runMemoryAgent(runRevisionAgent(runCriticAgent(runWriterAgent(runOutlineAgent(runBibleAgent(createProject(input)))))));
}
