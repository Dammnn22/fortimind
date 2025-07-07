import { EducationalResource, SupportContact, Mood, Habit, BadgeDefinition, TranslationKey, ChallengeDefinition, Language } from './types';


export const APP_NAME = "Fortimind"; // This can be overridden by t('appName') for display
export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
export const DEEPSEEK_MODEL_NAME = "deepseek-chat";

export const DEFAULT_STREAK_NAME_KEY: TranslationKey = "placeholderStreakName"; // Key for translation
export const XP_FOR_BADGE_AWARD = 20; // XP awarded for each new badge

export const INITIAL_EDUCATIONAL_RESOURCES_KEYS: Array<Omit<EducationalResource, 'id'|'type'|'title'|'summary'|'content'|'category'|'url'|'videoCredits'> & {id: string, type: 'article' | 'video' | 'audio', titleKey: TranslationKey, summaryKey: TranslationKey, contentKey?: TranslationKey, categoryKey: TranslationKey, url?: string | Partial<Record<Language, string>>, videoCredits?: Partial<Record<Language, { nameKey: TranslationKey; url: string }>> }> = [
  {
    id: '1',
    type: 'article',
    titleKey: 'eduResource1Title',
    summaryKey: 'eduResource1Summary',
    contentKey: 'eduResource1Content',
    categoryKey: 'eduCatUnderstanding',
  },
  {
    id: '2',
    type: 'audio',
    titleKey: 'eduResource2Title',
    summaryKey: 'eduResource2Summary',
    categoryKey: 'eduCatCoping',
    url: {
      en: 'https://podcasts.apple.com/us/podcast/men-talking-mindfulness/id1536077981',
      es: 'https://podcasts.apple.com/es/podcast/meditacion-online-y-mindfulness/id1198967416',
    },
    videoCredits: { // Reusing videoCredits for audio credits
      en: { nameKey: 'podcastMenTalkingMindfulness' as TranslationKey, url: 'https://podcasts.apple.com/us/podcast/men-talking-mindfulness/id1536077981' },
      es: { nameKey: 'podcastMeditacionOnline' as TranslationKey, url: 'https://podcasts.apple.com/es/podcast/meditacion-online-y-mindfulness/id1198967416' }
    }
  },
  {
    id: '3',
    type: 'video',
    titleKey: 'eduResourceSaludMentalTitle',
    summaryKey: 'eduResource3Summary',
    categoryKey: 'eduCatMentalHealth',
    url: {
      en: 'https://www.youtube.com/embed/rkZl2gsLUp4',
      es: 'https://www.youtube.com/embed/_9agX3gY1jU',
    },
    videoCredits: {
      en: { nameKey: 'channelBetterThanYesterday' as TranslationKey, url: 'https://www.youtube.com/@TEDx' },
      es: { nameKey: 'channelPsicologoFerranSola' as TranslationKey, url: 'https://www.youtube.com/@TEDx' }
    }
  },
  {
    id: '4',
    type: 'article',
    titleKey: 'eduResource4Title',
    summaryKey: 'eduResource4Summary',
    contentKey: 'eduResource4Content',
    categoryKey: 'eduCatLifestyle',
  },
];

export const INITIAL_SUPPORT_CONTACTS_KEYS: Array<Omit<SupportContact, 'id'|'name'|'description'|'phone'|'website'> & {id:string, nameKey: TranslationKey, descriptionKey: TranslationKey, phone?:string, website?:string}> = [
  {
    id: '1',
    nameKey: 'supportContact1Name',
    descriptionKey: 'supportContact1Desc',
    phone: '1-800-662-HELP (4357)',
    website: 'https://www.samhsa.gov/find-help/national-helpline',
  },
  {
    id: '2',
    nameKey: 'supportContact2Name',
    descriptionKey: 'supportContact2Desc',
    website: 'https://www.smartrecovery.org/',
  },
  {
    id: '3',
    nameKey: 'supportContact3Name',
    descriptionKey: 'supportContact3Desc',
    website: 'https://proyectohombre.es/',
  },
];


