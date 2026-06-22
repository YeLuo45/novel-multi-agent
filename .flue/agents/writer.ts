import { defineAgent } from '@flue/runtime';

export default defineAgent(() => ({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'Write or continue a Chinese novel chapter using story bible, outline, memory, and recent chapter context.',
}));
