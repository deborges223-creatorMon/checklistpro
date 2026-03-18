import React, { useState, useEffect, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  LayoutDashboard, 
  Settings, 
  AlertCircle,
  Trophy,
  Calendar,
  ArrowUpRight,
  Zap,
  History as HistoryIcon,
  ChevronRight,
  ChevronDown,
  Bell,
  BellOff,
  Clock,
  X,
  Flame,
  Coins,
  DollarSign,
  Wallet,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Landmark,
  Banknote,
  ArrowDownAZ,
  ArrowUpAZ,
  ClockArrowDown,
  ClockArrowUp,
  Sun,
  Moon,
  User,
  Camera,
  Edit2,
  Check,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BettingHouse, ChecklistState } from './types';

const STORAGE_KEY = 'betting_checklist_data';

const ICON_LIBRARY = [
  { id: 'Coins', icon: Coins },
  { id: 'DollarSign', icon: DollarSign },
  { id: 'Wallet', icon: Wallet },
  { id: 'Target', icon: Target },
  { id: 'BarChart3', icon: BarChart3 },
  { id: 'PieChart', icon: PieChart },
  { id: 'TrendingUp', icon: TrendingUp },
  { id: 'Landmark', icon: Landmark },
  { id: 'Banknote', icon: Banknote },
  { id: 'Zap', icon: Zap },
  { id: 'Trophy', icon: Trophy },
  { id: 'Flame', icon: Flame },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618365908648-e71bc5716c1e?q=80&w=2560&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=2560&auto=format&fit=crop',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Abstract liquid
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop', // Tech/Cyber
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2671&auto=format&fit=crop', // Space/Stars
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2574&auto=format&fit=crop', // Gradient mesh
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop', // Mountains night
];

