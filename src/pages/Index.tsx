import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scan } from "lucide-react";
import { ScanInterface } from "@/components/ScanInterface";
import { ResultCard } from "@/components/ResultCard";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { XPBar } from "@/components/XPBar";
import { saveToHistory, addXP } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const handleScanComplete = async (result: any) => {
    setCurrentResult(result);
    setShowResult(true);

    // Safety check before saving to history
    if (result.anilist) {
      await saveToHistory({
        id: crypto.randomUUID(),
        anilistId: result.anilist.id,
        title: result.anilist.title.romaji,
        coverUrl: result.anilist.coverImage.large,
        timestamp: result.timestamp,
        tags: result.anilist.tags?.slice(0, 5).map((t: any) => t.name) || [],
        synopsis: result.anilist.description?.substring(0, 200) || '',
        genres: result.anilist.genres,
      });

      // Add XP
      const { leveledUp, newLevel } = await addXP(5);
      
      if (leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `You've reached Level ${newLevel}!`,
        });
      }
    }
  };

  const handleScanStart = () => {
    setShowResult(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <XPBar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 glow-subtle">
              <Scan className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Anime Lens
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Ultimate Scene Scanner • AI-Powered Recommendations
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Privacy-first • 100% Client-Side • No Data Leaves Your Browser
          </p>
        </motion.div>

        {/* Scan Interface */}
        <div className="mb-12">
          <ScanInterface
            onScanComplete={handleScanComplete}
            onScanStart={handleScanStart}
          />
        </div>

        {/* Results */}
        {showResult && currentResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <ResultCard result={currentResult} />
            <RecommendationsPanel currentResult={currentResult} />
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-16 pb-8"
        >
          <div className="glass-card inline-block px-8 py-6 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-2">
              Developed by <span className="text-primary font-semibold">M KEERTHI VARDHAN</span>
            </p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Powered by AniList • Built with ❤️ for anime fans
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <motion.a
                href="https://github.com/keerthivardhanm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-glow transition-smooth flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </motion.a>
              <motion.a
                href="https://keerthivardhanmportfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-glow transition-smooth flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Portfolio
              </motion.a>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
