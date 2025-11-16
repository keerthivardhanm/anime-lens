import { motion } from "framer-motion";
import { ExternalLink, Star, Calendar, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  result: any;
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const { trace, anilist } = result;

  // Safety check
  if (!anilist) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <p className="text-muted-foreground">Anime data not available</p>
      </div>
    );
  }

  const videoUrl = trace.video;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 rounded-2xl space-y-6"
    >
      {/* Video Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative rounded-xl overflow-hidden border border-border/20"
      >
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          className="w-full aspect-video object-cover"
        />
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {formatTime(trace.from)} - {formatTime(trace.to)}
          </Badge>
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {(trace.similarity * 100).toFixed(1)}% Match
          </Badge>
        </div>
      </motion.div>

      {/* Anime Info */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-6"
      >
        <img
          src={anilist.coverImage?.extraLarge || anilist.coverImage?.large}
          alt={anilist.title?.romaji || 'Anime'}
          className="w-32 h-48 object-cover rounded-lg border border-border/20"
        />
        
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {anilist.title.romaji}
            </h2>
            {anilist.title.english && (
              <p className="text-muted-foreground">
                {anilist.title.english}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {anilist.genres?.slice(0, 3).map((genre: string) => (
              <Badge key={genre} variant="outline" className="border-primary/30">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {anilist.averageScore && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span>{anilist.averageScore / 10}/10</span>
              </div>
            )}
            {anilist.seasonYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{anilist.seasonYear}</span>
              </div>
            )}
            {anilist.episodes && (
              <div className="flex items-center gap-1">
                <Tv className="w-4 h-4" />
                <span>{anilist.episodes} Episodes</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(`https://anilist.co/anime/${anilist.id}`, '_blank')}
          >
            View on AniList <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Description */}
      {anilist.description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 border-t border-border/20"
        >
          <div
            className="text-sm text-muted-foreground line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: anilist.description.replace(/<br>/g, ' '),
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};
