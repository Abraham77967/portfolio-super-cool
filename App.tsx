import React, { useState, useEffect, useRef } from 'react';
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
  Box,
  Video,
  Youtube
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

const TiltCard = ({ children, className = "", delay = "" }: any) => (
  <div className={`relative ${className} ${delay} animate-enter`}>
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 ease-out hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        
      <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );

const Badge: React.FC<{ text: string }> = ({ text }) => (
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
               <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-wide">Gesture Lab</h3>
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
      
      <div className="space-y-10">
        <TiltCard delay="delay-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">Student</h3>
              <p className="text-blue-400 font-medium flex items-center gap-2 font-sans">
                University of Illinois Urbana-Champaign
                <ExternalLink className="w-3 h-3 opacity-50" />
              </p>
            </div>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono shadow-inner">
              Aug 2025 - Present
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-sans">
            Immersed in the Grainger engineering community, focusing on circuits, embedded systems, and neurotech-inspired side projects while collaborating with peers across labs and hackathons.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Electrical Engineering" />
            <Badge text="Embedded Systems" />
            <Badge text="Signal Processing" />
            <Badge text="Student Life" />
          </div>
        </TiltCard>

        <div>
          <div className="mb-4">
            <p className="text-xs font-mono text-blue-400 tracking-[0.3em] uppercase">Leadership Roots</p>
            <h3 className="text-2xl font-display font-bold text-white">Vernon Hills High School</h3>
            <p className="text-sm text-zinc-500 font-sans">Where I launched the projects below.</p>
          </div>

          <div className="space-y-6">
            <TiltCard delay="delay-150">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                <div>
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">Intern</h3>
                  <p className="text-blue-400 font-medium flex items-center gap-2 font-sans">
                    Xperience Coding LLC 
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </p>
                </div>
                <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono shadow-inner">
                  May 2024 - May 2025
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

            <TiltCard delay="delay-250">
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
                  <Badge text="Python" />
                  <Badge text="Circuit Analysis" />
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

const Projects = ({ setPage }: { setPage?: (p: string) => void }) => {
  const projectData = [
    {
      title: 'Wave Sweeper',
      timeline: '2025',
      blurb: 'Autonomous trash-collecting boat using Raspberry Pi, Pi Cam v2, and OpenCV to detect floating debris and pilot an L298N-controlled drivetrain for retrieval.',
      tags: ['Raspberry Pi', 'OpenCV', 'L298N', 'Computer Vision', 'Autonomous Robotics'],
      links: [
        { label: 'Watch Demo', href: 'https://drive.google.com/file/d/1o081b2v-vlBUxPpuBi9iGJxUhlbnqUsi/view?usp=sharing' }
      ]
    },
    {
      title: 'Reflectra',
      timeline: '2024',
      blurb: 'A modern burnout-recovery toolkit with interactive quizzes, grounding exercises, and calming soundscapes built on a custom HTML/CSS/JS stack.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      links: [
        { label: 'Live Site', href: 'https://abraham77967.github.io/Reflectra/index.html' },
        { label: 'GitHub', href: 'https://github.com/abraham77967/Reflectra' }
      ]
    },
    {
      title: 'Planora',
      timeline: '2025',
      blurb: 'A scheduling companion for students with weather snapshots, agenda planning, and quick task tracking to keep busy semesters organized.',
      tags: ['Productivity', 'UI/UX', 'JavaScript'],
      links: [
        { label: 'Live Site', href: 'https://abraham77967.github.io/planora-temp/' },
        { label: 'GitHub', href: 'https://github.com/Abraham77967/planora-temp' }
      ]
    }
  ];

  const heroProject = projectData[0];
  const otherProjects = projectData.slice(1);

  return (
  <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <SectionTitle title="Projects" icon={<Code2 className="w-6 h-6" />} />

        <div className="space-y-8">
          <TiltCard delay="delay-50">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Flagship</p>
                  <h3 className="text-3xl font-display font-bold text-white">{heroProject.title}</h3>
                </div>
                <span className="px-3 py-1 text-xs font-mono text-blue-200 bg-blue-950/40 rounded-full border border-blue-500/40">{heroProject.timeline}</span>
              </div>
              <p className="text-sm text-zinc-200">{heroProject.blurb}</p>
              <div className="flex flex-wrap gap-2">
                {heroProject.tags.map((tag) => (
                  <Badge key={tag} text={tag} />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {heroProject.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-sm font-semibold uppercase tracking-wider text-white hover:border-white hover:bg-white/10 transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
                <button
                  onClick={() => setPage && setPage('test')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-sm font-semibold uppercase tracking-wider text-white hover:border-white hover:bg-white/10 transition-colors"
                >
                  Prototype 3D Model
                  <Box className="w-4 h-4" />
                </button>
              </div>
            </div>
          </TiltCard>

          {otherProjects.map((project, idx) => (
            <TiltCard key={project.title} delay={`delay-${150 + idx * 100}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Project</p>
                    <h3 className="text-3xl font-display font-bold text-white">{project.title}</h3>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-zinc-500 bg-zinc-900 rounded-full border border-zinc-800">{project.timeline}</span>
                </div>
                <p className="text-sm text-zinc-400">{project.blurb}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} text={tag} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:border-blue-500/50 hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

const Skills = () => {
  const videoServices = ['Commercials', 'Short Films', 'Promo Videos'];
  const toolBadges = ['DaVinci Resolve', 'After Effects', 'Fusion 360', 'Bambu Lab'];
  const codeBadges = ['React', 'JSON', 'C', 'HTML', 'Arduino', 'Raspberry Pi'];
  const skillCategories = [
    {
      title: 'Video & Story',
      details: ['Directing + cinematography', 'Color grading & motion graphics', 'Client-ready promos']
    },
    {
      title: 'Web & Apps',
      details: ['Responsive React frontends', 'JSON API wrangling', 'UI polish + animation']
    },
    {
      title: 'Hardware & Fabrication',
      details: ['Embedded prototyping', '3D modeling + printing', 'Testing on Arduino/RPi stacks']
    }
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <SectionTitle title="Skills" icon={<Cpu className="w-6 h-6" />} />

        <div className="space-y-8">
          <TiltCard delay="delay-100">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Videography</p>
                <h3 className="text-3xl font-display font-bold text-white leading-snug">
                  Full-service video production: concept, shoot, edit, deliver.
                </h3>
                <p className="text-sm text-zinc-400">
                  I storyboard, direct, and edit commercials, short films, and promo videos—often blending practical effects with motion graphics to highlight product stories.
                </p>
                <div className="flex flex-wrap gap-2">
                  {videoServices.map((service) => (
                    <Badge key={service} text={service} />
                  ))}
                </div>
                <a
                  href="https://www.youtube.com/@Abraham79065"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-sm font-semibold uppercase tracking-widest hover:bg-red-500/20 transition-colors w-fit"
                >
                  <Youtube className="w-4 h-4" />
                  Visit YouTube Channel
                </a>
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Services</p>
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li>• Dynamic commercials that blend hardware shots with UI overlays.</li>
                    <li>• Short-form storytelling with cinematic lighting and audio.</li>
                    <li>• Promo videos for hackathons, clubs, and campus events.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] mb-2">Gear</p>
                  <p className="text-sm text-zinc-200">Panasonic full-frame mirrorless bodies, gimbal rigs, drones, modular audio setups.</p>
                </div>
              </div>
            </div>
          </TiltCard>

          <TiltCard delay="delay-200">
            <div className="space-y-4">
              <p className="text-xs font-mono text-purple-400 uppercase tracking-[0.4em]">Tools & Pipelines</p>
              <h3 className="text-2xl font-display font-bold text-white">Software I can run confidently</h3>
              <p className="text-sm text-zinc-400">Color grading suites, motion design, and CAD workflows that I use daily.</p>
              <div className="flex flex-wrap gap-2">
                {toolBadges.map((tool) => (
                  <Badge key={tool} text={tool} />
                ))}
              </div>
            </div>
          </TiltCard>

          <TiltCard delay="delay-300">
            <div className="space-y-4">
              <p className="text-xs font-mono text-green-400 uppercase tracking-[0.4em]">Prototyping & Code</p>
              <h3 className="text-2xl font-display font-bold text-white">From firmware to frontends</h3>
              <p className="text-sm text-zinc-400">
                I prototype with Arduino and Raspberry Pi to build cool projects for school and fun, then tie everything together with React dashboards or firmware tweaks.
              </p>
              <div className="flex flex-wrap gap-2">
                {codeBadges.map((skill) => (
                  <Badge key={skill} text={skill} />
                ))}
              </div>
            </div>
          </TiltCard>

          <TiltCard delay="delay-350">
            <div className="space-y-4">
              <p className="text-xs font-mono text-blue-300 uppercase tracking-[0.4em]">Skill Categories</p>
              <h3 className="text-2xl font-display font-bold text-white">Where I plug in fastest</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {skillCategories.map((category) => (
                  <div key={category.title} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <p className="text-sm font-display text-blue-400">{category.title}</p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      {category.details.map((detail) => (
                        <li key={detail}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </PageWrapper>
  );
};

const Contact = () => {
  const contactChannels = [
    {
      title: 'LinkedIn',
      subtitle: '@abraham-guo',
      description: 'Reach out for collaboration, recruiting, or speaking.',
      href: 'https://www.linkedin.com/in/abraham-guo/',
      accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      icon: <Linkedin className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'GitHub',
      subtitle: '@Abraham77967',
      description: 'Browse interaction experiments, creative coding, and utilities.',
      href: 'https://github.com/Abraham77967',
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      icon: <Github className="w-6 h-6 text-purple-400" />
    },
    {
      title: 'Email',
      subtitle: 'abrahamg7797@gmail.com',
      description: 'Fastest way for detailed project briefs or intros.',
      href: 'mailto:abrahamg7797@gmail.com',
      accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      icon: <Mail className="w-6 h-6 text-cyan-400" />
    }
  ];

  const quickFacts = [
    {
      label: 'Current Base',
      value: 'Champaign, IL',
      icon: <MapPin className="w-4 h-4 text-blue-400" />
    },
    {
      label: 'Response Time',
      value: '< 24 hours',
      icon: <Zap className="w-4 h-4 text-yellow-400" />
    },
    {
      label: 'Focus Stack',
      value: 'Video • Web Dev • App Dev',
      icon: <Cpu className="w-4 h-4 text-purple-400" />
    }
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <SectionTitle title="Get in Touch" icon={<Mail className="w-6 h-6" />} />
        
        <div className="space-y-10">
          <TiltCard delay="delay-100">
            <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] items-center">
              <div className="space-y-4">
                <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Availability</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  UIUC student builder looking for internships, co-ops, and side projects to push video + tech.
                </h3>
                <p className="text-sm text-zinc-400">
                  I’m actively hunting for teams that need rapid prototyping, production-ready storytelling, or embedded builds. Dive into the Skills page for a full breakdown of cameras, code, and fabrication tools I work with.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:abrahamg7797@gmail.com"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold uppercase tracking-wider shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors"
                  >
                    Email Me
                  </a>
                  <a
                    href="https://www.linkedin.com/in/abraham-guo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl border border-zinc-800 text-zinc-200 text-sm font-semibold uppercase tracking-wider hover:border-blue-500/50 hover:text-blue-400 transition-colors"
                  >
                    LinkedIn DM
                  </a>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-zinc-800 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.4em]">Status</span>
                  <span className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <p className="text-sm text-zinc-300">
                  Open for internships, contract builds, and film-tech partnerships through 2025.
                </p>
                <div className="text-xs text-zinc-500 font-mono">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </TiltCard>

          <div className="grid gap-4 md:grid-cols-3">
            {quickFacts.map((fact, idx) => (
              <TiltCard key={fact.label} delay={`delay-${150 + idx * 50}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    {fact.icon}
                  </div>
                  <div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">{fact.label}</p>
                    <p className="text-sm text-zinc-200">{fact.value}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="space-y-6">
            {/* Primary: LinkedIn */}
            <a
              href={contactChannels[0].href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TiltCard delay="delay-200" className="group h-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl border ${contactChannels[0].accent} transition-all duration-300 group-hover:scale-110`}>
                      {contactChannels[0].icon}
                    </div>
                    <div>
                      <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.3em]">Primary Channel</p>
                      <h3 className="font-display text-3xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">
                        LinkedIn
                      </h3>
                      <p className="text-sm text-zinc-400 font-mono mt-1">
                        {contactChannels[0].subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 text-sm text-zinc-400 font-sans">
                    <p>{contactChannels[0].description}</p>
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-300">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      Tap to open profile
                    </div>
                  </div>
                </div>
              </TiltCard>
            </a>

            {/* Secondary: Email */}
            <a
              href={contactChannels[2].href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TiltCard delay="delay-300" className="group h-full">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border ${contactChannels[2].accent} transition-all duration-300 group-hover:scale-110`}>
                    {contactChannels[2].icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">
                      Direct Email
                    </p>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                      Email
                    </h3>
                    <p className="text-sm text-zinc-300 font-mono mt-1">
                      {contactChannels[2].subtitle}
                    </p>
                    <p className="text-sm text-zinc-500 font-sans mt-2">
                      {contactChannels[2].description}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-zinc-200 transition-colors" />
                </div>
              </TiltCard>
            </a>

            {/* Tertiary: GitHub as a compact pill */}
            <div className="flex justify-end">
              <a
                href={contactChannels[1].href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-400 hover:border-purple-400/60 hover:text-purple-300 hover:bg-zinc-800 transition-colors"
              >
                <Github className="w-4 h-4 text-purple-300" />
                <span>github.com/{contactChannels[1].subtitle.replace('@', '')}</span>
              </a>
            </div>
          </div>
      </div>
    </div>
  </PageWrapper>
);
};

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
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight glitch-text uppercase" data-text="Gesture Interface Lab">Gesture Interface Lab</h1>
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
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const loaderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<'intro' | 'outro'>('intro');
  
  // Smooth overlay fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => setOverlayVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Turn off loader after a slightly longer delay (start main-content fade-in + particle outro)
  useEffect(() => {
    const timer1 = setTimeout(() => {
      phaseRef.current = 'outro';
    }, 3450); // 50% longer: 2300 * 1.5
    
    // Small delay before content starts appearing for smoother transition
    const timer2 = setTimeout(() => {
      setIsLoading(false);
    }, 3600); // 50% longer: 2400 * 1.5
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Keep overlay mounted longer for ultra-smooth fade-out with particle collapse
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowOverlay(false), 1800); // 50% longer: 1200 * 1.5
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Particle-based loading animation with 40% blue / 40% white / 20% pink
  // Intro: particles spiral outward, Outro: particles collapse toward center while overlay fades
  useEffect(() => {
    if (!showOverlay) return;

    const canvas = loaderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    type ParticleType = {
      angle: number;
      radius: number;
      speed: number;
      drift: number;
      size: number;
      color: string;
      reset: () => void;
      update: () => void;
      draw: () => void;
    };

    const pickColor = () => {
      const r = Math.random();
      if (r < 0.4) return 'rgba(59,130,246,'; // blue
      if (r < 0.8) return 'rgba(255,255,255,'; // white
      return 'rgba(236,72,153,'; // pink
    };

    class Particle implements ParticleType {
      angle: number;
      radius: number;
      speed: number;
      drift: number;
      size: number;
      color: string;
      startDelay: number; // For staggered intro appearance
      introProgress: number; // For smooth intro easing

      constructor(index: number, total: number) {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.15; // Start spread apart like before
        this.speed = 0.002 + Math.random() * 0.008; // Slightly slower for smoother motion
        this.drift = 0.15 + Math.random() * 0.3; // Reduced drift for smoother expansion
        this.size = Math.random() * 2.2 + 0.8;
        this.color = pickColor();
        // Stagger particle appearance for smooth intro
        this.startDelay = (index / total) * 1.2; // Spread over 1.2 seconds (50% longer)
        this.introProgress = 0;
      }

      reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * (Math.min(canvas.width, canvas.height) * 0.15); // Keep spread apart
        this.speed = 0.002 + Math.random() * 0.008;
        this.drift = 0.15 + Math.random() * 0.3;
        this.size = Math.random() * 2.2 + 0.8;
        this.color = pickColor();
        this.introProgress = 0;
      }

      update(phase?: 'intro' | 'outro', outroProgress?: number, elapsedTime?: number) {
        if (phase === 'intro' && elapsedTime !== undefined) {
          // Ultra-smooth intro with advanced easing
          const timeSinceStart = Math.max(0, elapsedTime - this.startDelay);
          if (timeSinceStart > 0) {
            // Smooth ease-out-expo for very natural acceleration
            const t = Math.min(timeSinceStart / 1.8, 1); // Normalize to 1.8s (50% longer)
            // Exponential ease-out for ultra-smooth motion
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            
            this.introProgress = eased;
            // Keep original radius but allow normal spiral movement
            this.angle += this.speed * (0.3 + eased * 0.7); // Start slow, accelerate
            this.radius += this.drift * eased; // Gradually increase drift speed
          }
        } else {
          // Normal spiral outward
          this.angle += this.speed;
          this.radius += this.drift;
        }

        const maxRadius = Math.max(canvas.width, canvas.height);
        if (this.radius > maxRadius * 0.6) {
          this.reset();
        }

        this.draw(phase, outroProgress);
      }

      draw(phase?: 'intro' | 'outro', outroProgress?: number) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;
        
        let alpha = 0.4 + Math.sin(this.radius * 0.02) * 0.4;
        let drawSize = this.size;
        
        // Smooth fade-in and size growth during intro
        if (phase === 'intro') {
          alpha *= this.introProgress; // Fade in as particle expands
          drawSize *= (0.5 + this.introProgress * 0.5); // Start smaller, grow to full size
        }
        // Smoothly fade particles during outro
        else if (phase === 'outro' && outroProgress !== undefined) {
          alpha *= (1 - outroProgress * 0.7); // fade to 30% opacity
        }
        
        ctx.beginPath();
        ctx.fillStyle = `${this.color}${alpha})`;
        ctx.arc(x, y, drawSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 220 }, (_, i) => new Particle(i, 220));

    const handleResize = () => {
      resize();
      particles.forEach((p) => p.reset());
    };

    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let outroProgress = 0;
    let startTime = performance.now();
    const animate = () => {
      if (!canvas.isConnected) return;

      const phase = phaseRef.current;
      const elapsedTime = (performance.now() - startTime) / 1000; // Convert to seconds
      
      // Smooth background fade during outro
      if (phase === 'outro') {
        outroProgress = Math.min(outroProgress + 0.015, 1);
        const fadeAlpha = 0.5 + (outroProgress * 0.35);
        ctx.fillStyle = `rgba(2, 2, 20, ${fadeAlpha})`;
      } else {
        // Smooth background fade-in during intro
        const introBgProgress = Math.min(elapsedTime / 1.2, 1); // 50% longer: 0.8 * 1.5
        const bgAlpha = 0.3 + (introBgProgress * 0.2); // Fade from 0.3 to 0.5
        ctx.fillStyle = `rgba(2, 2, 12, ${bgAlpha})`;
      }
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        if (phase === 'intro') {
          // Smooth intro with easing and staggered appearance
          p.update(phase, undefined, elapsedTime);
        } else {
          // ultra-smooth collapse toward center with elegant swirl
          p.radius *= 0.96; // slightly slower collapse for smoother motion
          p.angle += p.speed * 1.1;
          p.size *= 0.995; // gradually shrink particles
          if (p.radius < 3) {
            // keep a faint glow near center
            p.radius = 3;
            p.size = Math.max(p.size, 0.3);
          }
          p.draw(phase, outroProgress);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [showOverlay]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {showOverlay && (
        <div
          className={`fixed inset-0 z-50 bg-[#020214] text-white overflow-hidden flex items-center justify-center transition-all duration-[2100ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-[opacity,transform,filter] ${
            isLoading && overlayVisible
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-[0.98] blur-[8px] pointer-events-none'
          }`}
        >
          <canvas ref={loaderCanvasRef} className="absolute inset-0 w-full h-full" />
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-pink-500/10 transition-opacity duration-[2100ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" 
            style={{ opacity: isLoading && overlayVisible ? 1 : 0 }} 
          />
        </div>
      )}
      <div
        className={`relative transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform,filter] ${
          isLoading
            ? 'opacity-0 translate-y-6 scale-[0.98] blur-[12px] pointer-events-none select-none'
            : 'opacity-100 translate-y-0 scale-100 blur-0'
        }`}
        aria-hidden={isLoading}
      >
        {/* Particle Background */}
        <ParticlesBackground />
        
        {/* Vignette & Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-0" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/70 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-white flex items-center gap-4 cursor-pointer group" onClick={() => setPage('home')}>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  A
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#09090b] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
              <div className="flex flex-col">
                <span className="group-hover:text-zinc-100 transition-colors font-display tracking-wide text-xl leading-tight">Abraham<span className="text-blue-500 group-hover:text-white">.</span></span>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    Available
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    Champaign, IL
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <NavItem id="home" label="Profile" icon={<User className="w-4 h-4"/>} active={page === 'home'} onClick={setPage} />
              <NavItem id="experience" label="Experience" icon={<Briefcase className="w-4 h-4"/>} active={page === 'experience'} onClick={setPage} />
              <NavItem id="projects" label="Projects" icon={<Code2 className="w-4 h-4"/>} active={page === 'projects'} onClick={setPage} />
              <NavItem id="skills" label="Skills" icon={<Terminal className="w-4 h-4"/>} active={page === 'skills'} onClick={setPage} />
              <NavItem id="education" label="Education" icon={<GraduationCap className="w-4 h-4"/>} active={page === 'education'} onClick={setPage} />
              <NavItem id="contact" label="Contact" icon={<Mail className="w-4 h-4"/>} active={page === 'contact'} onClick={setPage} />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 text-zinc-500">
                <a 
                  href="https://github.com/Abraham77967" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-zinc-800/50 transition-all group"
                  title="GitHub"
                >
                  <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/abraham-guo/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-zinc-800/50 transition-all group"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="mailto:abrahamg7797@gmail.com" 
                  className="p-2 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800/50 transition-all group"
                  title="Email"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
              
              <button 
                onClick={() => setPage('neural')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border tracking-wide group overflow-hidden relative ${
                  page === 'neural' 
                    ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-blue-500/50 hover:text-blue-400 hover:bg-zinc-800'
                }`}
              >
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${page !== 'neural' ? 'group-hover:animate-[shimmer_1s_infinite]' : ''}`} />
                <Cpu className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-display">GESTURE LAB</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-2 z-50 flex items-center gap-1 rounded-full shadow-2xl shadow-black/50">
           <button onClick={() => setPage('home')} className={`p-3 rounded-full transition-all ${page === 'home' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><User size={20}/></button>
           <button onClick={() => setPage('experience')} className={`p-3 rounded-full transition-all ${page === 'experience' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Briefcase size={20}/></button>
           <button onClick={() => setPage('projects')} className={`p-3 rounded-full transition-all ${page === 'projects' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Code2 size={20}/></button>
           <button onClick={() => setPage('skills')} className={`p-3 rounded-full transition-all ${page === 'skills' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Terminal size={20}/></button>
           <button onClick={() => setPage('neural')} className={`p-3 rounded-full transition-all ${page === 'neural' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-500 hover:bg-zinc-800'}`}><Cpu size={20}/></button>
        </div>

        {/* Main Content */}
        <main className="relative z-10 px-4 pb-32 md:pb-12 pt-8 min-h-[calc(100vh-96px)]">
          {page === 'home' && <Home setPage={setPage} />}
          {page === 'experience' && <Experience />}
          {page === 'projects' && <Projects setPage={setPage} />}
          {page === 'skills' && <Skills />}
          {page === 'education' && <Education />}
          {page === 'contact' && <Contact />}
          {page === 'test' && <Test />}
          {page === 'neural' && <NeuralLab />}
        </main>
      </div>

    </div>
  );
};

export default App;