import {
  runArtifactCatalog,
  runArtifactDiff,
  runArtifactInspect,
  runArtifactLatest,
  runArtifactNormalize,
  runArtifactPrune,
  runArtifactVersionTree,
  runArtifactExport,
  runArtifactSearch,
  runContinuationCheck,
  runContinue,
  runNew,
  runProviderDoctor,
  runProviderSmoke,
} from './run.js';

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'new') {
    console.log(JSON.stringify(await runNew(args), null, 2));
    return;
  }
  if (command === 'continue') {
    console.log(JSON.stringify(await runContinue(args), null, 2));
    return;
  }
  if (command === 'provider-smoke') {
    console.log(JSON.stringify(await runProviderSmoke(args), null, 2));
    return;
  }
  if (command === 'provider-doctor') {
    console.log(JSON.stringify(runProviderDoctor(), null, 2));
    return;
  }
  if (command === 'artifact-inspect') {
    console.log(JSON.stringify(await runArtifactInspect(args), null, 2));
    return;
  }
  if (command === 'artifact-catalog') {
    console.log(JSON.stringify(await runArtifactCatalog(args), null, 2));
    return;
  }
  if (command === 'artifact-latest') {
    console.log(JSON.stringify(await runArtifactLatest(args), null, 2));
    return;
  }
  if (command === 'artifact-search') {
    console.log(JSON.stringify(await runArtifactSearch(args), null, 2));
    return;
  }
  if (command === 'artifact-normalize') {
    console.log(JSON.stringify(await runArtifactNormalize(args), null, 2));
    return;
  }
  if (command === 'artifact-export') {
    console.log(JSON.stringify(await runArtifactExport(args), null, 2));
    return;
  }
  if (command === 'artifact-version-tree') {
    console.log(JSON.stringify(await runArtifactVersionTree(args), null, 2));
    return;
  }
  if (command === 'artifact-prune') {
    console.log(JSON.stringify(await runArtifactPrune(args), null, 2));
    return;
  }
  if (command === 'artifact-diff') {
    const result = await runArtifactDiff(args);
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    return;
  }
  if (command === 'continuation-check') {
    console.log(JSON.stringify(await runContinuationCheck(args), null, 2));
    return;
  }
  throw new Error('Usage: novel-ma <new|continue|provider-smoke|provider-doctor|artifact-inspect|artifact-catalog|artifact-latest|artifact-search|artifact-normalize|artifact-export|artifact-version-tree|artifact-prune|artifact-diff|continuation-check> <theme-or-file-or-prompt> [--chapters N] [--words N]');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
