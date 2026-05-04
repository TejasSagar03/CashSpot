import { motion, AnimatePresence } from "framer-motion";

export default function IntelManual({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          {/* Blurred Background Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[500px] max-h-[85vh] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-start shrink-0">
              <div>
                <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-2xl tracking-widest text-black dark:text-white uppercase">Field Manual</h2>
                <p className="text-xs font-mono uppercase text-gray-500 mt-1">Classified Intel & Progression</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#111] text-black dark:text-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
              
              {/* Section 1: Data Caches (Gacha) */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-4 h-4 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  Data Caches (Loot Drops)
                </h3>
                <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-900 text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Every time you successfully verify an ATM's status in the field, you intercept a <strong>Data Cache</strong>.</p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <strong>80% Chance:</strong> Standard Intel (+10 Rep)</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> <strong>20% Chance:</strong> High-Value Asset (Rep Multipliers, Rare Badges)</li>
                  </ul>
                </div>
              </section>

              {/* Section 2: Rank System */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-4 h-4 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Tactical Ranks
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { rank: 'ROOKIE', xp: '0 - 250 XP', color: 'text-gray-500', desc: 'Standard field operator.' },
                    { rank: 'SCOUT', xp: '250 - 1000 XP', color: 'text-blue-500', desc: 'Trusted radar node.' },
                    { rank: 'OPERATIVE', xp: '1000 - 2500 XP', color: 'text-cyan-500', desc: 'Priority intel provider.' },
                    { rank: 'ELITE', xp: '2500 - 5000 XP', color: 'text-red-500', desc: 'Sector authority. Grants 1.5x rep boost.' },
                    { rank: 'PHANTOM', xp: '5000+ XP', color: 'text-purple-500', desc: 'Absolute ghost. Highest tier achievable.' }
                  ].map((tier) => (
                    <div key={tier.rank} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-900 rounded-xl bg-white dark:bg-[#050505]">
                      <div className="flex flex-col">
                        <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-sm tracking-widest ${tier.color}`}>[{tier.rank}]</span>
                        <span className="text-[10px] text-gray-500 mt-1">{tier.desc}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-400">{tier.xp}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Patches */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-4 h-4 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Classified Patches
                </h3>
                <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-900 text-sm text-gray-600 dark:text-gray-400">
                  <p>Patches are hidden achievements. You cannot view the requirements for a patch until you unlock it through specific field actions. Examples include night-ops, rapid mapping, and correcting false intel.</p>
                </div>
              </section>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}