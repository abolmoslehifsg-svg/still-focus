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
  /** i18n key for the reward title, e.g. 'reward.general.0.title' */
  titleKey: string
  /** i18n key for the reward note, e.g. 'reward.general.0.note' */
  noteKey: string
}

const KEYWORD_REWARDS: { keywords: string[]; rewards: Reward[] }[] = [
  {
    keywords: ['study', 'exam', 'learn', 'course', 'lesson', 'school', 'university', 'test'],
    rewards: [
      { titleKey: 'reward.study.0.title', noteKey: 'reward.study.0.note' },
      { titleKey: 'reward.study.1.title', noteKey: 'reward.study.1.note' },
      { titleKey: 'reward.study.2.title', noteKey: 'reward.study.2.note' },
    ],
  },
  {
    keywords: ['code', 'program', 'bug', 'feature', 'app', 'software', 'dev', 'build', 'ship'],
    rewards: [
      { titleKey: 'reward.code.0.title', noteKey: 'reward.code.0.note' },
      { titleKey: 'reward.code.1.title', noteKey: 'reward.code.1.note' },
      { titleKey: 'reward.code.2.title', noteKey: 'reward.code.2.note' },
    ],
  },
  {
    keywords: ['write', 'writing', 'book', 'essay', 'blog', 'story', 'novel', 'poem', 'journal'],
    rewards: [
      { titleKey: 'reward.write.0.title', noteKey: 'reward.write.0.note' },
      { titleKey: 'reward.write.1.title', noteKey: 'reward.write.1.note' },
      { titleKey: 'reward.write.2.title', noteKey: 'reward.write.2.note' },
    ],
  },
  {
    keywords: ['read', 'reading', 'book'],
    rewards: [
      { titleKey: 'reward.read.0.title', noteKey: 'reward.read.0.note' },
      { titleKey: 'reward.read.1.title', noteKey: 'reward.read.1.note' },
    ],
  },
  {
    keywords: ['meditate', 'meditation', 'breathe', 'breath', 'calm', 'mindful', 'still'],
    rewards: [
      { titleKey: 'reward.meditate.0.title', noteKey: 'reward.meditate.0.note' },
      { titleKey: 'reward.meditate.1.title', noteKey: 'reward.meditate.1.note' },
      { titleKey: 'reward.meditate.2.title', noteKey: 'reward.meditate.2.note' },
    ],
  },
  {
    keywords: ['gym', 'workout', 'exercise', 'run', 'running', 'fitness', 'train', 'body', 'yoga'],
    rewards: [
      { titleKey: 'reward.gym.0.title', noteKey: 'reward.gym.0.note' },
      { titleKey: 'reward.gym.1.title', noteKey: 'reward.gym.1.note' },
      { titleKey: 'reward.gym.2.title', noteKey: 'reward.gym.2.note' },
    ],
  },
  {
    keywords: ['draw', 'drawing', 'paint', 'painting', 'art', 'design', 'sketch', 'create', 'music', 'song', 'play', 'compose'],
    rewards: [
      { titleKey: 'reward.art.0.title', noteKey: 'reward.art.0.note' },
      { titleKey: 'reward.art.1.title', noteKey: 'reward.art.1.note' },
      { titleKey: 'reward.art.2.title', noteKey: 'reward.art.2.note' },
    ],
  },
  {
    keywords: ['work', 'job', 'project', 'task', 'deadline', 'client', 'meeting', 'email', 'report', 'plan'],
    rewards: [
      { titleKey: 'reward.work.0.title', noteKey: 'reward.work.0.note' },
      { titleKey: 'reward.work.1.title', noteKey: 'reward.work.1.note' },
      { titleKey: 'reward.work.2.title', noteKey: 'reward.work.2.note' },
    ],
  },
]

const GENERAL_REWARDS: Reward[] = [
  { titleKey: 'reward.general.0.title', noteKey: 'reward.general.0.note' },
  { titleKey: 'reward.general.1.title', noteKey: 'reward.general.1.note' },
  { titleKey: 'reward.general.2.title', noteKey: 'reward.general.2.note' },
  { titleKey: 'reward.general.3.title', noteKey: 'reward.general.3.note' },
  { titleKey: 'reward.general.4.title', noteKey: 'reward.general.4.note' },
  { titleKey: 'reward.general.5.title', noteKey: 'reward.general.5.note' },
  { titleKey: 'reward.general.6.title', noteKey: 'reward.general.6.note' },
  { titleKey: 'reward.general.7.title', noteKey: 'reward.general.7.note' },
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
