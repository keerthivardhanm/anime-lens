import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import localforage from "localforage";

export const XPBar = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await localforage.getItem<{ xp: number; level: number }>('profile');
      if (profile) {
        setXp(profile.xp);
        setLevel(profile.level);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const xpForNextLevel = level * 100;
  const xpProgress = (xp / xpForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3 min-w-[200px]">
        <div className="p-1.5 rounded-full bg-primary/20 border border-primary/30">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold">Level {level}</span>
            <span className="text-muted-foreground">{xp}/{xpForNextLevel} XP</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-glow"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