const HouseIcon = ({ house, size = 20, className = "" }: { house: BettingHouse, size?: number, className?: string }) => {
  if (house.iconType === 'lucide' && house.iconValue) {
    const IconComponent = ICON_LIBRARY.find(i => i.id === house.iconValue)?.icon;
    if (IconComponent) {
      return <IconComponent size={size} className={className} />;
    }
  }

  // Default fallback: First letter
  return <span className={`font-bold text-zinc-600 ${className}`}>{house.name.charAt(0).toUpperCase()}</span>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'manage' | 'history' | 'finance'>('checklist');
  const [state, setState] = useState<ChecklistState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved ? JSON.parse(saved) : { 
      houses: [], 
      completedToday: [], 
      lastResetDate: '', 
      history: {}, 
      earnings: {},
      spins: {},
      globalReminderTime: '',
      currentStreak: 0,
      bestStreak: 0,
      streakGoal: 30
    };
    if (!initial.history) initial.history = {};
    if (!initial.earnings) initial.earnings = {};
    if (!initial.spins) initial.spins = {};
    if (initial.currentStreak === undefined) initial.currentStreak = 0;
    if (initial.bestStreak === undefined) initial.bestStreak = 0;
    if (initial.streakGoal === undefined) initial.streakGoal = 30;
    if (!initial.userProfile) initial.userProfile = { name: 'Usuário', avatarUrl: '' };
    return initial;
  });

  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [selectedIconType, setSelectedIconType] = useState<'lucide'>('lucide');
  const [selectedLucideIcon, setSelectedLucideIcon] = useState('Coins');
  const [expandedHouse, setExpandedHouse] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeReminders, setActiveReminders] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'>('date-desc');
  const [selectedFinanceMonth, setSelectedFinanceMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState(state.userProfile?.name || 'Usuário');
  const [editProfileAvatar, setEditProfileAvatar] = useState(state.userProfile?.avatarUrl || '');
  const [editProfileCover, setEditProfileCover] = useState(state.userProfile?.coverUrl || '');
  const [editProfileBio, setEditProfileBio] = useState(state.userProfile?.bio || '');
  const [showProfileEditForm, setShowProfileEditForm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('checklistpro-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Persist theme
  useEffect(() => {
    localStorage.setItem('checklistpro-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Check for daily reset
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastResetDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if all houses were completed yesterday to maintain streak
      // This is a bit tricky because state.completedToday is already reset if we just loaded
      // We should check if the lastResetDate was yesterday and if all houses were done then.
      
      setState(prev => {
        let newStreak = prev.currentStreak;
        
        // If we missed a day (lastResetDate is not yesterday), reset streak
        if (prev.lastResetDate && prev.lastResetDate !== yesterdayStr && prev.lastResetDate !== today) {
          newStreak = 0;
        } else if (prev.lastResetDate === yesterdayStr) {
          // If last reset was yesterday, check if it was completed
          const allDoneYesterday = prev.houses.length > 0 && prev.completedToday.length === prev.houses.length;
          if (!allDoneYesterday) {
            newStreak = 0;
          }
        }

        return {
          ...prev,
          completedToday: [],
          lastResetDate: today,
          currentStreak: newStreak
        };
      });
    }
  }, [state.lastResetDate, state.houses.length, state.completedToday.length]);

  // Notification Permission Check
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Reminder Check Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      state.houses.forEach(house => {
        const isCompleted = state.completedToday.includes(house.id);
        const reminderTime = house.reminderTime || state.globalReminderTime;
        
        if (!isCompleted && reminderTime === currentTime) {
          // Trigger internal reminder if not already active
          if (!activeReminders.includes(house.id)) {
            setActiveReminders(prev => [...prev, house.id]);
            
            // Trigger browser notification if permitted
            if (notificationsEnabled) {
              new Notification(`Lembrete: ${house.name}`, {
                body: `Está na hora de realizar seu login diário na ${house.name}!`
              });
            }
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.houses, state.completedToday, state.globalReminderTime, notificationsEnabled, activeReminders]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const addHouse = (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    let formattedUrl = newUrl;
    if (!/^https?:\/\//i.test(newUrl)) {
      formattedUrl = `https://${newUrl}`;
    }

    const newHouse: BettingHouse = {
      id: crypto.randomUUID(),
      name: newName,
      url: formattedUrl,
      reminderTime: newReminderTime || undefined,
      createdAt: Date.now(),
      iconType: 'lucide',
      iconValue: selectedLucideIcon
    };

    setState(prev => ({
      ...prev,
      houses: [...prev.houses, newHouse],
      history: { ...prev.history, [newHouse.id]: [] }
    }));
    setNewName('');
    setNewUrl('');
    setNewReminderTime('');
    setSelectedLucideIcon('Coins');
  };

  const updateGlobalReminder = (time: string) => {
    setState(prev => ({ ...prev, globalReminderTime: time }));
  };

  const updateStreakGoal = (goal: number) => {
    setState(prev => ({ ...prev, streakGoal: goal }));
  };

  const updateHouseReminder = (id: string, time: string) => {
    setState(prev => ({
      ...prev,
      houses: prev.houses.map(h => h.id === id ? { ...h, reminderTime: time } : h)
    }));
  };

  const updateEarning = (houseId: string, date: string, amount: number) => {
    setState(prev => {
      const dateEarnings = prev.earnings[date] || {};
      return {
        ...prev,
        earnings: {
          ...prev.earnings,
          [date]: {
            ...dateEarnings,
            [houseId]: amount
          }
        }
      };
    });
  };

  const updateSpin = (houseId: string, date: string, amount: number) => {
    setState(prev => {
      const dateSpins = prev.spins[date] || {};
      return {
        ...prev,
        spins: {
          ...prev.spins,
          [date]: {
            ...dateSpins,
            [houseId]: amount
          }
        }
      };
    });
  };

  const deleteHouse = (id: string) => {
    setState(prev => {
      const newHistory = { ...prev.history };
      delete newHistory[id];
      return {
        ...prev,
        houses: prev.houses.filter(h => h.id !== id),
        completedToday: prev.completedToday.filter(houseId => houseId !== id),
        history: newHistory
      };
    });
  };

  const handleLogin = (house: BettingHouse) => {
    window.open(house.url, '_blank');
    const today = new Date().toISOString().split('T')[0];
    
    // Clear active reminder for this house
    setActiveReminders(prev => prev.filter(id => id !== house.id));

    setState(prev => {
      const isAlreadyCompletedToday = prev.completedToday.includes(house.id);
      const houseHistory = prev.history[house.id] || [];
      const hasDateInHistory = houseHistory.includes(today);

      const newCompletedToday = isAlreadyCompletedToday ? prev.completedToday : [...prev.completedToday, house.id];
      
      let newStreak = prev.currentStreak;
      let newBestStreak = prev.bestStreak;

      // Check if this completion finishes the day
      if (prev.houses.length > 0 && newCompletedToday.length === prev.houses.length && !isAlreadyCompletedToday) {
        newStreak += 1;
        if (newStreak > newBestStreak) {
          newBestStreak = newStreak;
        }
        
        // Celebration!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#ffffff']
        });
      }

      return {
        ...prev,
        completedToday: newCompletedToday,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        history: {
          ...prev.history,
          [house.id]: hasDateInHistory ? houseHistory : [today, ...houseHistory].slice(0, 30)
        }
      };
    });
  };

  const progress = state.houses.length > 0 
    ? Math.round((state.completedToday.length / state.houses.length) * 100) 
    : 0;

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getSortedHouses = () => {
    return [...state.houses].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'date-desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });
  };

  const sortedHouses = getSortedHouses();

  const getEarningsForDate = (date: string): number => {
    const dayEarnings = state.earnings[date];
    if (!dayEarnings) return 0;
    return (Object.values(dayEarnings) as number[]).reduce((sum: number, val: number) => sum + val, 0);
  };

  const getSpinsForDate = (date: string): number => {
    const daySpins = state.spins[date];
    if (!daySpins) return 0;
    return (Object.values(daySpins) as number[]).reduce((sum: number, val: number) => sum + val, 0);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEarnings = getEarningsForDate(todayStr);
  const todaySpins = getSpinsForDate(todayStr);

  const getWeekEarnings = (): number => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      total += getEarningsForDate(d.toISOString().split('T')[0]);
    }
    return total;
  };

  const getWeekEarningsData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      data.push({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        date: dateStr,
        earnings: getEarningsForDate(dateStr)
      });
    }
    return data;
  };

  const getEarningsForMonth = (monthStr: string): number => {
    let total = 0;
    Object.keys(state.earnings).forEach(date => {
      if (date.startsWith(monthStr)) {
        total += getEarningsForDate(date);
      }
    });
    return total;
  };

  const getHouseEarningsForMonth = (monthStr: string, houseId: string): number => {
    let total = 0;
    Object.keys(state.earnings).forEach(date => {
      if (date.startsWith(monthStr) && state.earnings[date][houseId]) {
        total += state.earnings[date][houseId];
      }
    });
    return total;
  };

  const getMonthEarnings = (): number => {
    const currentMonth = todayStr.substring(0, 7); // YYYY-MM
    return getEarningsForMonth(currentMonth);
  };

  const getWeekSpins = (): number => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      total += getSpinsForDate(d.toISOString().split('T')[0]);
    }
    return total;
  };

  const getSpinsForMonth = (monthStr: string): number => {
    let total = 0;
    Object.keys(state.spins).forEach(date => {
      if (date.startsWith(monthStr)) {
        total += getSpinsForDate(date);
      }
    });
    return total;
  };

  const getMonthSpins = (): number => {
    const currentMonth = todayStr.substring(0, 7); // YYYY-MM
    return getSpinsForMonth(currentMonth);
  };

  const weekEarnings = getWeekEarnings();
  const weekSpins = getWeekSpins();
  const weekEarningsData = getWeekEarningsData();
  const monthEarnings = getMonthEarnings();
  const monthSpins = getMonthSpins();

  const availableMonths = Array.from(new Set([
    todayStr.substring(0, 7),
    ...Object.keys(state.earnings).map(date => date.substring(0, 7))
  ])).sort().reverse();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      userProfile: {
        name: editProfileName || 'Usuário',
        avatarUrl: editProfileAvatar,
        coverUrl: editProfileCover,
        bio: editProfileBio
      }
    }));
    setIsEditingProfile(false);
  };

  const totalEarnings: number = (Object.values(state.earnings) as Record<string, number>[]).reduce((sum: number, dayEarnings: Record<string, number>) => {
    return sum + (Object.values(dayEarnings) as number[]).reduce((daySum: number, val: number) => daySum + val, 0);
  }, 0);

  const totalSpins: number = (Object.values(state.spins) as Record<string, number>[]).reduce((sum: number, daySpins: Record<string, number>) => {
    return sum + (Object.values(daySpins) as number[]).reduce((daySum: number, val: number) => daySum + val, 0);
  }, 0);

  const totalCompletedTasks: number = (Object.values(state.history) as string[][]).reduce((sum: number, dates: string[]) => sum + dates.length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Internal Notification Toasts */}
      <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {activeReminders.map(houseId => {
            const house = state.houses.find(h => h.id === houseId);
            if (!house) return null;
            return (
              <motion.div
                key={houseId}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="pointer-events-auto glass p-4 rounded-2xl shadow-2xl border-emerald-500/30 flex items-center gap-4 min-w-[300px]"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                  <Bell className="animate-bounce" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white leading-tight">Lembrete: {house.name}</h4>
                  <p className="text-xs text-zinc-400">Hora de realizar seu login!</p>
                </div>
                <button 
                  onClick={() => setActiveReminders(prev => prev.filter(id => id !== houseId))}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Actions */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-3">
        <button
          onClick={() => setIsEditingProfile(true)}
          className="w-11 h-11 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-lg shadow-black/20 flex items-center justify-center overflow-hidden group"
          title="Perfil"
        >
          {state.userProfile?.avatarUrl ? (
            <img src={state.userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="group-hover:text-emerald-400 transition-colors" />
          )}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-11 h-11 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-lg shadow-black/20 flex items-center justify-center group"
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="group-hover:text-emerald-400 transition-colors" />
          ) : (
            <Moon size={20} className="group-hover:text-emerald-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 h-auto sm:h-20 py-4 sm:py-0 sm:pr-20">
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
                <CheckCircle2 className="text-emerald-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-gradient">
                Checklist<span className="text-emerald-500">Pro</span>
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Olá, {state.userProfile?.name || 'Usuário'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <nav className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 flex-1 sm:flex-none">
              {[
                { id: 'checklist', icon: LayoutDashboard, label: 'Painel' },
                { id: 'finance', icon: DollarSign, label: 'Finanças' },
                { id: 'manage', icon: Settings, label: 'Ajustes' },
                { id: 'history', icon: HistoryIcon, label: 'Histórico' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon size={16} className={activeTab === tab.id ? "text-emerald-400" : ""} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'checklist' ? (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-10"
            >
              {/* Hero Stats Section */}
              <section className="animate-slam space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Landmark size={120} className="text-emerald-500" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                      <div>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Ganhos</h2>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-end gap-3">
                            <span className={`text-5xl sm:text-6xl font-display font-bold leading-none ${todayEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              R$ {todayEarnings.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-zinc-500 mb-1">Hoje</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 font-bold">
                            <span>R$ {monthEarnings.toFixed(2)}</span>
                            <span className="text-xs uppercase tracking-wider text-zinc-600">no Mês</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>Mês Atual</span>
                          <span>{new Date().toLocaleDateString('pt-BR', { month: 'long' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Target size={120} className="text-lime-500" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                      <div>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Rodadas Grátis</h2>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-end gap-3">
                            <span className="text-5xl sm:text-6xl font-display font-bold leading-none text-lime-400">
                              {todaySpins}
                            </span>
                            <span className="text-sm font-bold text-zinc-500 mb-1">Hoje</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 font-bold">
                            <span>{monthSpins} giros</span>
                            <span className="text-xs uppercase tracking-wider text-zinc-600">no Mês</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>Total Acumulado</span>
                          <span>Giros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp size={120} className="text-emerald-500" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                      <div>
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Progresso Diário</h2>
                        <div className="flex items-end gap-3">
                          <span className="text-6xl sm:text-7xl font-display font-bold text-white leading-none">
                            {Math.round((state.completedToday.length / (state.houses.length || 1)) * 100)}%
                          </span>
                          <div className="flex flex-col mb-2">
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <ArrowUpRight size={16} />
                              {state.completedToday.length}/{state.houses.length}
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">Concluídos</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>Eficiência</span>
                          <span>Meta: 100%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(state.completedToday.length / (state.houses.length || 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 flex flex-col justify-between border-emerald-500/10 relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                      <Flame size={100} className="text-orange-500" />
                    </div>
                    
                    <div>
                      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Streak Atual</h2>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                          <Flame size={28} fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-4xl font-display font-bold text-white">{state.currentStreak}</div>
                          <div className="text-xs text-zinc-500 font-medium">Dias seguidos</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Melhor Marca</div>
                          <div className="text-xl font-display font-bold text-zinc-300">{state.bestStreak}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Meta</div>
                          <div className="text-xl font-display font-bold text-emerald-500">{state.streakGoal}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Checklist Section */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Sua Lista</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ativo</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSortOption(sortOption === 'name-asc' ? 'name-desc' : 'name-asc')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        sortOption.startsWith('name') ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {sortOption === 'name-asc' ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />}
                      Nome
                    </button>
                    <button
                      onClick={() => setSortOption(sortOption === 'date-desc' ? 'date-asc' : 'date-desc')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        sortOption.startsWith('date') ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {sortOption === 'date-desc' ? <ClockArrowDown size={14} /> : <ClockArrowUp size={14} />}
                      Data
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {sortedHouses.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-[2rem] border-dashed border-zinc-800">
                      <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl">
                        <AlertCircle className="text-zinc-600" size={40} />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white mb-2">Nenhum alvo definido</h3>
                      <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">Comece adicionando suas casas de apostas na aba de ajustes para iniciar seu streak.</p>
                      <button 
                        onClick={() => setActiveTab('manage')}
                        className="mt-8 px-8 py-3 bg-white text-zinc-950 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                      >
                        Configurar Agora
                      </button>
                    </div>
                  ) : (
                    sortedHouses.map((house, index) => {
                      const isCompleted = state.completedToday.includes(house.id);
                      const reminderTime = house.reminderTime || state.globalReminderTime;
                      
                      return (
                        <motion.div 
                          key={house.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            scale: isCompleted ? 0.98 : 1,
                          }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 30,
                            delay: index * 0.05 
                          }}
                          className={`group relative glass-card rounded-[1.5rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-500 ${
                            !isCompleted && 'hover:bg-zinc-900/40 hover:border-white/10 hover:shadow-emerald-500/5'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden shrink-0 ${
                              isCompleted 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-zinc-900 text-zinc-500 group-hover:text-emerald-400 group-hover:bg-zinc-800 border border-white/5'
                            }`}>
                              <AnimatePresence mode="wait">
                                {isCompleted ? (
                                  <motion.div
                                    key="completed"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 45 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                  >
                                    <CheckCircle2 size={28} />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="pending"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <HouseIcon house={house} size={28} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            <div className="min-w-0">
                              <h3 className={`text-lg font-bold tracking-tight transition-all duration-500 truncate ${
                                isCompleted ? 'text-zinc-600 line-through' : 'text-white'
                              }`}>
                                {house.name}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Link</span>
                                  <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[150px]">{house.url.replace(/^https?:\/\//, '')}</span>
                                </div>
                                {reminderTime && !isCompleted && (
                                  <div className="flex items-center gap-1.5 text-emerald-500/50">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold">{reminderTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                            {isCompleted && (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5 flex-1">
                                  <span className="text-zinc-500 font-bold text-sm">R$</span>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={state.earnings[new Date().toISOString().split('T')[0]]?.[house.id] || ''}
                                    onChange={(e) => updateEarning(house.id, new Date().toISOString().split('T')[0], parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-none outline-none text-white font-bold w-full sm:w-20 text-right"
                                  />
                                </div>
                                <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5 flex-1" title="Rodadas Grátis Recebidas">
                                  <Target size={14} className="text-lime-500" />
                                  <input
                                    type="number"
                                    placeholder="Rodadas"
                                    value={state.spins[new Date().toISOString().split('T')[0]]?.[house.id] || ''}
                                    onChange={(e) => updateSpin(house.id, new Date().toISOString().split('T')[0], parseInt(e.target.value) || 0)}
                                    className="bg-transparent border-none outline-none text-white font-bold w-full sm:w-16 text-right placeholder:text-zinc-600 placeholder:font-medium"
                                  />
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => handleLogin(house)}
                              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-500 w-full sm:w-auto active:scale-95 ${
                                isCompleted 
                                  ? 'bg-zinc-900/50 text-zinc-600 border border-white/5' 
                                  : 'bg-white text-zinc-950 hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20'
                              }`}
                            >
                              {isCompleted ? 'Acessar Novamente' : 'Acessar'}
                              <ArrowUpRight size={16} className={isCompleted ? "opacity-30" : "opacity-100"} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </section>
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3">
                  <HistoryIcon size={20} className="sm:size-6 text-emerald-500" />
                  Histórico
                </h2>
                <div className="flex items-center gap-4 sm:gap-6 bg-zinc-900/50 px-4 sm:px-5 py-2.5 rounded-2xl border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Atual</span>
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm sm:text-base">
                      <Flame size={14} fill="currentColor" />
                      <span>{state.currentStreak}d</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recorde</span>
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm sm:text-base">
                      <Trophy size={14} />
                      <span>{state.bestStreak}d</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meta</span>
                    <div className="flex items-center gap-1.5 text-blue-500 font-bold text-sm sm:text-base">
                      <Zap size={14} fill="currentColor" />
                      <span>{state.streakGoal}d</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Atividade por Casa</h2>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Últimos 7 dias</div>
                </div>

                {state.houses.length === 0 ? (
                  <div className="text-center py-20 glass-card rounded-3xl border-dashed border-zinc-800">
                    <p className="text-zinc-500">Nenhum histórico disponível.</p>
                  </div>
                ) : (
                  state.houses.map((house) => {
                    const houseHistory = state.history[house.id] || [];
                    const isExpanded = expandedHouse === house.id;
                    
                    return (
                      <motion.div 
                        key={house.id} 
                        layout
                        className="glass-card rounded-2xl overflow-hidden transition-all duration-500 group"
                      >
                        <button 
                          onClick={() => setExpandedHouse(isExpanded ? null : house.id)}
                          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 border border-white/5 shrink-0 group-hover:text-emerald-400 transition-colors">
                              <HouseIcon house={house} size={24} />
                            </div>
                            <div className="text-left min-w-0">
                              <h3 className="font-bold text-white text-base truncate">{house.name}</h3>
                              <p className="text-xs text-zinc-500 font-medium">{houseHistory.length} logins registrados</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex gap-1.5">
                              {last7Days.map(date => (
                                <div 
                                  key={date} 
                                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                    houseHistory.includes(date) 
                                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                                      : 'bg-zinc-800'
                                  }`}
                                  title={date}
                                />
                              ))}
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 transition-all ${isExpanded ? 'bg-zinc-800 text-white' : ''}`}>
                              <ChevronDown size={20} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                              className="border-t border-white/5 bg-black/20"
                            >
                              <div className="p-6 space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Histórico Completo (30 dias)</h4>
                                {houseHistory.length === 0 ? (
                                  <p className="text-sm text-zinc-600 italic">Nenhum registro encontrado para esta casa.</p>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {houseHistory.map(date => (
                                      <div key={date} className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-xs font-bold text-zinc-300">
                                          {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : activeTab === 'finance' ? (
            <motion.div
              key="finance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3">
                  <DollarSign size={20} className="sm:size-6 text-emerald-500" />
                  Finanças
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Coins size={100} className="text-emerald-500" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Hoje</h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-3">
                          <span className={`text-5xl font-display font-bold leading-none ${todayEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            R$ {todayEarnings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-lime-400 font-bold">
                          <Target size={16} />
                          <span>{todaySpins} giros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={100} className="text-emerald-500" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Semana</h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-3">
                          <span className={`text-5xl font-display font-bold leading-none ${weekEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            R$ {weekEarnings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-lime-400 font-bold">
                          <Target size={16} />
                          <span>{weekSpins} giros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Landmark size={100} className="text-emerald-500" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Mês</h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-3">
                          <span className={`text-5xl font-display font-bold leading-none ${monthEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            R$ {monthEarnings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-lime-400 font-bold">
                          <Target size={16} />
                          <span>{monthSpins} giros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8 mt-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Ganhos da Última Semana</h2>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => `R$${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganhos']}
                        labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                      />
                      <Bar dataKey="earnings" radius={[6, 6, 6, 6]} maxBarSize={50}>
                        {weekEarningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.earnings >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Ganhos por Casa (Hoje)</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.houses.map(house => {
                    const houseEarning = state.earnings[todayStr]?.[house.id] || 0;
                    const houseSpins = state.spins[todayStr]?.[house.id] || 0;
                    return (
                      <div key={house.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 border border-white/5">
                            <HouseIcon house={house} size={20} />
                          </div>
                          <span className="font-bold text-white">{house.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${houseEarning > 0 ? 'text-emerald-500' : houseEarning < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                            R$ {houseEarning.toFixed(2)}
                          </span>
                          {houseSpins > 0 && (
                            <span className="text-xs font-bold text-lime-400 flex items-center gap-1 mt-1">
                              <Target size={12} />
                              {houseSpins} giros
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 mt-12 pt-8 border-t border-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Histórico Mensal</h2>
                  <select
                    value={selectedFinanceMonth}
                    onChange={(e) => setSelectedFinanceMonth(e.target.value)}
                    className="bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
                  >
                    {availableMonths.map(m => {
                      const [year, month] = m.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1);
                      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      return <option key={m} value={m}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</option>;
                    })}
                  </select>
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                    <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total do Mês</div>
                      <div className="flex flex-col gap-2">
                        <div className={`text-4xl font-display font-bold ${getEarningsForMonth(selectedFinanceMonth) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          R$ {getEarningsForMonth(selectedFinanceMonth).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 text-lime-400 font-bold">
                          <Target size={16} />
                          <span>{getSpinsForMonth(selectedFinanceMonth)} giros</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Por Casa de Aposta</div>
                    {state.houses.map(house => {
                      const houseTotal = getHouseEarningsForMonth(selectedFinanceMonth, house.id);
                      let houseSpinsTotal = 0;
                      Object.keys(state.spins).forEach(date => {
                        if (date.startsWith(selectedFinanceMonth)) {
                          houseSpinsTotal += state.spins[date]?.[house.id] || 0;
                        }
                      });
                      
                      if (houseTotal === 0 && houseSpinsTotal === 0) return null;
                      return (
                        <div key={house.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <HouseIcon house={house} size={16} className="text-zinc-400" />
                            <span className="text-sm font-bold text-zinc-300">{house.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold ${houseTotal > 0 ? 'text-emerald-500' : houseTotal < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                              R$ {houseTotal.toFixed(2)}
                            </span>
                            {houseSpinsTotal > 0 && (
                              <span className="text-xs font-bold text-lime-400 flex items-center gap-1 mt-1">
                                <Target size={12} />
                                {houseSpinsTotal} giros
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {state.houses.every(h => {
                      const houseTotal = getHouseEarningsForMonth(selectedFinanceMonth, h.id);
                      let houseSpinsTotal = 0;
                      Object.keys(state.spins).forEach(date => {
                        if (date.startsWith(selectedFinanceMonth)) {
                          houseSpinsTotal += state.spins[date]?.[h.id] || 0;
                        }
                      });
                      return houseTotal === 0 && houseSpinsTotal === 0;
                    }) && (
                      <div className="text-center py-6 text-zinc-500 text-sm italic">
                        Nenhum ganho ou giro registrado neste mês.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-10"
            >
              {/* General Settings */}
              <section className="space-y-6">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings size={16} />
                  Configurações Gerais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Bell size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">Notificações</h2>
                        <p className="text-xs text-zinc-500 font-medium">Lembretes para manter seu streak</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <button
                        onClick={requestNotificationPermission}
                        className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 border ${
                          notificationsEnabled 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                          <span className="text-sm font-bold">{notificationsEnabled ? 'Ativadas' : 'Desativadas'}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
                        </div>
                      </button>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} />
                          Horário Global
                        </label>
                        <input
                          type="time"
                          value={state.globalReminderTime}
                          onChange={(e) => updateGlobalReminder(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="glass-card rounded-3xl p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Target size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">Meta de Streak</h2>
                        <p className="text-xs text-zinc-500 font-medium">Defina seu objetivo pessoal</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <span>Progresso</span>
                        <span>{state.streakGoal} dias</span>
                      </div>
                      <input
                        type="range"
                        min="7"
                        max="365"
                        value={state.streakGoal}
                        onChange={(e) => updateStreakGoal(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600 font-bold">
                        <span>1 SEMANA</span>
                        <span>1 ANO</span>
                      </div>
                    </div>
                  </section>
                </div>
              </section>

              {/* Platform Management */}
              <section className="space-y-6">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Gerenciar Plataformas
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Add House Form */}
                  <div className="lg:col-span-1">
                    <section className="glass-card rounded-3xl p-6 sm:p-8 sticky top-28">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                          <Plus size={24} />
                        </div>
                        <div>
                      <h2 className="text-xl font-display font-bold text-white">Novo Registro</h2>
                      <p className="text-xs text-zinc-500 font-medium">Adicione uma nova casa de aposta</p>
                    </div>
                  </div>

                  <form onSubmit={addHouse} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Plataforma</label>
                        <input
                          required
                          type="text"
                          placeholder="Ex: Bet365, Blaze..."
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">URL de Acesso</label>
                        <input
                          required
                          type="url"
                          placeholder="https://..."
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lembrete (Opcional)</label>
                          <input
                            type="time"
                            value={newReminderTime}
                            onChange={(e) => setNewReminderTime(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ícone</label>
                          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
                            {ICON_LIBRARY.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedLucideIcon(item.id)}
                                className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all border ${
                                  selectedLucideIcon === item.id 
                                    ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                    : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'
                                }`}
                              >
                                <item.icon size={16} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 text-zinc-950 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Adicionar à Lista
                    </button>
                  </form>
                </section>
              </div>

              {/* Manage Houses List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.houses.map((house) => (
                    <div key={house.id} className="glass-card rounded-2xl p-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 border border-white/5">
                          <HouseIcon house={house} size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{house.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px]">{house.url.replace(/^https?:\/\//, '')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHouse(house.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                {state.houses.length === 0 && (
                  <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/5">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 mb-4">
                      <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Nenhuma plataforma cadastrada</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">Adicione suas casas de aposta usando o formulário ao lado para começar a acompanhar seu progresso.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-16 text-center border-t border-white/5 mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
          <Zap size={12} className="text-emerald-500" />
          Reset Diário Automático Ativo
        </div>
        <p className="text-zinc-600 text-xs mt-6 font-medium">
          Checklist Pro &copy; 2026 • Desenvolvido para Alta Performance
        </p>
      </footer>

      {/* Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/10 relative my-auto"
            >
              <button
                onClick={() => setIsEditingProfile(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full transition-all border border-white/10 hover:bg-white/10"
              >
                <X size={20} />
              </button>

              {/* Cover Image */}
              <div className="h-48 sm:h-64 w-full relative bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-blue-900/40">
                {state.userProfile?.coverUrl && (
                  <img src={state.userProfile.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              </div>

              {/* Profile Info */}
              <div className="px-6 sm:px-10 pb-10 relative -mt-20">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                  <div className="relative w-32 h-32 rounded-[2rem] bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                    {state.userProfile?.avatarUrl ? (
                      <img src={state.userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                        {state.userProfile?.name || 'Usuário'}
                      </h2>
                      <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Zap size={12} /> Pro
                      </div>
                    </div>
                    {state.userProfile?.bio && (
                      <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                        {state.userProfile.bio}
                      </p>
                    )}
                  </div>
                  <div className="pb-2">
                    <button
                      onClick={() => setShowProfileEditForm(!showProfileEditForm)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      {showProfileEditForm ? 'Ver Estatísticas' : 'Editar Perfil'}
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!showProfileEditForm ? (
                    <motion.div
                      key="stats"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-4"
                    >
                      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Flame size={24} className="text-orange-500 mb-3" />
                        <div className="text-2xl font-display font-bold text-white mb-1">{state.currentStreak}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ofensiva Atual</div>
                      </div>
                      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Trophy size={24} className="text-yellow-500 mb-3" />
                        <div className="text-2xl font-display font-bold text-white mb-1">{state.bestStreak}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Melhor Ofensiva</div>
                      </div>
                      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <DollarSign size={24} className="text-emerald-500 mb-3" />
                        <div className="text-2xl font-display font-bold text-white mb-1">R$ {totalEarnings.toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ganhos Totais</div>
                      </div>
                      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Target size={24} className="text-lime-500 mb-3" />
                        <div className="text-2xl font-display font-bold text-white mb-1">{totalSpins}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Giros Ganhos</div>
                      </div>
                      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CheckCircle2 size={24} className="text-blue-500 mb-3" />
                        <div className="text-2xl font-display font-bold text-white mb-1">{totalCompletedTasks}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tarefas Concluídas</div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="edit-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={(e) => { saveProfile(e); setShowProfileEditForm(false); }}
                      className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5"
                    >
                      <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-emerald-500" />
                        Configurações do Perfil
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome de Exibição</label>
                          <input
                            required
                            type="text"
                            placeholder="Seu nome"
                            value={editProfileName}
                            onChange={(e) => setEditProfileName(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bio / Lema</label>
                          <input
                            type="text"
                            placeholder="Uma frase curta sobre você"
                            value={editProfileBio}
                            onChange={(e) => setEditProfileBio(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avatar</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-white/5 transition-all w-full sm:w-auto">
                              <Upload size={16} className="text-emerald-500" />
                              <span className="text-sm font-bold">Fazer Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, setEditProfileAvatar)}
                              />
                            </label>
                            {editProfileAvatar && (
                              <button
                                type="button"
                                onClick={() => setEditProfileAvatar('')}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                          <div className="pt-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Ou escolha um avatar rápido:</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {PRESET_AVATARS.map((avatar, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setEditProfileAvatar(avatar)}
                                  className={`w-12 h-12 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all ${
                                    editProfileAvatar === avatar 
                                      ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' 
                                      : 'border-transparent hover:border-white/20 hover:scale-105'
                                  }`}
                                >
                                  <img src={avatar} alt={`Preset ${idx}`} className="w-full h-full object-cover bg-zinc-800" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Capa do Perfil</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-white/5 transition-all w-full sm:w-auto">
                              <Upload size={16} className="text-emerald-500" />
                              <span className="text-sm font-bold">Fazer Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, setEditProfileCover)}
                              />
                            </label>
                            {editProfileCover && (
                              <button
                                type="button"
                                onClick={() => setEditProfileCover('')}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                          <div className="pt-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Ou escolha uma capa rápida:</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {PRESET_COVERS.map((cover, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setEditProfileCover(cover)}
                                  className={`w-24 h-12 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all ${
                                    editProfileCover === cover 
                                      ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' 
                                      : 'border-transparent hover:border-white/20 hover:scale-105'
                                  }`}
                                >
                                  <img src={cover} alt={`Cover ${idx}`} className="w-full h-full object-cover bg-zinc-800" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowProfileEditForm(false)}
                          className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center gap-2"
                        >
                          <Check size={18} />
                          Salvar Alterações
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
