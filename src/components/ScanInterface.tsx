import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ScanInterfaceProps {
  onScanComplete: (result: any) => void;
  onScanStart: () => void;
}

export const ScanInterface = ({ onScanComplete, onScanStart }: ScanInterfaceProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleScan = async (imageSource: File | string) => {
    setIsScanning(true);
    setScanSuccess(false);
    onScanStart();

    try {
      // Step 1: Call trace.moe API
      let traceMoeResponse;
      
      if (typeof imageSource === 'string') {
        // For URL, use GET request with query parameter
        traceMoeResponse = await fetch(`https://api.trace.moe/search?anilistInfo=true&cutBorders=false&url=${encodeURIComponent(imageSource)}`);
      } else {
        // For file upload, use POST with FormData
        const formData = new FormData();
        formData.append('image', imageSource);
        traceMoeResponse = await fetch('https://api.trace.moe/search', {
          method: 'POST',
          body: formData,
        });
      }

      if (!traceMoeResponse.ok) {
        throw new Error('Failed to scan image');
      }

      const traceMoeData = await traceMoeResponse.json();
      
      if (!traceMoeData.result || traceMoeData.result.length === 0) {
        throw new Error('No matches found');
      }

      const bestMatch = traceMoeData.result.reduce(
        (best: any, item: any) => (item.similarity > best.similarity ? item : best),
        traceMoeData.result[0]
      );

      // Step 2: Fetch AniList data
      const anilistQuery = `
        query ($id: Int) {
          Media(id: $id) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
            }
            description
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            seasonYear
          }
        }
      `;

      const anilistResponse = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: anilistQuery,
          variables: { id: bestMatch.anilist },
        }),
      });

      const anilistData = await anilistResponse.json();

      // Check if AniList returned valid data
      if (!anilistData.data?.Media) {
        throw new Error('Anime not found in AniList database. Try a different scene.');
      }

      // Combine results
      const result = {
        trace: bestMatch,
        anilist: anilistData.data.Media,
        timestamp: new Date().toISOString(),
      };

      setScanSuccess(true);
      setTimeout(() => {
        onScanComplete(result);
        setScanSuccess(false);
      }, 800);

    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScan(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleScan(file);
    }
  };

  const isProbablyImageUrl = (url: string) => /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

  const validateImageUrl = async (url: string) => {
    if (!/^https?:\/\//.test(url)) return false;
    if (isProbablyImageUrl(url)) return true;
    try {
      const resp = await fetch(url, { method: 'HEAD' });
      const ct = resp.headers.get('content-type') || '';
      return ct.startsWith('image/');
    } catch {
      return false;
    }
  };

  const handleUrlScan = async () => {
    const url = imageUrl.trim();
    if (!url) return;
    const valid = await validateImageUrl(url);
    if (!valid) {
      toast({
        title: "Invalid image URL",
        description: "Please paste a direct image link (jpg, png, webp).",
        variant: "destructive",
      });
      return;
    }
    handleScan(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div
            className={`glass-card p-12 rounded-2xl transition-all ${
              dragActive ? 'border-primary glow-primary' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Drop your image here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
              </div>
              <Button
                variant="default"
                size="lg"
                className="relative cursor-pointer glow-subtle"
                disabled={isScanning}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Success!
                  </>
                ) : (
                  "Select Image"
                )}
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isScanning}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <Input
                  type="url"
                  placeholder="Paste image URL here..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-background/50"
                  disabled={isScanning}
                />
              </div>
              <Button
                onClick={handleUrlScan}
                size="lg"
                className="w-full glow-subtle"
                disabled={isScanning || !imageUrl.trim()}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Success!
                  </>
                ) : (
                  "Scan Image"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
