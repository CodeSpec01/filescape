import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      {/* Navigation Shell */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 w-[95%] max-w-5xl mx-auto bg-surface/70 dark:bg-[#0e0e0f]/70 backdrop-blur-xl rounded-full mt-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-widest text-[#de8eff] font-headline">FILESCAPE</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm font-medium">
          <a className="text-[#de8eff] font-bold border-b-2 border-[#de8eff] pb-1" href="#">Solutions</a>
          <a className="text-[#e4e1e6] hover:text-[#de8eff] transition-colors" href="#">Pricing</a>
          <a className="text-[#e4e1e6] hover:text-[#de8eff] transition-colors" href="#">Security</a>
          <a className="text-[#e4e1e6] hover:text-[#de8eff] transition-colors" href="#">About</a>
        </div>
        {/* <div className="flex items-center gap-4">
          <button className="obsidian-gradient text-on-primary-fixed px-5 py-2 rounded-full text-sm font-bold tracking-tight hover:scale-95 active:scale-90 transition-transform shadow-[0_4px_12px_rgba(222,142,255,0.3)]">
            Get Started
          </button>
        </div> */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/sign-up" className="obsidian-gradient text-on-primary-fixed px-5 py-2 rounded-full text-sm font-bold tracking-tight hover:scale-95 active:scale-90 transition-transform shadow-[0_4px_12px_rgba(222,142,255,0.3)]">
              Get Started
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="bg-surface-container border border-outline-variant/30 text-on-surface px-5 py-2 rounded-full text-sm font-bold hover:bg-surface-container-high transition-colors">
              Dashboard
            </Link>
            <UserButton /> 
          </Show>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Light Leaks */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] light-leak pointer-events-none"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] light-leak pointer-events-none"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto flex flex-col items-center text-center mb-32 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Powered by Next.js & AWS S3</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
            Master the <span className="text-transparent bg-clip-text obsidian-gradient">Entropy</span><br />of Your Data.
          </h1>
          <p className="max-w-2xl text-on-surface-variant text-lg md:text-xl font-light leading-relaxed mb-12 px-4">
            High-performance cloud storage. Built with a scalable relational database and secure object storage for low-latency file management.
          </p>
          {/* <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="obsidian-gradient text-on-primary-fixed px-8 py-4 text-base font-bold flex items-center gap-2 hover:scale-95 transition-transform">
              Initialize Deployment
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="bg-surface-container border border-outline-variant/30 text-on-surface px-8 py-4 text-base font-bold hover:bg-surface-container-high transition-colors">
              Watch Interface Demo
            </button>
          </div> */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/sign-up" className="obsidian-gradient text-on-primary-fixed px-8 py-4 text-base font-bold flex items-center gap-2 hover:scale-95 transition-transform rounded-lg">
              Initialize Deployment
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link href="/sign-in" className="bg-surface-container border border-outline-variant/30 text-on-surface px-8 py-4 text-base font-bold hover:bg-surface-container-high transition-colors rounded-lg">
              Existing Node Login
            </Link>
          </div>
        </section>

        {/* Command Center (Dashboard Preview) */}
        <section className="max-w-6xl mx-auto mb-40 relative px-2">
          <div className="glass-panel border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl">
            {/* Dashboard Header */}
            <div className="bg-surface-container-highest/40 px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error-dim/40"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                  <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
                </div>
                <span className="text-xs font-mono text-on-surface-variant tracking-widest">FILES@ROOT: ~/DASHBOARD</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">notifications</span>
                <div className="w-8 h-8 rounded-lg obsidian-gradient p-px">
                  <div className="w-full h-full bg-surface rounded-[calc(0.5rem-1px)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-surface-container-lowest">
              <div className="md:col-span-3 space-y-2">
                <div className="p-3 bg-primary/10 border-l-2 border-primary text-primary flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
                </div>
                <div className="p-3 text-on-surface-variant hover:bg-surface-container flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-lg">database</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Prism Nodes</span>
                </div>
                <div className="p-3 text-on-surface-variant hover:bg-surface-container flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-lg">security</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Encryptions</span>
                </div>
              </div>

              {/* Main Dash Data */}
              <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-tertiary font-bold tracking-[0.2em] uppercase">Storage Usage</span>
                    <span className="material-symbols-outlined text-tertiary">data_usage</span>
                  </div>
                  <div className="text-3xl font-headline font-bold text-on-surface mb-2">15 GB</div>
                  <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                    <div className="bg-tertiary w-3/4 h-full"></div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">API Latency</span>
                    <span className="material-symbols-outlined text-primary">hub</span>
                  </div>
                  <div className="text-3xl font-headline font-bold text-on-surface mb-2">42 ms</div>
                  <div className="text-[10px] text-on-surface-variant">Global redundancy operational.</div>
                </div>
                <div className="sm:col-span-2 bg-surface-container-high/20 p-6 rounded-lg border border-outline-variant/10">
                  <img className="w-full h-48 object-cover rounded opacity-80 filter grayscale brightness-75 hover:grayscale-0 transition-all duration-700" alt="Dark UI dashboard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtRHjaX4M_lGvPFjSoBX10PFFsZPRmQr0oe1OJFnlyJVAsedxIhkKVahSzCBEVYl7cR-GzNcK68glSkIER-1PlFFzLm-tppJ-vHhMC5AlcOCSg8eLJWoiSu_4OSeu7HiY3lFK5hmJRlIY5q7d4Bpivnngu6bLYpVO3LV4FtE_gMheKzke9LwFJfPsKFqZXsGO3A951cdesNrEQisHwOx7eBkgvOw9EYNx6pQRWEuo9Y93m4HrbZ-27XD8RbsaPMZ5I4nHdnDbAgyw" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow under dashboard */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-primary/20 blur-[100px] pointer-events-none"></div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-7xl mx-auto mb-40 px-4">
          <div className="mb-16 text-center md:text-left">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">Atomic Architecture</h2>
            <p className="text-on-surface-variant max-w-xl">Every byte is fragmented, encrypted, and distributed across the Obsidian Lens network. Traditional breaches are mathematically impossible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
            <div className="md:col-span-2 md:row-span-2 bg-surface-container p-8 rounded-xl border border-outline-variant/10 flex flex-col justify-between group hover:border-primary/30 transition-all">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Secure Object Storage</h3>
                <p className="text-on-surface-variant leading-relaxed">Files are sliced into non-identifiable shards before leaving your device. No single node ever holds enough data to reconstruct a single file.</p>
              </div>
              <div className="mt-12 overflow-hidden rounded-lg">
                <img className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700" alt="Quantum Encryption Visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlDZFAcgM1O7yT2rrHsrnMaN4JMaMW5NQY66WF-drTieteJIPNGK5cJZVfEG-Q5BA4SUQ98Yss7nagKycZU8lD5TxjpA2AW1O67OTcfo_DvOO7L7ellRICboRG9gUxN1l76qpAS0xnJdL7EleFWW5dlFYU9oCa2Eb2D1hUsebjmgQi3tY_Ji5PFrljSAqFt56QYn6gMYgFTdiqUAU5VUNguTgRqV1QLPaweCzE6iWDnWKdl7Vs1d8FgXg-PHZVwyDmBps7gLRZZ1k" />
              </div>
            </div>
            <div className="md:col-span-2 bg-surface-container p-8 rounded-xl border border-outline-variant/10 flex flex-col sm:flex-row gap-6 hover:border-tertiary/30 transition-all">
              <div className="flex-1">
                <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center mb-4 text-tertiary">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Instant Recall</h3>
                <p className="text-sm text-on-surface-variant">Parallel shard streaming delivers your data at fiber-optic speeds, regardless of global distribution.</p>
              </div>
              <div className="flex-1 bg-surface-container-lowest rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-tertiary">84ms</div>
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Avg Latency</div>
                </div>
              </div>
            </div>
            {/* Feature 3: API First */}
            <div className="md:col-span-1 bg-surface-container p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined">api</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">API First</h3>
              <p className="text-xs text-on-surface-variant">Built with Next.js Server Actions and highly optimized API routes for rapid, secure data mutation.</p>
            </div>

            {/* Feature 4: Authentication */}
            <div className="md:col-span-1 bg-surface-container p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Seamless Auth</h3>
              <p className="text-xs text-on-surface-variant">Enterprise-grade identity management and secure isolated user sessions powered by Clerk.</p>
            </div>
          </div>
        </section>


        <section className="max-w-[90vw] md:max-w-5xl mx-auto mb-20">
          <div className="bg-surface-container-highest rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px]"></div>
            <div className="flex-1 z-10 text-center md:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">Transparent & Open Source.</h2>
              <p className="text-on-surface-variant mb-8">Dive into the architecture. Review the database schemas, API routes, and AWS integration on GitHub.</p>

              <button className="px-8 py-3 bg-[#24292f] hover:bg-[#1b1f24] border border-outline-variant/20 text-white font-bold rounded flex items-center gap-2 mx-auto md:mx-0 transition-colors shadow-lg">
                <span className="material-symbols-outlined">code</span>
                View Source Code
              </button>
            </div>
            <div className="flex-1 relative z-10 w-full md:w-auto">
              <img className="w-full h-48 object-cover rounded-xl border border-outline-variant/20 shadow-2xl" data-alt="High-tech aesthetic background showing a stylized digital network grid in deep violet and blue" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZynVEygXNrRVRVlbUbMCl5GuGdss0Htv80oCeMsx_XwJ-r72QidYiIj43LBtvvuY_5dmxVT35VuKfh7pZLEhDoHTYjU-1xA7-G5Iaz6e8Tb4F3i0wjkC7cLapt9_RDQTHN3LyZzZDUiFDPczpRdoZzxI63wWNNyFKYLY46Swjv-Vr_fh9rMNxjhcnQn7mVKNa16-ymfkkZvayjxR1DOBcBR8go6k3tEcUZn26hFk5zNXML5CZRO-dO23kH5zhdR1rfHcDuYAX6WM" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shell */}
      <footer className="w-full bg-[#000000] py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-outline-variant/5">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-black text-[#e4e1e6] font-headline tracking-widest">FILESCAPE</span>
          <p className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant">&copy; 2026 Codespec Cloud.</p>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">terminal</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">public</span>
          </div>
        </div>
      </footer>
    </>
  );
}