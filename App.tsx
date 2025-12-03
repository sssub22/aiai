import React, { useState, useEffect, useRef } from 'react';
import { PetVisual, XPBar } from './components/Visuals';
import { 
  Pet, User, ActivityRecord, PetStage, DailyTracking, 
  XP_PER_LEVEL, MAX_PET_LEVEL, DAILY_ACTIVITY_LIMIT, ACTIVITY_XP_REWARD, STUDY_XP_REWARD_CHUNK 
} from './types';
import { generateEncouragement, generateActivityEncouragement, generatePetName } from './services/gemini';
import { Home, Timer, BookOpen, Scroll, Play, Square, CheckCircle, Activity, Star, User as UserIcon, Trash2, KeyRound } from 'lucide-react';

// Utility to get today's date string
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Utility for unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const INITIAL_USER: User = {
  totalXP: 0,
  level: 1,
  name: '학생',
};

const INITIAL_PET: Pet = {
  id: generateId(),
  name: '알',
  stage: PetStage.EGG,
  currentXP: 0,
  type: 'Owl',
  birthDate: getTodayDate(),
};

// --- Landing / Auth Component ---
const LandingPage = ({ onConnect }: { onConnect: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-orange-50 p-6 text-center space-y-8">
      <div className="animate-bounce-in">
        <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto mb-6 border-4 border-indigo-100">
           <span className="text-6xl">🦉</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">나와 펫의 <span className="text-indigo-600">성장일기</span></h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          공부 습관을 기르고 나만의 펫을 키워보세요.<br/>
          함께 성장하는 즐거움이 기다리고 있습니다.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button 
          onClick={onConnect}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transform transition active:scale-95 flex items-center justify-center space-x-2"
        >
          <KeyRound className="w-5 h-5" />
          <span>API Key로 시작하기</span>
        </button>
        
        <p className="text-[10px] text-gray-400">
          * 원활한 펫 생성과 격려 메시지를 위해 Gemini API Key가 필요합니다.<br/>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-500">
            API Key 발급 및 과금 정책 확인하기
          </a>
        </p>
      </div>
    </div>
  );
};

