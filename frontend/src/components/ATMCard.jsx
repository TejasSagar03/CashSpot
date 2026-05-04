import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc, serverTimestamp, increment, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase"; 

function ATMCard({ loc, setRouteTarget, setCompassTarget, travelMode = "walking" }) {
  const [status, setStatus] = useState(loc.status || 'active');
  const [bountyDrop, setBountyDrop] = useState(null); 

  const displayName = loc.name || loc.bank || "Unnamed Terminal";
  const displayType = loc.type || 'ATM';
  
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}M`;
    return `${(meters / 1000).toFixed(2)}KM`;
  };

  const statusConfig = {
    active: { label: 'ACTIVE', dot: 'bg-black dark:bg-white', text: 'text-black dark:text-white' },
    out_of_cash: { label: 'NO CASH', dot: 'bg-transparent border-2 border-black dark:border-white', text: 'text-gray-500 dark:text-gray-400' },
    broken: { label: 'BROKEN', dot: 'bg-red-500', text: 'text-red-500 font-bold' }
  };
  
  const currentStatus = statusConfig[status] || statusConfig.active;

  const handleReport = async (e, newStatus) => {
    e.stopPropagation(); 
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setBountyDrop({
        type: 'ERROR',
        title: 'ACCESS DENIED',
        message: 'Log in to transmit telemetry.',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      });
      return;
    }

    const reportedNodes = JSON.parse(localStorage.getItem('cashspot_reported_nodes') || '[]');
    if (reportedNodes.includes(loc.id)) {
      setBountyDrop({
        type: 'REJECTED',
        title: 'INTEL REJECTED',
        message: 'Node verified recently. No duplicate XP awarded.',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      });
      return; 
    }

    setStatus(newStatus);

    let currentCount = parseInt(localStorage.getItem('cashspot_session_reports') || '0') + 1;
    localStorage.setItem('cashspot_session_reports', currentCount);
    reportedNodes.push(loc.id);
    localStorage.setItem('cashspot_reported_nodes', JSON.stringify(reportedNodes));

    let pointsEarned = 10;
    let dropType = "STANDARD";

    if (currentCount % 5 === 0) {
      pointsEarned = 50;
      dropType = "RARE";
    }

    setBountyDrop({
      type: dropType,
      title: dropType === 'RARE' ? 'Milestone Reached' : 'Intel Verified',
      xp: pointsEarned,
      statusRep: newStatus.replace('_', ' ').toUpperCase(),
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    });

    try {
      const atmRef = doc(db, "atm_status", loc.id.toString());
      await setDoc(atmRef, { 
        status: newStatus, 
        timestamp: serverTimestamp(), 
        reportedBy: currentUser.uid 
      }, { merge: true });

      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { 
        repPoints: increment(pointsEarned), 
        reportsFiled: increment(1), 
        unlockedPatches: arrayUnion("first_blood") 
      }, { merge: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {bountyDrop && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setBountyDrop(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-[#1a1a1a] rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 shadow-lg ${bountyDrop.type === 'RARE' ? 'bg-purple-500 border-purple-300 dark:border-purple-900 animate-pulse text-white' : bountyDrop.type === 'REJECTED' || bountyDrop.type === 'ERROR' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-500' : 'bg-black dark:bg-white border-gray-300 dark:border-gray-800 text-white dark:text-black'}`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={bountyDrop.icon} /></svg>
              </div>
              <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-xl tracking-widest uppercase mb-1 ${bountyDrop.type === 'REJECTED' || bountyDrop.type === 'ERROR' ? 'text-red-500' : 'text-black dark:text-white'}`}>{bountyDrop.title}</h2>
              {bountyDrop.type === 'REJECTED' || bountyDrop.type === 'ERROR' ? (
                <p className="text-xs text-gray-500 font-mono uppercase mb-6 leading-relaxed">{bountyDrop.message}</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 font-mono uppercase mb-6">Node marked as: {bountyDrop.statusRep}</p>
                  <div className={`w-full py-4 rounded-xl mb-6 border-2 border-dashed ${bountyDrop.type === 'RARE' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-800'}`}>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bounty Claimed</span>
                    <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-4xl tracking-widest ${bountyDrop.type === 'RARE' ? 'text-purple-600 dark:text-purple-400' : 'text-black dark:text-white'}`}>+{bountyDrop.xp} XP</span>
                  </div>
                </>
              )}
              <button onClick={() => setBountyDrop(null)} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Acknowledge</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="shrink-0 flex-none w-full min-h-[120px] p-5 bg-white dark:bg-black border-[2px] border-black dark:border-white rounded-3xl flex flex-col relative shadow-sm cursor-default">
        <div className="flex justify-between items-start gap-4 w-full">
          <div className="flex flex-col flex-1 overflow-hidden">
            <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">[{displayType}]</span>
            <h3 className="text-2xl font-black text-black dark:text-white leading-none truncate mb-2">{displayName}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot} transition-colors duration-300`}></div>
              <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-[11px] tracking-[0.1em] ${currentStatus.text} transition-colors duration-300`}>{currentStatus.label}</span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div style={{ fontFamily: "'ndot 45', sans-serif" }} className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[14px] tracking-widest flex items-center justify-center">{formatDistance(loc.distance)}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 w-full">
          <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 block">Report Status</span>
          <div className="flex gap-2">
            <button onClick={(e) => handleReport(e, 'active')} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">CASH IN</button>
            <button onClick={(e) => handleReport(e, 'out_of_cash')} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-900 text-gray-500 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">EMPTY</button>
            <button onClick={(e) => handleReport(e, 'broken')} className="flex-1 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-colors cursor-pointer">BROKEN</button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 flex justify-start items-center w-full gap-3">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); if(setCompassTarget) setCompassTarget(loc); }} className="w-10 h-10 flex items-center justify-center bg-transparent border-2 border-black dark:border-white text-black dark:text-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); if(setRouteTarget) setRouteTarget(loc); }} className="w-10 h-10 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default ATMCard;