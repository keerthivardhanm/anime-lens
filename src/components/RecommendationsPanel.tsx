import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Recommendation {
  id: number;
  title: string;
  coverImage: string;
  genres: string[];
  score: number;
}

interface RecommendationsPanelProps {
  currentResult: any;
}

export const RecommendationsPanel = ({ currentResult }: RecommendationsPanelProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentResult]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Safety check
      if (!currentResult?.anilist?.genres) {
        setLoading(false);
        return;
      }

      // Get genre-based recommendations from AniList
      const query = `
        query ($genres: [String]) {
          Page(page: 1, perPage: 12) {
            media(genre_in: $genres, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
              }
              coverImage {
                large
              }
              genres
              averageScore
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: {
            genres: currentResult.anilist.genres.slice(0, 2),
          },
        }),
      });

      const data = await response.json();
      const recs = data.data.Page.media
        .filter((anime: any) => anime.id !== currentResult.anilist.id)
        .slice(0, 8)
        .map((anime: any) => ({
          id: anime.id,
          title: anime.title.romaji,
          coverImage: anime.coverImage.large,
          genres: anime.genres,
          score: anime.averageScore,
        }));

      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse-glow p-4 rounded-full bg-primary/10">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">You Might Also Like</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recommendations.map((rec, index) => (
          <motion.a
            key={rec.id}
            href={`https://anilist.co/anime/${rec.id}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.1 }}
            className="group relative overflow-hidden rounded-lg border border-border/20 hover:border-primary/50 transition-all hover:scale-105"
          >
            <img
              src={rec.coverImage}
              alt={rec.title}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-medium line-clamp-2">{rec.title}</p>
                {rec.score && (
                  <p className="text-xs text-primary mt-1">{rec.score / 10}/10</p>
                )}
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};
