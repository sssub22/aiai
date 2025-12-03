import { GoogleGenAI } from "@google/genai";

// Helper to get the AI instance lazily. 
// This ensures we pick up the API_KEY from process.env *after* the user has selected it in the UI.
const getAi = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const generateEncouragement = async (minutes: number, task: string): Promise<string> => {
  const ai = getAi();
  // We can check if apiKey is actually present, but the library will throw/fail gracefully if empty.
  // The App.tsx flow ensures we try to get a key before calling this.
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 '${task}' 공부를 ${minutes}분 동안 완료했습니다. 
      사용자를 위한 짧고 따뜻한 격려의 한 마디를 한국어로 작성해주세요. (20자 이내, 이모지 포함)`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "오늘도 한 걸음 성장했네요! 수고하셨습니다. 🌱";
  }
};

export const generateActivityEncouragement = async (activity: string): Promise<string> => {
  const ai = getAi();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자가 '${activity}' 활동을 완료했습니다.
      사용자를 위한 짧고 활기찬 칭찬의 한 마디를 한국어로 작성해주세요. (20자 이내, 이모지 포함)`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "오늘도 알찬 하루를 보내고 계시네요! 👍";
  }
};

export const generatePetName = async (petType: string): Promise<string> => {
  const ai = getAi();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `새로 태어난 '${petType}' 펫을 위한 귀여운 이름을 하나만 지어주세요. 설명 없이 이름만 출력하세요. (예: 몽글이)`,
    });
    return response.text.trim();
  } catch (error) {
    return "새로운 친구";
  }
};