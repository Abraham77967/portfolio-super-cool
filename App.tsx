import React, { useState, useRef, useEffect } from 'react';
import { HandGestureRecognizer } from './components/HandGestureRecognizer';
import ParticlesBackground from './components/ParticlesBackground';
import { ThreeDView } from './components/ThreeDView';
import { Direction } from './types';
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Github, 
  Linkedin, 
  Mail, 
  Terminal,
  Cpu,
  User,
  ExternalLink,
  Code2,
  Scan,
  Zap,
  ArrowRight,
  Box
} from 'lucide-react';

// --- Components ---

const NavItem = ({ id, label, icon, active, onClick }: any) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium relative overflow-hidden group ${
      active 
        ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] transition-transform duration-700 ${active ? 'group-hover:translate-x-[100%]' : ''}`} />
    {icon}
    <span className="font-sans tracking-wide">{label}</span>
  </button>
);

const SectionTitle = ({ title, icon }: any) => (
  <h2 className="text-4xl font-display font-bold text-zinc-100 flex items-center gap-4 mb-10 pb-4 border-b border-zinc-800 animate-enter uppercase tracking-tight">
    <div className="p-3 bg-zinc-900 rounded-xl text-blue-500 shadow-lg shadow-blue-500/10 border border-blue-500/20 group hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">{title}</span>
  </h2>
);

const TiltCard = ({ children, className = "", delay = "" }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5; // Tilt intensity
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative perspective-1000 ${className} ${delay} animate-enter`}
    >
      <div 
        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 ease-out hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] group overflow-hidden"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ text }: { text: string }) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 font-mono hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-default">
    {text}
  </span>
);

const PageWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div className="animate-enter w-full max-w-5xl mx-auto">
    {children}
  </div>
);

// --- Pages ---

