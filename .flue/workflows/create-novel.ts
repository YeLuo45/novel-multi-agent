import { defineWorkflow } from '@flue/runtime';
import planner from '../agents/planner.ts';

export default defineWorkflow({
  agent: planner,
  async run({ harness }) {
    const session = await harness.session();
    return session.prompt('Create a novel project from the supplied theme.');
  },
});
