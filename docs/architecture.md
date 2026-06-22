# Architecture

## Agent graph

- Intake Agent: normalizes user theme or existing chapters.
- Story Bible Agent: creates premise, world rules, cast, tone, and promises.
- Outline Agent: creates chapter cards in chunks.
- Context Agent: builds recent-summary + memory context for the next chapter.
- Writer Agent: writes a chapter draft.
- Critic Agent: checks continuity, pacing, contradictions, and style drift.
- Revision Agent: applies critic notes.
- Memory Agent: updates character, foreshadowing, chapter summary, and style fingerprint.

## State machine

`intake -> bible -> outline -> draft -> critique -> revision -> memory -> completed`

The state machine lives in `packages/core/src/state-machine.ts`. Agents return patches; the pipeline advances stages centrally.

## Storage

Local JSON artifacts live under `.novel-ma/projects/<id>/artifact.json`. This keeps generated manuscripts out of source control.

## Context strategy

V1 uses deterministic keyword extraction and recent chapter windows. The interface is intentionally small so embeddings/vector stores can replace it later.