export default function App() {
  // --- Auth State ---
  const [hasApiKey, setHasApiKey] = useState(false);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'home' | 'timer' | 'records' | 'collection'>('home');
  
  // Data State
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [currentPet, setCurrentPet] = useState<Pet>(INITIAL_PET);
  const [petCollection, setPetCollection] = useState<Pet[]>([]);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [dailyTracking, setDailyTracking] = useState<DailyTracking>({ date: getTodayDate(), activityCount: 0 });

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [studyTask, setStudyTask] = useState('');
  const [isStudyTaskSet, setIsStudyTaskSet] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Encouragement Modal State
  const [encouragement, setEncouragement] = useState<string | null>(null);

  // --- Effects ---

  // Check for API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore - window.aistudio is injected by the environment
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const has = await window.aistudio.hasSelectedApiKey();
        if (has) setHasApiKey(true);
      } else if (process.env.API_KEY) {
        // Fallback if environment already has it injected
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadedUser = localStorage.getItem('gt_user');
    const loadedPet = localStorage.getItem('gt_pet');
    const loadedCollection = localStorage.getItem('gt_collection');
    const loadedRecords = localStorage.getItem('gt_records');
    const loadedTracking = localStorage.getItem('gt_tracking');

    if (loadedUser) setUser(JSON.parse(loadedUser));
    if (loadedPet) setCurrentPet(JSON.parse(loadedPet));
    if (loadedCollection) setPetCollection(JSON.parse(loadedCollection));
    if (loadedRecords) setRecords(JSON.parse(loadedRecords));
    
    if (loadedTracking) {
      const parsedTracking = JSON.parse(loadedTracking);
      if (parsedTracking.date === getTodayDate()) {
        setDailyTracking(parsedTracking);
      } else {
        setDailyTracking({ date: getTodayDate(), activityCount: 0 });
      }
    }
  }, []);

  // Save data on change
  useEffect(() => { localStorage.setItem('gt_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('gt_pet', JSON.stringify(currentPet)); }, [currentPet]);
  useEffect(() => { localStorage.setItem('gt_collection', JSON.stringify(petCollection)); }, [petCollection]);
  useEffect(() => { localStorage.setItem('gt_records', JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem('gt_tracking', JSON.stringify(dailyTracking)); }, [dailyTracking]);

  // --- Logic Helpers ---

  const handleKeyConnect = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Assuming success if the dialog closes and promise resolves
        setHasApiKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    } else {
      alert("API Key selection is not supported in this environment.");
    }
  };

  const addXP = async (amount: number, source: string) => {
    // 1. Update User
    const newUserLevel = Math.floor((user.totalXP + amount) / 500) + 1;
    setUser(prev => ({
      ...prev,
      totalXP: prev.totalXP + amount,
      level: newUserLevel
    }));

    // 2. Update Pet
    let newPet = { ...currentPet, currentXP: currentPet.currentXP + amount };
    let leveledUp = false;

    // Check for Pet Level Up
    if (newPet.currentXP >= XP_PER_LEVEL) {
      const levelsGained = Math.floor(newPet.currentXP / XP_PER_LEVEL);
      const remainingXP = newPet.currentXP % XP_PER_LEVEL;
      
      const potentialStage = newPet.stage + levelsGained;
      
      if (potentialStage >= MAX_PET_LEVEL) {
        // Pet Reached Maturity
        newPet.stage = PetStage.ADULT;
        newPet.currentXP = XP_PER_LEVEL; // Cap at max
        completePet(newPet);
        return; // Exit as pet is reset
      } else {
        newPet.stage = potentialStage as PetStage;
        newPet.currentXP = remainingXP;
        leveledUp = true;
      }
    }

    setCurrentPet(newPet);
    if (leveledUp && source !== 'System') {
       // Optional: Toast or small notification could go here
    }
  };

  const completePet = async (pet: Pet) => {
    // Generate a final name if it's still generic
    let finalName = pet.name;
    if (pet.name === '알') {
       finalName = await generatePetName(pet.type);
    }

    const completedPet: Pet = {
      ...pet,
      name: finalName,
      completedDate: getTodayDate(),
    };

    setPetCollection(prev => [completedPet, ...prev]);
    setEncouragement(`축하합니다! ${finalName} 펫이 성장을 마쳤습니다! 도감에 등록되었습니다.`);
    
    // Reset to new Egg
    setCurrentPet({
      id: generateId(),
      name: '알',
      stage: PetStage.EGG,
      currentXP: 0,
      type: 'Owl', // Could randomize this later
      birthDate: getTodayDate(),
    });
  };

  // --- Actions ---

  const handleStudyComplete = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    // 10 XP per 30 mins
    const xpEarned = Math.floor(minutes / 30) * STUDY_XP_REWARD_CHUNK;
    
    const newRecord: ActivityRecord = {
      id: generateId(),
      type: 'STUDY',
      label: studyTask || '자율 학습',
      duration: minutes,
      xpEarned: xpEarned,
      timestamp: new Date().toISOString(),
      isPublic: true,
    };

    setRecords(prev => [newRecord, ...prev]);
    addXP(xpEarned, 'Study');

    // Show immediate feedback to prevent delay
    setEncouragement("수고하셨습니다! 펫이 칭찬을 생각하고 있어요... 💭");

    // Fetch AI encouragement in background
    generateEncouragement(minutes, studyTask).then(message => {
        setEncouragement(message);
    });
    
    // Reset Timer
    setTimerSeconds(0);
    setIsStudyTaskSet(false);
    setStudyTask('');
  };

  const handleActivitySubmit = (activityName: string) => {
    if (dailyTracking.activityCount >= DAILY_ACTIVITY_LIMIT) {
      alert(`하루에 ${DAILY_ACTIVITY_LIMIT}회까지만 적극성 활동을 기록할 수 있어요!`);
      return;
    }

    const xpEarned = ACTIVITY_XP_REWARD;
    
    const newRecord: ActivityRecord = {
      id: generateId(),
      type: 'ACTIVITY',
      label: activityName,
      xpEarned: xpEarned,
      timestamp: new Date().toISOString(),
      isPublic: true,
    };

    setRecords(prev => [newRecord, ...prev]);
    setDailyTracking(prev => ({ ...prev, activityCount: prev.activityCount + 1 }));
    addXP(xpEarned, 'Activity');

    // Show immediate feedback
    setEncouragement("멋진 활동이에요! 펫이 감동받고 있어요... ✨");

    // Fetch AI encouragement for activity
    generateActivityEncouragement(activityName).then(message => {
        setEncouragement(message);
    });
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
        setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // --- Timer Controls ---
  const toggleTimer = () => {
    if (timerRunning) {
      // Stop
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimerRunning(false);
      handleStudyComplete(timerSeconds);
    } else {
      // Start
      if (!studyTask.trim()) {
        alert("공부할 내용을 먼저 입력해주세요!");
        return;
      }
      setIsStudyTaskSet(true);
      setTimerRunning(true);
      intervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Render Functions ---

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-full">
                <UserIcon className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-gray-500">내 레벨</p>
                <p className="font-bold text-indigo-900">Lv.{user.level}</p>
            </div>
        </div>
        <div className="text-right">
             <p className="text-xs text-gray-500">총 획득 포인트</p>
             <p className="font-bold text-orange-600">{user.totalXP.toLocaleString()} XP</p>
        </div>
      </header>

      {/* Main Pet Area */}
      <section className="flex flex-col items-center">
        <div className="relative mb-6">
           <PetVisual stage={currentPet.stage} type={currentPet.type} />
           <div className="absolute -bottom-3 bg-white px-4 py-1 rounded-full shadow-md text-sm font-bold text-gray-700">
             {currentPet.name}
           </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
            <XPBar 
                current={currentPet.currentXP} 
                max={XP_PER_LEVEL} 
                label={`다음 단계까지 (${currentPet.currentXP}/${XP_PER_LEVEL})`} 
            />
             <p className="text-xs text-center text-gray-400">
                Tip: 30분 공부마다 10 XP 획득!
            </p>
        </div>
      </section>

      {/* Activity Logging */}
      <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            적극성 활동 기록
            <span className="ml-auto text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {dailyTracking.activityCount}/{DAILY_ACTIVITY_LIMIT}회 완료
            </span>
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
            <button onClick={() => handleActivitySubmit('가벼운 산책')} className="p-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-700 text-sm font-medium transition">🌿 산책하기</button>
            <button onClick={() => handleActivitySubmit('방 청소')} className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 text-sm font-medium transition">🧹 방 청소</button>
            <button onClick={() => handleActivitySubmit('물 마시기')} className="p-3 bg-cyan-50 hover:bg-cyan-100 rounded-xl text-cyan-700 text-sm font-medium transition">💧 물 마시기</button>
            <button onClick={() => handleActivitySubmit('친구 연락')} className="p-3 bg-pink-50 hover:bg-pink-100 rounded-xl text-pink-700 text-sm font-medium transition">📞 친구 연락</button>
        </div>
        <div className="relative">
            <input 
                type="text" 
                placeholder="직접 입력 (예: 독서, 명상)"
                className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if(val) {
                            handleActivitySubmit(val);
                            e.currentTarget.value = '';
                        }
                    }
                }}
            />
            <button className="absolute right-2 top-2 p-1 bg-green-500 text-white rounded-lg">
                <CheckCircle className="w-5 h-5" />
            </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">활동 1회당 5 XP 획득 (하루 최대 5번)</p>
      </section>
    </div>
  );

  const renderTimer = () => (
    <div className="flex flex-col items-center justify-center h-full pb-20 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">공부 타이머</h2>
        <p className="text-gray-500 text-sm">30분 집중할 때마다 10 XP를 얻어요!</p>
      </div>

      <div className="w-64 h-64 rounded-full border-8 border-indigo-100 flex items-center justify-center bg-white shadow-inner relative">
        {timerRunning && <div className="absolute inset-0 rounded-full border-8 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin opacity-30"></div>}
        <div className="text-5xl font-mono font-bold text-indigo-900 tracking-wider">
          {formatTime(timerSeconds)}
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 px-6">
        {!isStudyTaskSet ? (
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">오늘의 목표</label>
                <input 
                    type="text" 
                    value={studyTask}
                    onChange={(e) => setStudyTask(e.target.value)}
                    placeholder="무엇을 공부할까요? (예: 수학 문제집)"
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                />
            </div>
        ) : (
            <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-indigo-900 font-medium">진행 중: {studyTask}</p>
            </div>
        )}

        <button 
            onClick={toggleTimer}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center space-x-2 ${
                timerRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
        >
            {timerRunning ? (
                <>
                    <Square className="fill-current w-5 h-5" /> 
                    <span>공부 종료 및 기록하기</span>
                </>
            ) : (
                <>
                    <Play className="fill-current w-5 h-5" /> 
                    <span>공부 시작하기</span>
                </>
            )}
        </button>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="pb-20 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 px-1">나의 기록장</h2>
      
      {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <Scroll className="w-16 h-16 mb-4 opacity-20" />
              <p>아직 기록이 없습니다.</p>
              <p className="text-sm">첫 공부를 시작해보세요!</p>
          </div>
      ) : (
          <div className="space-y-3 overflow-y-auto no-scrollbar">
            {records.map((record) => (
                <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`p-3 rounded-full flex-shrink-0 ${record.type === 'STUDY' ? 'bg-indigo-50' : 'bg-green-50'}`}>
                            {record.type === 'STUDY' ? <BookOpen className="w-5 h-5 text-indigo-500" /> : <Activity className="w-5 h-5 text-green-500" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate pr-2">{record.label}</p>
                            <p className="text-xs text-gray-500 truncate">
                                {new Date(record.timestamp).toLocaleDateString()} • {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {record.type === 'STUDY' && ` • ${record.duration}분`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {record.xpEarned > 0 ? (
                            <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                +{record.xpEarned} XP
                            </div>
                        ) : (
                            <div className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                기록됨
                            </div>
                        )}
                        <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            aria-label="기록 삭제"
                        >
                            <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );

  const renderCollection = () => (
    <div className="pb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 px-1">명예의 전당</h2>
        <div className="grid grid-cols-2 gap-4">
            {petCollection.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                    <Star className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-center">아직 졸업한 펫이 없습니다.</p>
                    <p className="text-center text-sm mt-1">Lv.5까지 키워서 도감을 채워보세요!</p>
                </div>
            ) : (
                petCollection.map((pet) => (
                    <div key={pet.id} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Star className="w-12 h-12 text-yellow-500 fill-current" />
                        </div>
                        <div className="text-5xl mb-2">🦉</div>
                        <h3 className="font-bold text-gray-800">{pet.name}</h3>
                        <p className="text-xs text-gray-500">{pet.completedDate} 졸업</p>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  // If we don't have an API key yet, show the landing page
  if (!hasApiKey) {
    return <LandingPage onConnect={handleKeyConnect} />;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#F9FAFB] flex flex-col relative overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="pt-8 pb-2 px-6 bg-white sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-indigo-600 mr-2">나와 펫의</span>성장일기
        </h1>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'timer' && renderTimer()}
        {activeTab === 'records' && renderRecords()}
        {activeTab === 'collection' && renderCollection()}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center z-20 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <Home className={`w-6 h-6 ${activeTab === 'home' && 'fill-current opacity-20'}`} />
            <span className="text-[10px] font-medium">홈</span>
        </button>
        <button 
            onClick={() => setActiveTab('timer')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'timer' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <Timer className={`w-6 h-6 ${activeTab === 'timer' && 'fill-current opacity-20'}`} />
            <span className="text-[10px] font-medium">타이머</span>
        </button>
        <button 
            onClick={() => setActiveTab('records')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'records' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <BookOpen className={`w-6 h-6 ${activeTab === 'records' && 'fill-current opacity-20'}`} />
            <span className="text-[10px] font-medium">기록</span>
        </button>
        <button 
            onClick={() => setActiveTab('collection')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'collection' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <Star className={`w-6 h-6 ${activeTab === 'collection' && 'fill-current opacity-20'}`} />
            <span className="text-[10px] font-medium">펫도감</span>
        </button>
      </nav>

      {/* Encouragement Modal */}
      {encouragement && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform scale-100 animate-bounce-in text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">잘 했어요!</h3>
                <p className="text-gray-600 mb-6">{encouragement}</p>
                <button 
                    onClick={() => setEncouragement(null)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                >
                    확인
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

// Icon wrapper to avoid type errors if needed (though lucide-react works directly)
function Trophy(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
}