export const DEFAULT_BADGES_KEYS: BadgeDefinition[] = [
  // Streaks
  { id: 'milestone_streak_1_day', nameKey: 'badgeMilestoneStreak1DayName', descriptionKey: 'badgeMilestoneStreak1DayDesc', icon: 'Star', requiredDays: 1 },
  { id: 'streak_7_days', nameKey: 'badgeStreak7Name', descriptionKey: 'badgeStreak7Desc', icon: 'Shield', requiredDays: 7 },
  { id: 'streak_30_days', nameKey: 'badgeStreak30Name', descriptionKey: 'badgeStreak30Desc', icon: 'Award', requiredDays: 30 },
  { id: 'streak_90_days', nameKey: 'badgeStreak90Name', descriptionKey: 'badgeStreak90Desc', icon: 'Trophy', requiredDays: 90 },
  // Goals
  { id: 'milestone_goal_1_completed', nameKey: 'badgeMilestoneGoal1CompletedName', descriptionKey: 'badgeMilestoneGoal1CompletedDesc', icon: 'CheckCircle', requiredGoals: 1 },
  { id: 'goal_5_completed', nameKey: 'badgeGoal5Name', descriptionKey: 'badgeGoal5Desc', icon: 'Target', requiredGoals: 5 },
  // Journal
  { id: 'badge_journal_3_entries', nameKey: 'badgeJournal3EntriesName', descriptionKey: 'badgeJournal3EntriesDesc', icon: 'FileText', requiredEntries: 3 },
  { id: 'journal_10_entries', nameKey: 'badgeJournal10Name', descriptionKey: 'badgeJournal10Desc', icon: 'BookOpen', requiredEntries: 10 },
  // Challenges
  { id: 'badge_challenge_7_day_id', nameKey: 'badgeChallenge7DayName', descriptionKey: 'badgeChallenge7DayDesc', icon: 'Zap' },
  { id: 'badge_challenge_30_day_id', nameKey: 'badgeChallenge30DayName', descriptionKey: 'badgeChallenge30DayDesc', icon: 'Gem' },
  { id: 'badge_challenge_60_day_id', nameKey: 'badgeChallenge60DayName', descriptionKey: 'badgeChallenge60DayDesc', icon: 'Star' },
  // App Usage
  // Removed app_first_audio_message and app_first_community_post badges
  { id: 'app_first_focus_session', nameKey: 'badgeAppFirstFocusSessionName', descriptionKey: 'badgeAppFirstFocusSessionDesc', icon: 'Focus' },
];

export const MOOD_OPTIONS: { value: Mood; labelKey: TranslationKey; icon: string }[] = [
    { value: Mood.Excellent, labelKey: "moodExcellent", icon: "😊" },
    { value: Mood.Good, labelKey: "moodGood", icon: "🙂" },
    { value: Mood.Okay, labelKey: "moodOkay", icon: "😐" },
    { value: Mood.Bad, labelKey: "moodBad", icon: "🙁" },
    { value: Mood.Awful, labelKey: "moodAwful", icon: "😞" },
];

export const INITIAL_HABITS: Habit[] = [];

export const XP_REWARDS = {
  JOURNAL_ENTRY: 10,
  GOAL_COMPLETED: 25,
  HABIT_COMPLETED: 5,
  CHALLENGE_DAY_MARKED: 2,
  EXERCISE_DAY_COMPLETED: 15,
  NUTRITION_DAY_COMPLETED: 15,
};

export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  {
    id: 'challenge_7_day',
    nameKey: 'challenge7DayName',
    descriptionKey: 'challenge7DayDesc',
    durationDays: 7,
    xpReward: 50,
    badgeToAwardId: 'badge_challenge_7_day_id',
    rewardDescriptionKey: 'challenge7DayRewardDesc',
  },
  {
    id: 'challenge_14_day',
    nameKey: 'challenge14DayName',
    descriptionKey: 'challenge14DayDesc',
    durationDays: 14,
    xpReward: 75,
    rewardDescriptionKey: 'challenge14DayRewardDesc',
  },
  {
    id: 'challenge_21_day',
    nameKey: 'challenge21DayName',
    descriptionKey: 'challenge21DayDesc',
    durationDays: 21,
    xpReward: 100,
    rewardDescriptionKey: 'challenge21DayRewardDesc',
  },
  {
    id: 'challenge_30_day',
    nameKey: 'challenge30DayName',
    descriptionKey: 'challenge30DayDesc',
    durationDays: 30,
    xpReward: 150,
    badgeToAwardId: 'badge_challenge_30_day_id',
    rewardDescriptionKey: 'challenge30DayRewardDesc',
  },
  {
    id: 'challenge_45_day',
    nameKey: 'challenge45DayName',
    descriptionKey: 'challenge45DayDesc',
    durationDays: 45,
    xpReward: 200,
    rewardDescriptionKey: 'challenge45DayRewardDesc',
  },
  {
    id: 'challenge_60_day',
    nameKey: 'challenge60DayName',
    descriptionKey: 'challenge60DayDesc',
    durationDays: 60,
    xpReward: 300,
    badgeToAwardId: 'badge_challenge_60_day_id',
    rewardDescriptionKey: 'challenge60DayRewardDesc',
  },
];

// Removed INITIAL_CHANNELS
