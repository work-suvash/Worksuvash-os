import { ReactNode } from "react";
import { useAppContext } from "@/components/AppContext";
import background from "@/assets/images/wallpaper-worksuvash.png";

interface GameScreenLayoutProps {
    children: ReactNode;
    footerActions?: ReactNode;
    className?: string;
    zIndex?: number;
    mode?: 'terminal' | 'glass'; // New prop
    solidBackground?: boolean;
}

export function GameScreenLayout({
    children,
    footerActions,
    className = "",
    zIndex = 40,
    mode = 'terminal', // Default to terminal
    solidBackground = false,
}: GameScreenLayoutProps) {
    const { accentColor } = useAppContext();

    // Terminal Styles (Current)
    const terminalStyle = {
        // Creative Background: Vignette + clearer Dots + subtle bottom glow
        backgroundImage: `
          radial-gradient(circle at center, transparent 30%, #000 100%),
          radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle at 50% 100%, rgba(30,30,50,0.4) 0%, transparent 60%)
        `,
        backgroundSize: '100% 100%, 20px 20px, 100% 100%',
        backgroundPosition: 'center, 0 0, center'
    };

    // Glass Styles (Restored)
    const glassStyle = solidBackground
        ? { backgroundColor: '#000' }
        : { backgroundImage: `url(${background})` };

    return (
        <div
            className={`fixed inset-0 flex flex-col ${mode === 'glass' ? `${solidBackground ? 'bg-black' : 'bg-cover bg-center'} font-sans overflow-y-auto overflow-x-hidden` : 'bg-black font-mono overflow-hidden'} ${className}`}
            style={{
                zIndex,
                ...(mode === 'terminal' ? terminalStyle : glassStyle)
            }}
        >
            {/* Glass Mode: Backdrop Overlay (skip when solid background) */}
            {mode === 'glass' && !solidBackground && <div className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-none" />}
            {/* Unified Flex Column - Distributed Vertical Space */}
            <div className={`relative z-20 flex flex-col items-center justify-start h-full w-full max-h-screen p-6 sm:p-12 pb-8 overflow-hidden`}>


                {/* Spacer Top -> Logo */}
                <div className="flex-1" />

                {/* Unified Header */}
                <div className={`flex flex-col items-center select-none shrink-0 relative z-0 ${mode === 'glass' ? 'mb-4 md:mb-8 animate-in fade-in zoom-in-95 duration-1000' : 'justify-start animate-in fade-in zoom-in-95 duration-1000'}`}>

                    {/* MODE: TERMINAL (ASCII Logo with Retro Stripes) */}
                    {mode === 'terminal' && (
                        <div className="flex items-center max-w-full justify-center relative">
                            {/* Demo-Scene ASCII Orb - High Fidelity Diagonal Slices */}


                            <div className="flex flex-col items-center shrink min-w-0">
                                <div className="flex items-start justify-center">
                                    <pre
                                          className="font-bold whitespace-pre font-mono leading-none"
                                          style={{
                                              fontSize: 'clamp(14px, 1.22vw, 32px)',
                                              marginBottom: 'min(1.2vh, 10px)',
                                              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
                                              WebkitBackgroundClip: 'text',
                                              WebkitTextFillColor: 'transparent',
                                              backgroundClip: 'text',
                                              filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.35))',
                                          }}
                                      >
                                          {`
  ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗
  ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝
  ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ 
  ██║███╗██║██║   ██║██╔══██╗██╔═██╗ 
  ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗
   ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`}
                                      </pre>
                                      <pre
                                          className="font-bold whitespace-pre font-mono leading-none"
                                          style={{
                                              fontSize: 'clamp(14px, 1.22vw, 32px)',
                                              marginBottom: 'min(1.2vh, 10px)',
                                              background: 'linear-gradient(135deg, #38bdf8 0%, #22d3ee 50%, #34d399 100%)',
                                              WebkitBackgroundClip: 'text',
                                              WebkitTextFillColor: 'transparent',
                                              backgroundClip: 'text',
                                              filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.45))',
                                          }}
                                      >
                                          {`
   ██████╗ ███████╗
  ██╔═══██╗██╔════╝
  ██║   ██║███████╗
  ██║   ██║╚════██║
  ╚██████╔╝███████║
   ╚═════╝ ╚══════╝`}
                                      </pre>
                                </div>

                                <div className="flex flex-col items-center text-white/40 uppercase text-center font-bold"
                                    style={{ gap: 'min(1vh, 8px)', fontSize: 'clamp(12px, 1vw, 24px)', letterSpacing: '0.2em' }}>
                                    <div className="flex items-center" style={{ gap: 'min(1vh, 8px)' }}>
                                        <span className="bg-white/40 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                        <span>WORK OS</span>
                                        <span className="bg-white/40 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: GLASS (Restored Animated Orb) */}
                    {mode === 'glass' && (
                        <>
                            <h1
                                className="text-5xl md:text-7xl font-mono font-extrabold tracking-[0.15em] mb-3 text-center"
                                style={{
                                    background: `linear-gradient(135deg, #ffffff 0%, ${accentColor} 55%, #ffffff 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: `drop-shadow(0 0 18px ${accentColor}55)`,
                                }}
                            >
                                work<span style={{ color: accentColor, WebkitTextFillColor: accentColor }}>.os</span>
                            </h1>
                            <div className="flex items-center gap-3 text-xs md:text-sm tracking-[0.4em] uppercase text-center">
                                <span className="h-px w-8 md:w-12" style={{ background: `linear-gradient(to right, transparent, ${accentColor})` }} />
                                <span style={{ color: accentColor }}>workspace edition</span>
                                <span className="h-px w-8 md:w-12" style={{ background: `linear-gradient(to left, transparent, ${accentColor})` }} />
                            </div>
                        </>
                    )}

                </div>


                {/* Spacer Logo -> Content */}
                <div className="flex-1" />

                {/* Main Content */}
                <div className={`w-full flex justify-center items-center shrink min-h-0 relative z-100`}>
                    {children}
                </div>


                {/* Spacer Content -> Footer */}
                <div className="flex-1" />

                {/* Unified Footer */}
                {footerActions && (
                    <div className={`shrink-0 text-center flex flex-col gap-2 items-center w-full max-w-lg relative z-10`}>
                        <div className={`flex flex-col justify-center items-center gap-2 ${mode === 'glass' ? 'text-xs font-mono' : 'w-full text-[10px] uppercase font-mono text-white/30 tracking-widest'}`}>
                            <div className={`flex items-center justify-center ${mode === 'glass' ? 'gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-white/50' : 'gap-2 text-white/20'}`}>
                                {footerActions}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
