import { AnimatePresence } from 'framer-motion';
import FloatingNav from './FloatingNav';
import { AmbientScene, BootLoader, CursorAura, FrameOverlay } from './Cinematic';

export default function LayoutWrapper({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050507] text-white selection:bg-accent-indigo/30">
      <AnimatePresence>
        <BootLoader />
      </AnimatePresence>
      <AmbientScene />
      <CursorAura />
      <FrameOverlay />
      <FloatingNav />
      <main className="relative mx-auto min-h-screen w-full max-w-[1500px] px-5 pb-24 pt-28 md:px-12 lg:px-20">
        {children}
      </main>
    </div>
  );
}
