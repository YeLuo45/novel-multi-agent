import { defineAgent } from '@flue/runtime';

export default defineAgent(() => ({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'Plan a long-form Chinese novel from a user theme. Return structured story bible cards.',
}));