const Home = ({ setPage }: { setPage: (p: string) => void }) => (
  <PageWrapper>
    <div className="max-w-4xl mx-auto py-12 lg:py-20">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-8 animate-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-shadow cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Online & Ready
          </div>
          
          <div>
            <h1 
              className="text-7xl md:text-8xl font-display font-bold text-white tracking-tight mb-4 glitch-text cursor-default uppercase"
              data-text="Abraham Guo"
            >
              Abraham Guo
            </h1>
            <p className="text-2xl text-zinc-400 font-light leading-relaxed font-sans">
              Building the bridge between <span className="text-zinc-100 font-medium border-b border-blue-500/30 hover:border-blue-500 transition-colors">hardware</span> and <span className="text-zinc-100 font-medium border-b border-blue-500/30 hover:border-blue-500 transition-colors">software</span>.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500 font-mono uppercase tracking-wider">
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              UIUC '25
            </div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Code2 className="w-4 h-4 text-blue-500" />
              Electrical Engineering
            </div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <MapPin className="w-4 h-4 text-blue-500" />
              Chicago, IL
            </div>
          </div>

          <div className="flex gap-4 pt-4 font-display">
            <button 
              onClick={() => setPage('contact')} 
              className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/30 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative flex items-center gap-2">
                Contact Me <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={() => setPage('experience')} 
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl font-bold uppercase tracking-wide transition-all border border-zinc-800 hover:border-zinc-700 hover:-translate-y-1"
            >
              View Work
            </button>
          </div>
        </div>
        
        {/* Decorative Abstract Element */}
        <div 
          className="w-full md:w-80 h-80 relative group cursor-pointer animate-float perspective-1000 delay-200"
          onClick={() => setPage('neural')}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50"></div>
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="relative z-10 text-center p-8 transform transition-transform group-hover:scale-110 duration-500">
               <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 group-hover:border-blue-500/50 transition-colors shadow-lg group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                 <Cpu className="w-8 h-8 text-blue-500" />
               </div>
               <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-wide">Neural Lab</h3>
               <p className="text-sm text-zinc-400 mb-6 font-sans">Enter the gesture control experiment.</p>
               <span className="text-xs font-mono text-blue-400 border border-blue-500/20 bg-blue-500/5 px-3 py-1 rounded-full group-hover:bg-blue-500/20 transition-colors">
                  TRY IT NOW &rarr;
               </span>
            </div>
            
            {/* Scanline effect for card */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-scan"></div>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
);

const Experience = () => (
  <PageWrapper>
    <div className="max-w-3xl mx-auto py-8">
      <SectionTitle title="Experience" icon={<Briefcase className="w-6 h-6" />} />
      
      <div className="space-y-6">
        <TiltCard delay="delay-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">Intern</h3>
              <p className="text-blue-400 font-medium flex items-center gap-2 font-sans">
                Xperience Coding LLC 
                <ExternalLink className="w-3 h-3 opacity-50" />
              </p>
            </div>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono shadow-inner">
              May 2024 - Present
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-sans">
            Collaborating on multimedia software solutions, bridging the gap between creative workflows and technical implementation. Optimized video rendering pipelines in Python and enhanced DaVinci Resolve integrations.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="DaVinci Resolve API" />
            <Badge text="Python" />
            <Badge text="Media Production" />
            <Badge text="React" />
          </div>
        </TiltCard>

        <TiltCard delay="delay-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">VP of Marketing Strategy</h3>
              <p className="text-blue-400 font-medium font-sans">classCalendar</p>
            </div>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono shadow-inner">
              Jul 2024 - Jul 2025
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-sans">
            Spearheaded growth strategies for an early-stage ed-tech startup. Conducted market analysis to pivot product features, resulting in a 40% increase in early-access signups.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Strategic Planning" />
            <Badge text="Data Analysis" />
            <Badge text="Growth Marketing" />
            <Badge text="Team Leadership" />
          </div>
        </TiltCard>
      </div>
    </div>
  </PageWrapper>
);

const Education = () => (
  <PageWrapper>
    <div className="max-w-3xl mx-auto py-8">
      <SectionTitle title="Education" icon={<GraduationCap className="w-6 h-6" />} />
      
      <div className="space-y-8">
        <div className="relative pl-8 border-l border-zinc-800 space-y-12 animate-enter">
          
          {/* UIUC */}
          <div className="relative">
            <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-zinc-950 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
            <TiltCard delay="delay-100" className="mt-[-8px]">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">University of Illinois Urbana-Champaign</h3>
                 <span className="text-xs text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">2025</span>
              </div>
              <p className="text-zinc-400 mb-6 font-light font-sans">The Grainger College of Engineering</p>
              
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 mb-6 group-hover:border-blue-500/20 transition-colors">
                <p className="text-sm text-zinc-300 font-medium mb-1 font-display uppercase tracking-wider">Bachelor of Science</p>
                <p className="text-sm text-blue-400 font-sans">Electrical and Electronics Engineering</p>
              </div>

              <div className="space-y-3">
                 <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Focus Areas</h4>
                 <div className="flex flex-wrap gap-2">
                  <Badge text="Digital Signal Processing" />
                  <Badge text="Embedded Systems" />
                  <Badge text="Film Production" />
                  <Badge text="iOS Development" />
                </div>
              </div>
            </TiltCard>
          </div>

          {/* High School */}
          <div className="relative opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute -left-[37px] top-2 w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-950"></div>
            <div className="animate-enter delay-300 pl-2">
              <h4 className="text-zinc-200 font-display font-bold text-lg tracking-wide">Vernon Hills High School</h4>
              <p className="text-sm text-zinc-500 font-mono mt-1">Aug 2021 - May 2025</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </PageWrapper>
);

const Contact = () => (
  <PageWrapper>
    <div className="max-w-2xl mx-auto py-8">
      <SectionTitle title="Get in Touch" icon={<Mail className="w-6 h-6" />} />
      
      <div className="grid gap-6">
        <a href="https://linkedin.com/in/abrahamguo" target="_blank" rel="noopener noreferrer">
          <TiltCard delay="delay-100" className="flex items-center gap-6 group cursor-pointer">
            <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Linkedin className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-zinc-100 text-lg group-hover:text-blue-400 transition-colors tracking-wide">LinkedIn</h3>
              <p className="text-sm text-zinc-500 font-sans">Connect professionally & view recommendations.</p>
            </div>
            <ExternalLink className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </TiltCard>
        </a>

        <a href="https://github.com/abrahamguo" target="_blank" rel="noopener noreferrer">
          <TiltCard delay="delay-200" className="flex items-center gap-6 group cursor-pointer">
            <div className="p-4 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <Github className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-zinc-100 text-lg group-hover:text-purple-400 transition-colors tracking-wide">GitHub</h3>
              <p className="text-sm text-zinc-500 font-sans">Check out my open-source contributions.</p>
            </div>
            <ExternalLink className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </TiltCard>
        </a>

        <a href="mailto:contact@abrahamguo.com">
          <TiltCard delay="delay-300" className="flex items-center gap-6 group cursor-pointer">
            <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Mail className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-zinc-100 text-lg group-hover:text-blue-400 transition-colors tracking-wide">Email</h3>
              <p className="text-sm text-zinc-500 font-sans">contact@abrahamguo.com</p>
            </div>
            <ExternalLink className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </TiltCard>
        </a>
      </div>
    </div>
  </PageWrapper>
);

const NeuralLab = () => {
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  const handleGesture = (direction: Direction) => {
    setLastGesture(direction);
    setTimeout(() => setLastGesture(null), 2000);
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex flex-col items-center text-center mb-12 animate-enter">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative group cursor-pointer hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
            <Cpu className="w-10 h-10 relative z-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight glitch-text uppercase" data-text="Neural Interface Lab">Neural Interface Lab</h1>
          <p className="text-zinc-400 max-w-lg text-lg leading-relaxed font-sans">
            Real-time hand gesture recognition running locally in your browser via <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded text-sm border border-zinc-700">MediaPipe</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Monitor */}
          <div className="lg:col-span-2 relative bg-zinc-950 border border-zinc-800 rounded-3xl p-2 shadow-2xl overflow-hidden animate-enter delay-100 ring-1 ring-white/5 group hover:ring-blue-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <HandGestureRecognizer 
              className="w-full aspect-video rounded-2xl bg-zinc-900 shadow-inner" 
              onGesture={handleGesture} 
            />
            
            {/* Overlay feedback for demo purposes */}
            <div className="absolute top-6 right-6 pointer-events-none z-50">
              <div className={`transition-all duration-300 transform ${lastGesture ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                <div className="bg-black/80 backdrop-blur-xl border border-blue-500/50 text-white font-bold px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-mono text-sm tracking-widest">{lastGesture} DETECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel / Instructions */}
          <div className="space-y-4 animate-enter delay-200">
            <TiltCard className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
              <h3 className="text-white font-display font-bold mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Scan className="w-4 h-4 text-blue-500" />
                Gesture Library
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/50 group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 shrink-0 group-hover:scale-110 transition-transform font-mono">1</div>
                  <div>
                    <h4 className="text-zinc-200 font-medium text-sm group-hover:text-blue-400 transition-colors font-display tracking-wide uppercase">Activation Lock</h4>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">Pinch 5 fingers for 1.5s to sync.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/50 group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold border border-white/20 shrink-0 group-hover:scale-110 transition-transform font-mono">2</div>
                  <div>
                    <h4 className="text-zinc-200 font-medium text-sm group-hover:text-white transition-colors font-display tracking-wide uppercase">Navigation</h4>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">Open hand wave Left/Right to swipe.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/50 group">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 shrink-0 group-hover:scale-110 transition-transform font-mono">3</div>
                  <div>
                    <h4 className="text-zinc-200 font-medium text-sm group-hover:text-purple-400 transition-colors font-display tracking-wide uppercase">Action Trigger</h4>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">Double pinch quickly to execute.</p>
                  </div>
                </div>
              </div>
            </TiltCard>

            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                SYSTEM STATUS
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full animate-[pulse_3s_infinite]"></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-mono">
                <span>FPS: 60</span>
                <span>LATENCY: 12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const Test = () => (
  <PageWrapper>
    <div className="max-w-4xl mx-auto py-8">
      <SectionTitle title="3D Manipulation Test" icon={<Box className="w-6 h-6" />} />
      <div className="animate-enter delay-100">
        <ThreeDView />
      </div>
    </div>
  </PageWrapper>
);

// --- Main App ---

const App: React.FC = () => {
  const [page, setPage] = useState('home');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Particle Background */}
      <ParticlesBackground />
      
      {/* Vignette & Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-3 cursor-pointer group" onClick={() => setPage('home')}>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:bg-blue-400">
              A
            </div>
            <span className="group-hover:text-zinc-100 transition-colors font-display tracking-wide">Abraham<span className="text-blue-500 group-hover:text-white">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavItem id="home" label="Profile" icon={<User className="w-4 h-4"/>} active={page === 'home'} onClick={setPage} />
            <NavItem id="experience" label="Experience" icon={<Briefcase className="w-4 h-4"/>} active={page === 'experience'} onClick={setPage} />
            <NavItem id="education" label="Education" icon={<GraduationCap className="w-4 h-4"/>} active={page === 'education'} onClick={setPage} />
            <NavItem id="contact" label="Contact" icon={<Mail className="w-4 h-4"/>} active={page === 'contact'} onClick={setPage} />
            <NavItem id="test" label="Test" icon={<Box className="w-4 h-4"/>} active={page === 'test'} onClick={setPage} />
          </div>

          <button 
            onClick={() => setPage('neural')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border tracking-wide group overflow-hidden relative ${
              page === 'neural' 
                ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-blue-500/50 hover:text-blue-400 hover:bg-zinc-800'
            }`}
          >
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${page !== 'neural' ? 'group-hover:animate-[shimmer_1s_infinite]' : ''}`} />
            <Cpu className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-display">NEURAL LAB</span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-2 z-50 flex items-center gap-1 rounded-full shadow-2xl shadow-black/50">
         <button onClick={() => setPage('home')} className={`p-3 rounded-full transition-all ${page === 'home' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><User size={20}/></button>
         <button onClick={() => setPage('experience')} className={`p-3 rounded-full transition-all ${page === 'experience' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Briefcase size={20}/></button>
         <button onClick={() => setPage('test')} className={`p-3 rounded-full transition-all ${page === 'test' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Box size={20}/></button>
         <button onClick={() => setPage('neural')} className={`p-3 rounded-full transition-all ${page === 'neural' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Cpu size={20}/></button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-32 md:pb-12 pt-8 min-h-[calc(100vh-64px)]">
        {page === 'home' && <Home setPage={setPage} />}
        {page === 'experience' && <Experience />}
        {page === 'education' && <Education />}
        {page === 'contact' && <Contact />}
        {page === 'test' && <Test />}
        {page === 'neural' && <NeuralLab />}
      </main>

    </div>
  );
};

export default App;