import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Calendar as CalendarIcon, AlertCircle, Search, Activity, Zap, ShieldCheck, BarChart3, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { getPredictions, Prediction } from "@/src/services/predictionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/src/lib/utils";

const COMPETITIONS = [
  { id: "premier-league", name: "Premier League" },
  { id: "la-liga", name: "La Liga" },
  { id: "bundesliga", name: "Bundesliga" },
  { id: "serie-a", name: "Serie A" },
  { id: "ligue-1", name: "Ligue 1" },
  { id: "champions-league", name: "Champions League" },
  { id: "europa-league", name: "Europa League" },
];

export default function App() {
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async (comp: string, selectedDate: Date) => {
    if (!comp) return;
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const data = await getPredictions(comp, formattedDate);
      setPredictions(data);
      if (data.length === 0) {
        setError(`There are no ${comp} Fixtures for this date.`);
      }
    } catch (err) {
      setError("Failed to fetch predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedComp) {
      fetchPredictions(selectedComp, date);
    }
  }, [selectedComp, date]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500 selection:text-black font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Activity className="text-black w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg flex items-center justify-center -rotate-6 shadow-lg">
                <TrendingUp className="text-black w-4 h-4" />
              </div>
            </div>
            <div>
              <h1 className="font-display italic text-3xl tracking-tighter leading-none">WonderWin AI</h1>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/70 mt-1">Predictive Sports Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Engine Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Optimal Performance</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  Configuration
                </h2>
                <p className="text-xs text-white/60 leading-relaxed">
                  Our models analyze live team form, and historical records to minimize hallucinations in traditional Generative AI.
                </p>
              </div>
              
              <div className="p-1 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <Select onValueChange={setSelectedComp} value={selectedComp}>
                  <SelectTrigger className="w-full bg-transparent border-none h-14 text-lg focus:ring-0">
                    <SelectValue placeholder="Select League" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {COMPETITIONS.map((comp) => (
                      <SelectItem key={comp.id} value={comp.name} className="focus:bg-emerald-500 focus:text-black">
                        {comp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="px-3 pb-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        className="bg-zinc-900 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10 shadow-none rounded-2xl">
                <CardContent className="p-4 space-y-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono uppercase text-white/40">Accuracy</p>
                    <p className="text-xl font-display italic">92.4%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 shadow-none rounded-2xl">
                <CardContent className="p-4 space-y-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono uppercase text-white/40">Data Points</p>
                    <p className="text-xl font-display italic">14.2k</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-emerald-500 text-black border-none rounded-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Trophy className="w-16 h-16" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest opacity-70">Premium Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium leading-tight">
                  Real-time grounding ensures every tip is backed by current market movements and squad updates.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <CalendarIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-display italic">Matchday Forecast</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    {date ? format(date, "MMMM do, yyyy") : "Live Analysis Feed"}
                  </p>
                </div>
              </div>
              {selectedComp && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchPredictions(selectedComp, date)}
                  disabled={loading}
                  className="border-white/10 hover:bg-white/5 rounded-full px-6 h-10 font-mono text-[10px] uppercase tracking-widest"
                >
                  {loading ? "Syncing..." : "Refresh Feed"}
                </Button>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] pr-6 -mr-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <Skeleton className="h-8 w-1/2 bg-white/10" />
                          <Skeleton className="h-6 w-20 bg-white/10" />
                        </div>
                        <Skeleton className="h-24 w-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white/5 rounded-3xl border border-white/10 border-dashed"
                  >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                      <AlertCircle className="text-red-500 w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display italic text-2xl">Data Gap Detected</h3>
                      <p className="text-sm text-white/40 max-w-xs mx-auto font-mono uppercase tracking-wide">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                ) : predictions.length > 0 ? (
                  <div className="space-y-6">
                    {predictions.map((pred, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-white/5 border-white/10 shadow-none rounded-3xl hover:bg-white/[0.08] transition-all group overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="p-8 pb-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-3">
                                <CardTitle className="text-2xl font-display italic tracking-tight group-hover:text-emerald-400 transition-colors">
                                  {pred.match}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-emerald-500 text-black hover:bg-emerald-400 rounded-full px-4 py-1 text-[10px] uppercase font-mono tracking-widest font-bold">
                                    {pred.prediction}
                                  </Badge>
                                  <div className="h-1 w-1 bg-white/20 rounded-full" />
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                                    Confidence: <span className="text-white">{pred.confidence_score}%</span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-4xl font-display italic text-white/5 group-hover:text-white/10 transition-colors">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-8 pt-0">
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                              <p className="text-sm leading-relaxed text-white/70 italic font-medium">
                                "{pred.statistical_justification}"
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20">
                    <Trophy className="w-20 h-20" />
                    <p className="font-mono text-xs uppercase tracking-[0.3em]">Initialize System Scan</p>
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-40">
            <Activity className="w-4 h-4" />
            <p className="text-[10px] font-mono uppercase tracking-widest">
              WonderWin AI v2.4.0 • Real-time Grounding Active
            </p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">Analytics</a>
            <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">Security</a>
            <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
