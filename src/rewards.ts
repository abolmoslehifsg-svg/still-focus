/**
 * Goal rewards.
 *
 * The app has no backend, so rewards are generated locally and
 * deterministically: the same goal always yields the same reward. Keyword
 * awareness gives a bit of relevance, and the hash keeps things stable.
 *
 * The shape of `getReward` is deliberately async-friendly, so a real AI
 * endpoint can later replace the body of this file without touching any
 * component.
 */

export interface Reward {
  title: string
  note: string
}

const KEYWORD_REWARDS: { keywords: string[]; rewards: Reward[] }[] = [
  {
    keywords: ['study', 'exam', 'learn', 'course', 'lesson', 'school', 'university', 'test'],
    rewards: [
      { title: 'Knowledge earned.', note: 'Every page is now yours' },
      { title: 'Sharper than before.', note: 'That effort compounds' },
      { title: 'Well studied.', note: 'Rest is part of learning' },
    ],
  },
  {
    keywords: ['code', 'program', 'bug', 'feature', 'app', 'software', 'dev', 'build', 'ship'],
    rewards: [
      { title: 'Shipped in silence.', note: 'The work speaks now' },
      { title: 'One less bug.', note: 'Momentum is a feature' },
      { title: 'Deep work, done.', note: 'Compile your thoughts' },
    ],
  },
  {
    keywords: ['write', 'writing', 'book', 'essay', 'blog', 'story', 'novel', 'poem', 'journal'],
    rewards: [
      { title: 'Words well spent.', note: 'The page remembers' },
      { title: 'A voice, steady.', note: 'Keep the sentence close' },
      { title: 'Written, not wished.', note: 'That is the whole secret' },
    ],
  },
  {
    keywords: ['read', 'reading', 'book'],
    rewards: [
      { title: 'Quietly further.', note: 'Stories are now yours' },
      { title: 'One chapter closer.', note: 'Let it settle' },
    ],
  },
  {
    keywords: ['meditate', 'meditation', 'breathe', 'breath', 'calm', 'mindful', 'still'],
    rewards: [
      { title: 'Stillness found.', note: 'Carry it with you' },
      { title: 'You arrived.', note: 'That is the practice' },
      { title: 'Calm, kept.', note: 'Return whenever you need' },
    ],
  },
  {
    keywords: ['gym', 'workout', 'exercise', 'run', 'running', 'fitness', 'train', 'body', 'yoga'],
    rewards: [
      { title: 'Stronger today.', note: 'Your body keeps the score' },
      { title: 'Earned, not given.', note: 'Hydrate and rest' },
      { title: 'One rep at a time.', note: 'Consistency wins' },
    ],
  },
  {
    keywords: ['draw', 'drawing', 'paint', 'painting', 'art', 'design', 'sketch', 'create', 'music', 'song', 'play', 'compose'],
    rewards: [
      { title: 'Something exists now.', note: 'That was the point' },
      { title: 'Made, not planned.', note: 'Let it breathe' },
      { title: 'The blank page lost.', note: 'Courage, in colour' },
    ],
  },
  {
    keywords: ['work', 'job', 'project', 'task', 'deadline', 'client', 'meeting', 'email', 'report', 'plan'],
    rewards: [
      { title: 'The list just shrank.', note: 'Close the laptop fully' },
      { title: 'Handled.', note: 'Tomorrow will wait' },
      { title: 'Professional, quiet, done.', note: 'Take the win' },
    ],
  },
]

const GENERAL_REWARDS: Reward[] = [
  { title: 'You kept your word.', note: 'That is worth something' },
  { title: 'One promise, kept.', note: 'Build on it tomorrow' },
  { title: 'The noise lost today.', note: 'You did not' },
  { title: 'Present for the whole thing.', note: 'Rare, these days' },
  { title: 'Quietly, you showed up.', note: 'And finished' },
  { title: 'Time well spent.', note: 'Take a breath' },
  { title: 'That was real focus.', note: 'Protect it' },
  { title: 'Small win, real win.', note: 'Stack them up' },
]

/** Deterministic 32-bit hash (FNV-1a). Same goal → same reward, always. */
function hashGoal(goal: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < goal.length; i++) {
    hash ^= goal.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function normalize(goal: string): string {
  return goal.trim().toLowerCase()
}

/** Local reward generator. Swap the body for an AI call later. */
export function getReward(goal: string): Reward {
  const text = normalize(goal)
  if (!text) return GENERAL_REWARDS[0]

  for (const group of KEYWORD_REWARDS) {
    if (group.keywords.some((keyword) => text.includes(keyword))) {
      return group.rewards[hashGoal(text) % group.rewards.length]
    }
  }

  return GENERAL_REWARDS[hashGoal(text) % GENERAL_REWARDS.length]
}

export async function getRewardAsync(goal: string): Promise<Reward> {
  // Placeholder for a future AI endpoint — same signature, real network call.
  return getReward(goal)
}
