// Mock data services replacing Gemini API

const STUDY_MESSAGES = [
  "오늘도 한 걸음 성장했네요! 수고하셨습니다. 🌱",
  "꾸준함이 최고의 재능입니다! 멋져요. ✨",
  "집중하는 모습이 정말 아름다워요! 👍",
  "목표를 향해 나아가는 당신을 응원합니다! 🚀",
  "잠시 쉬어가도 괜찮아요, 정말 고생했어요. ☕"
];

const ACTIVITY_MESSAGES = [
  "건강한 신체에 건강한 정신이 깃듭니다! 💪",
  "작은 실천이 모여 큰 변화를 만듭니다. 🌿",
  "오늘도 알찬 하루를 보내고 계시네요! 👍",
  "나를 위한 소중한 시간, 정말 잘했어요! 💖",
  "활기찬 에너지가 여기까지 느껴져요! 🔥"
];

const PET_NAMES = [
  "몽글이", "푸름이", "단비", "별이", "구름이", 
  "마루", "사랑이", "토리", "호두", "두부"
];

// Parameters are prefixed with underscore to satisfy TypeScript's noUnusedParameters rule
export const generateEncouragement = async (_minutes: number, _task: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const randomIndex = Math.floor(Math.random() * STUDY_MESSAGES.length);
  return STUDY_MESSAGES[randomIndex];
};

export const generateActivityEncouragement = async (_activity: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const randomIndex = Math.floor(Math.random() * ACTIVITY_MESSAGES.length);
  return ACTIVITY_MESSAGES[randomIndex];
};

export const generatePetName = async (_petType: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const randomIndex = Math.floor(Math.random() * PET_NAMES.length);
  return PET_NAMES[randomIndex];
};