import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
// REMOVED sendPasswordResetEmail, ADDED updatePassword
import { signOut, updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import AnimatedPage from "../components/AnimatedPage";
import { jsPDF } from "jspdf"; 

export default function Profile({ user, openSettings }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ savedSpots: 0 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  
  // New state for In-App Password Change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  const [displayName, setDisplayName] = useState(user?.displayName || "Tejas");
  const [editNameValue, setEditNameValue] = useState("");
  
  const [bio, setBio] = useState(localStorage.getItem('cashspot_user_bio') || "BCA Undergraduate");
  const [editBioValue, setEditBioValue] = useState("");

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem('cashspot_saved_spots');
      const spots = dataStr ? JSON.parse(dataStr) : [];
      setStats({ savedSpots: spots.length });
    } catch (error) {
      setStats({ savedSpots: 0 });
    }
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        alert("Failed to log out.");
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (editNameValue.trim() !== displayName) {
        await updateProfile(auth.currentUser, { displayName: editNameValue });
        setDisplayName(editNameValue);
      }
      if (editBioValue.trim() !== bio) {
        localStorage.setItem('cashspot_user_bio', editBioValue);
        setBio(editBioValue);
      }
      setIsEditing(false);
      if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 20]);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    setEditNameValue(displayName);
    setEditBioValue(bio);
    setIsEditing(true);
  };

  // --- IN-APP PASSWORD UPDATE LOGIC ---
  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Success! Your password has been changed.");
      setIsChangingPassword(false);
      setNewPassword("");
    } catch (error) {
      console.error("Password Update Error:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("SECURITY CHECK: You must log out and log back in before changing your password directly.");
        await signOut(auth);
        navigate("/login");
      } else {
        alert(`Error: ${error.message.replace("Firebase: ", "")}`);
      }
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = localStorage.getItem('cashspot_saved_spots') || "[]";
      const spots = JSON.parse(dataStr);

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0); 
      doc.text("CashSpot Node Dossier", 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); 
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Operator ID: ${user.uid}`, 20, 41);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 48, 190, 48); 
      
      let yPos = 60;
      doc.setTextColor(0, 0, 0);
      
      if (spots.length === 0) {
        doc.setFontSize(12);
        doc.text("No hardware nodes currently pinned in cache.", 20, yPos);
      } else {
        spots.forEach((spot, index) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`Node ${index + 1}: ${spot.name || spot.title || 'Unnamed Location'}`, 20, yPos);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Latitude: ${spot.lat || spot.latitude || 'N/A'}  |  Longitude: ${spot.lng || spot.longitude || 'N/A'}`, 20, yPos + 6);
          if (spot.address || spot.description) {
             doc.text(`Details: ${spot.address || spot.description}`, 20, yPos + 12);
             yPos += 22;
          } else {
             yPos += 16;
          }
          doc.setTextColor(0, 0, 0); 
        });
      }

      doc.save(`CashSpot_Dossier_${new Date().toISOString().split('T')[0]}.pdf`);
      if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 30]);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const confirm1 = window.confirm("WARNING: You are about to permanently delete your account. This action cannot be undone. Proceed?");
      if (!confirm1) return;
      const confirm2 = window.confirm("Are you absolutely sure? All associated data will be lost.");
      if (!confirm2) return;

      await deleteUser(currentUser);
      navigate("/login");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        alert("SECURITY CHECK: You must log out and log back in before deleting your account.");
        await signOut(auth);
        navigate("/login");
      } else {
        alert(`Error: ${error.message.replace("Firebase: ", "")}`);
      }
    }
  };

  if (!user) return null;

  const username = `@${(user.email || "user").split('@')[0].toLowerCase()}`;
  let providerName = "Email";
  const rawProvider = user.providerData[0]?.providerId;
  if (rawProvider === "google.com") providerName = "Google";
  if (rawProvider === "github.com") providerName = "GitHub";

  return (
    <AnimatedPage>
      <div className="min-h-[100dvh] w-full bg-[#f4f4f5] dark:bg-[#000000] transition-colors duration-500 font-sans pt-24 pb-12 px-4 md:px-8">
        
        <div className="max-w-[900px] mx-auto flex flex-col gap-4 relative">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-[#1a1a1a] shadow-sm overflow-hidden"
          >
            <div className="h-32 md:h-40 w-full relative bg-gray-50 dark:bg-[#050505] overflow-hidden border-b border-gray-200 dark:border-[#1a1a1a]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 dark:bg-white/5 blur-[50px] rounded-full pointer-events-none"></div>
            </div>

            <div className="px-6 md:px-10 pb-8 relative">
              <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-[#111] overflow-hidden relative z-10 shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-black dark:text-white uppercase">{displayName.charAt(0)}</div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 bg-blue-500 text-white rounded-full border-[3px] border-white dark:border-[#0a0a0a] z-20 flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
                  </div>
                </div>
                
                <div className="flex gap-2 md:gap-3">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">
                        Cancel
                      </button>
                      <button type="button" onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-opacity flex items-center justify-center min-w-[80px] shadow-md cursor-pointer">
                        {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-transparent rounded-full"></span> : "Save"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={toggleEditMode} className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-opacity shadow-sm cursor-pointer">
                        Edit Profile
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => setShowAccountSettings(true)} 
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors bg-white dark:bg-[#0a0a0a] shadow-sm cursor-pointer"
                        title="Account Settings"
                      >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-col items-start w-full max-w-[400px]">
                {isEditing ? (
                  <>
                    <input 
                      type="text" 
                      value={editNameValue} 
                      onChange={(e) => setEditNameValue(e.target.value)} 
                      autoFocus
                      className="text-2xl md:text-3xl font-bold bg-transparent text-black dark:text-white outline-none w-full border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 transition-colors pb-1 mb-1 caret-blue-500"
                    />
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">{username}</p>
                    <input 
                      type="text" 
                      value={editBioValue} 
                      onChange={(e) => setEditBioValue(e.target.value)} 
                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent outline-none w-full border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 transition-colors pb-1 mb-1 caret-blue-500"
                    />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white capitalize pb-0 mb-0 border-b border-transparent">{displayName}</h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">{username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pb-1 mb-1 border-b border-transparent">{bio}</p>
                  </>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {providerName} Linked
                </span>
                <span className="px-3 py-1.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-wide">
                  Verified Node
                </span>
                <span className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white mb-1">Saved Spots</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Places you've bookmarked.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-3xl font-bold text-black dark:text-white tracking-tight">{stats.savedSpots}</span>
                <button type="button" onClick={() => navigate('/locator')} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-blue-500 bg-gray-50 dark:bg-[#111] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white mb-1">System Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">App is running smoothly.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-green-600 dark:text-green-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Online
                </span>
                <button type="button" onClick={() => navigate('/home')} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-blue-500 bg-gray-50 dark:bg-[#111] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>

            <div onClick={handleLogout} className="bg-[#fff5f5] dark:bg-[#140505] border border-red-100 dark:border-red-900/30 p-6 rounded-3xl flex flex-col justify-between cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-red-600 dark:text-red-500 mb-1">Sign Out</h3>
                <p className="text-xs text-red-400 dark:text-red-500/70">Safely log out of your account.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-red-600 dark:text-red-500">Log out</span>
                <div className="w-8 h-8 rounded-full border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-500 group-hover:translate-x-1 transition-transform bg-white dark:bg-[#1a0a0a]">
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

        {/* --- ACCOUNT SETTINGS MODAL --- */}
        <AnimatePresence>
          {showAccountSettings && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
              <div 
                onClick={() => {
                  setShowAccountSettings(false);
                  setIsChangingPassword(false);
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              ></div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col z-10"
              >
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-900 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Account Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your identity and data.</p>
                  </div>
                  <button type="button" onClick={() => { setShowAccountSettings(false); setIsChangingPassword(false); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-[#222] transition-colors cursor-pointer">
                    <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  
                  {/* DYNAMIC PASSWORD CHANGE UI */}
                  {isChangingPassword ? (
                    <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl">
                      <span className="text-sm font-bold text-black dark:text-white">Enter New Password</span>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-black dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setIsChangingPassword(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg text-xs font-bold transition-colors">Cancel</button>
                        <button onClick={handleUpdatePassword} className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Save</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setIsChangingPassword(true)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left group cursor-pointer">
                      <div className="flex flex-col pointer-events-none">
                        <span className="text-sm font-bold text-black dark:text-white">Change Password</span>
                        <span className="text-xs text-gray-500 mt-0.5">Update your authentication key directly.</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}

                  <button type="button" onClick={handleExportData} className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left group cursor-pointer">
                    <div className="flex flex-col pointer-events-none">
                      <span className="text-sm font-bold text-black dark:text-white">Export Data</span>
                      <span className="text-xs text-gray-500 mt-0.5">Download your saved locations as PDF.</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>

                  <div className="w-full h-[1px] bg-gray-100 dark:bg-gray-900 my-4"></div>

                  <button type="button" onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-500/5 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group cursor-pointer">
                    <div className="flex flex-col pointer-events-none">
                      <span className="text-sm font-bold text-red-600 dark:text-red-500">Delete Account</span>
                      <span className="text-xs text-red-400 dark:text-red-500/70 mt-0.5">Permanently erase your identity.</span>
                    </div>
                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatedPage>
  );
}