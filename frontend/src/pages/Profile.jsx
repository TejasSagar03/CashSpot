import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase"; 
import AnimatedPage from "../components/AnimatedPage";
import { jsPDF } from "jspdf"; 
import html2canvas from "html2canvas";
import IntelManual from "../components/IntelManual"; 

// --- Cropping & Icon Dependencies ---
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { CheckCircle, X, RotateCcw } from "lucide-react";

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function Profile({ user, openSettings }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ savedSpots: 0 });
  const [savedSpotsList, setSavedSpotsList] = useState([]);
  
  const [repPoints, setRepPoints] = useState(0);
  const [intelAccuracy, setIntelAccuracy] = useState(100);
  const [reportsFiled, setReportsFiled] = useState(0);
  const [unlockedPatchIds, setUnlockedPatchIds] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showManual, setShowManual] = useState(false); 
  
  // Custom dialogs
  const [sysDialog, setSysDialog] = useState({ show: false, type: 'alert', title: '', message: '', onConfirm: null });
  const showAlert = (title, message) => setSysDialog({ show: true, type: 'alert', title, message, onConfirm: null });
  const showConfirm = (title, message, onConfirmAction) => setSysDialog({ show: true, type: 'confirm', title, message, onConfirm: onConfirmAction });
  
  // --- Success Screen State ---
  const [successStatus, setSuccessStatus] = useState({ show: false, message: '' });

  // --- Input Refs ---
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // --- Cropping & Image Error State ---
  const [avatarError, setAvatarError] = useState(false); 
  const [cropState, setCropState] = useState({
    image: null,
    type: null, 
    cropping: false, 
    crop: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    croppedAreaPixels: null,
  });

  const [displayName, setDisplayName] = useState(user?.displayName || "Operator");
  const [editNameValue, setEditNameValue] = useState("");
  const [bio, setBio] = useState(localStorage.getItem('cashspot_user_bio') || "Field Scout");
  const [editBioValue, setEditBioValue] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || null);
  const [bannerPreview, setBannerPreview] = useState(localStorage.getItem('cashspot_user_banner') || null);
  
  const achievementPatches = [
    { id: 'first_blood', name: 'FIRST DROP', desc: 'Verified your first ATM cache.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'night_owl', name: 'NIGHT OWL', desc: 'Encrypted a node between 0200-0400 hours.', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
    { id: 'speed_demon', name: 'SPEED DEMON', desc: 'Mapped 3 terminals under 15 mins.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'mirage', name: 'THE MIRAGE', desc: 'Overwrote 5 false positive reports.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }
  ];

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRepPoints(data.repPoints || 0);
        setIntelAccuracy(data.intelAccuracy || 100);
        setReportsFiled(data.reportsFiled || 0);
        setUnlockedPatchIds(data.unlockedPatches || []);
        if (data.bannerURL) {
            localStorage.setItem('cashspot_user_banner', data.bannerURL);
            setBannerPreview(data.bannerURL);
        }
      } else {
        setDoc(userRef, { repPoints: 0, intelAccuracy: 100, reportsFiled: 0, unlockedPatches: [], bannerURL: null, createdAt: new Date().toISOString() });
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem('cashspot_saved_spots');
      const spots = dataStr ? JSON.parse(dataStr) : [];
      setStats({ savedSpots: spots.length });
      setSavedSpotsList(spots);
    } catch (error) {
      setStats({ savedSpots: 0 });
      setSavedSpotsList([]);
    }
  }, []);

  const triggerSuccessScreen = (msg) => {
    setSuccessStatus({ show: true, message: msg });
    setTimeout(() => {
        setSuccessStatus({ show: false, message: '' });
    }, 3000); 
  };

  const calculateRank = (points) => {
    if (points >= 5000) return { title: "PHANTOM", max: 10000, color: "text-purple-500", border: "border-purple-500" };
    if (points >= 2500) return { title: "ELITE", max: 5000, color: "text-red-500", border: "border-red-500" };
    if (points >= 1000) return { title: "OPERATIVE", max: 2500, color: "text-cyan-500", border: "border-cyan-500" };
    if (points >= 250) return { title: "SCOUT", max: 1000, color: "text-blue-500", border: "border-blue-500" };
    return { title: "ROOKIE", max: 250, color: "text-gray-500", border: "border-gray-500" };
  };

  const currentRank = calculateRank(repPoints);
  const progressPercent = Math.min(100, (repPoints / currentRank.max) * 100);

  const toggleEditMode = () => {
    setEditNameValue(displayName);
    setEditBioValue(bio);
    setIsEditing(true);
  };

  // --- FIXED: DOM-Direct File Extraction ---
  const onFileChange = async (type) => {
    // 1. Grab the file directly from the physical DOM node to bypass React Event limitations
    const targetRef = type === 'banner' ? bannerInputRef : avatarInputRef;
    const file = targetRef.current?.files?.[0];

    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setCropState((prev) => ({
          ...prev,
          image: dataUrl,
          type: type,
          cropping: true,
          zoom: 1, 
          rotation: 0 
      }));
    } catch (error) {
      showAlert("ERROR", `Failed to process ${type} file.`);
    } finally {
      // 2. Reset the physical DOM node so you can upload the exact same file again if needed
      if (targetRef.current) {
         targetRef.current.value = ""; 
      }
    }
  };

  const onCropChange = (crop) => setCropState(s => ({...s, crop}));
  const onZoomChange = (zoom) => setCropState(s => ({...s, zoom}));
  const onRotationChange = (rotation) => setCropState(s => ({...s, rotation}));
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropState(s => ({...s, croppedAreaPixels}));
  }, []);

  const saveCroppedImage = async () => {
    const { image, croppedAreaPixels, type, rotation } = cropState;
    if (!image || !croppedAreaPixels) return;

    setIsSaving(true);
    try {
      const croppedResult = await getCroppedImg(image, croppedAreaPixels, rotation);
      
      if (type === 'avatar') {
          setAvatarPreview(croppedResult);
          setAvatarError(false); 
          await updateProfile(auth.currentUser, { photoURL: croppedResult });
          triggerSuccessScreen("Your Profile photo has been added successfully.");
      } else {
          setBannerPreview(croppedResult);
          localStorage.setItem('cashspot_user_banner', croppedResult);
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { bannerURL: croppedResult }, { merge: true });
          triggerSuccessScreen("Your Background photo has been added successfully.");
      }

      setCropState({ ...cropState, cropping: false, image: null, type: null });
    } catch (error) {
      console.error(error);
      showAlert("CROP ERROR", "Failed to generate cropped image.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let updated = false;
      if (editNameValue.trim() !== displayName) {
        await updateProfile(auth.currentUser, { displayName: editNameValue });
        setDisplayName(editNameValue);
        updated = true;
      }
      if (editBioValue.trim() !== bio) {
        localStorage.setItem('cashspot_user_bio', editBioValue);
        setBio(editBioValue);
        updated = true;
      }
      
      if(updated) {
        triggerSuccessScreen("Profile parameters updated successfully.");
      }
      setIsEditing(false);
      if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 20]);
    } catch (error) {
      showAlert("ERROR", `Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showAlert("WARNING", "Authentication key must be at least 6 characters.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      triggerSuccessScreen("Authentication key updated successfully.");
      setIsChangingPassword(false);
      setNewPassword("");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        showAlert("SECURITY LOCK", "Authentication expired. Sever connection and re-authenticate to change key.");
      } else {
        showAlert("ERROR", error.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await document.fonts.ready; 

      const template = document.getElementById("pdf-template");
      
      const canvas = await html2canvas(template, {
        scale: 2, 
        backgroundColor: "#000000",
        useCORS: true,
        logging: false,
        windowWidth: 800, 
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CS_TACTICAL_LOG_${displayName.toUpperCase()}.pdf`);
      
      triggerSuccessScreen("Tactical log encrypted and downloaded.");
    } catch (error) {
      console.error(error);
      showAlert("ERROR", "PDF Compilation Failed: Intel Corrupted.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    showConfirm("SYSTEM LOGOUT", "Are you sure you want to sever the connection and log out?", async () => {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        showAlert("ERROR", "Failed to terminate session.");
      }
    });
  };

  const handleDeleteAccount = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    showConfirm("CRITICAL WARNING", "Account deletion is permanent. All encrypted data will be wiped. Proceed?", async () => {
      try {
        await deleteUser(currentUser);
        navigate("/login");
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          showAlert("SECURITY LOCK", "Authentication expired. Sever connection and re-authenticate to authorize deletion.");
        } else {
          showAlert("ERROR", error.message.replace("Firebase: ", ""));
        }
      }
    });
  };

  if (!user) return null;

  const username = `@${(user.email || "user").split('@')[0].toLowerCase()}`;
  let providerName = "Email";
  if (user.providerData[0]?.providerId === "google.com") providerName = "Google";
  if (user.providerData[0]?.providerId === "github.com") providerName = "GitHub";

  return (
    <>
      <AnimatePresence>
        {successStatus.show && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
                <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} transition={{ type: "spring", damping: 15 }} className="relative bg-[#0a0a0a] border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)] rounded-[2.5rem] p-10 flex flex-col items-center text-center max-w-md w-full">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-full border-4 border-green-500 bg-green-950 flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2.5} />
                    </motion.div>
                    
                    <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-3xl text-green-500 uppercase tracking-widest mb-4">SUCCESS</h2>
                    <p className="text-sm font-medium leading-relaxed text-gray-200">{successStatus.message}</p>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-800"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-950"></div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cropState.cropping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] flex flex-col items-center bg-black/95 backdrop-blur-xl">
                
                <div className="w-full flex justify-between items-center p-6 border-b border-[#1a1a1a] bg-black z-10">
                  <div className="flex flex-col">
                    <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-2xl text-white uppercase m-0">Crop {cropState.type === 'avatar' ? 'Profile' : 'Banner'} Intel</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Adjust position & zoom</p>
                  </div>
                  <button onClick={() => setCropState({ ...cropState, cropping: false, image: null })} className="w-10 h-10 flex items-center justify-center border border-[#333] rounded-full text-gray-400 hover:text-white hover:border-white transition-colors bg-[#0a0a0a]">
                    <X className="w-5 h-5 pointer-events-none" />
                  </button>
                </div>

                <div className="relative flex-1 w-full bg-[#050505] overflow-hidden min-h-[50vh]">
                    <Cropper
                        image={cropState.image}
                        crop={cropState.crop}
                        zoom={cropState.zoom}
                        rotation={cropState.rotation}
                        aspect={cropState.type === 'avatar' ? 1 : 16 / 9}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                        onCropComplete={onCropComplete}
                        cropShape={cropState.type === 'avatar' ? "round" : "rect"}
                        showGrid={false}
                    />
                </div>

                <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center p-6 border-t border-[#1a1a1a] bg-black z-10">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                      <span className="text-xs text-gray-600 font-mono uppercase">Zoom</span>
                      <input type="range" value={cropState.zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => onZoomChange(e.target.value)} className="w-full md:w-48 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer" />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => onRotationChange((cropState.rotation + 90) % 360)} className="w-12 h-12 flex items-center justify-center border border-[#333] rounded-xl text-gray-400 hover:text-white hover:border-white transition-colors bg-[#0a0a0a]">
                            <RotateCcw className="w-5 h-5 pointer-events-none" />
                        </button>
                        <button type="button" onClick={() => setCropState({ ...cropState, cropping: false, image: null })} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">Cancel</button>
                        <button type="button" onClick={saveCroppedImage} disabled={isSaving} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-80 transition-opacity flex items-center justify-center min-w-[100px] shadow-md cursor-pointer disabled:opacity-50">
                            {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-transparent rounded-full"></span> : "Save & Secure"}
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sysDialog.show && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSysDialog({ ...sysDialog, show: false })} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-[#1a1a1a] rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
              <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-xl tracking-widest uppercase mb-2 ${sysDialog.type === 'confirm' || sysDialog.title.includes('ERROR') || sysDialog.title.includes('WARNING') || sysDialog.title.includes('DENIED') ? 'text-red-500' : 'text-black dark:text-white'}`}>
                {sysDialog.title}
              </h2>
              <p className="text-sm text-gray-500 font-mono uppercase leading-relaxed mb-8">{sysDialog.message}</p>
              <div className="flex gap-3 w-full">
                {sysDialog.type === 'confirm' && <button onClick={() => setSysDialog({ ...sysDialog, show: false })} className="flex-1 py-3 bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>}
                <button onClick={() => { if (sysDialog.onConfirm) sysDialog.onConfirm(); setSysDialog({ ...sysDialog, show: false }); }} className={`flex-1 py-3 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-opacity hover:opacity-80 ${sysDialog.type === 'confirm' ? 'bg-red-600' : 'bg-black dark:bg-white dark:text-black'}`}>
                  {sysDialog.type === 'confirm' ? 'Proceed' : 'Acknowledge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <IntelManual isOpen={showManual} onClose={() => setShowManual(false)} />

      <AnimatedPage>
        
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div id="pdf-template" className="bg-[#000000] text-white p-12 w-[800px] min-h-[1123px] block">
            <div className="flex flex-col items-center justify-center border-b-2 border-dashed border-[#222] pb-8 mb-8 text-center mt-2">
              <div className="flex items-center gap-3 mb-3">
                <h1 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-[3.5rem] leading-none tracking-[0.1em] uppercase m-0 text-white">CashSpot</h1>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff3b30] mb-1"></div>
              </div>
              <p className="text-[#666] font-mono tracking-[0.4em] text-xs uppercase">{"Field Log // Data Extraction"}</p>
            </div>

            <div className="flex justify-between items-center bg-[#0a0a0a] p-6 rounded-2xl border-2 border-[#1a1a1a] mb-12 shadow-lg">
              <div className="flex flex-col text-left">
                <span className="text-[#666] font-mono text-[10px] tracking-[0.2em] uppercase mb-1">{"// Operator ID"}</span>
                <span className="font-black text-xl tracking-widest uppercase text-white">{displayName}</span>
              </div>
              <div className="flex flex-col items-center px-8 border-x-2 border-[#1a1a1a]">
                <span className="text-[#666] font-mono text-[10px] tracking-[0.2em] uppercase mb-1">{"// Clearance"}</span>
                <span className="text-[#ff3b30] text-lg font-bold tracking-widest uppercase">{currentRank.title}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[#666] font-mono text-[10px] tracking-[0.2em] uppercase mb-1">{"// Timestamp"}</span>
                <span className="text-white font-mono text-sm tracking-widest uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="space-y-6">
              {savedSpotsList.length === 0 ? (
                <p style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-center text-[#ff3b30] mt-24 tracking-[0.2em] text-xl uppercase">{"[ ! ] ZERO HARDWARE NODES IN LOCAL CACHE"}</p>
              ) : (
                savedSpotsList.map((spot, index) => (
                  <div key={index} className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-[1.25rem] p-6 flex justify-between items-center w-full">
                    <div className="w-[70%]">
                      <span className="text-[10px] text-[#ff3b30] font-mono tracking-[0.2em] uppercase mb-2 block">{`[NODE_0${index + 1}]`}</span>
                      <h3 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-2xl leading-tight text-white uppercase break-words mb-2">{(spot.bank || spot.name || "TERMINAL")}</h3>
                      <p className="text-[#666] text-xs font-mono tracking-widest mt-1">COORD_LAT: {spot.lat.toFixed(6)} {"//"} COORD_LNG: {(spot.lng || spot.lon).toFixed(6)}</p>
                    </div>
                    <div className="bg-[#111] px-5 py-3 rounded-xl border border-[#222] text-center min-w-[120px]">
                      <div className="text-[9px] tracking-[0.3em] uppercase text-[#666] font-mono mb-1.5">{"Status"}</div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-xs tracking-widest uppercase text-white mt-0.5">{"Active"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-16 pt-8 border-t-2 border-dashed border-[#222] text-center">
              <p className="text-[10px] text-[#444] font-mono tracking-[0.3em] uppercase">{"CS_ENGINE_V3 // END_OF_LOG // ZERO-G MODE COMPATIBLE"}</p>
            </div>
          </div>
        </div>

        <div className="min-h-[100dvh] w-full bg-[#f4f4f5] dark:bg-[#000000] transition-colors duration-500 font-sans pt-24 pb-12 px-4 md:px-8">
          <div className="max-w-[900px] mx-auto flex flex-col gap-6 relative">
            
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex justify-between items-center w-full mb-[-8px]">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer"
                title="Go Back"
              >
                <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <button 
                type="button" 
                onClick={() => setShowManual(true)} 
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer" 
                title="Intel Manual"
              >
                <svg className="w-5 h-5 text-black dark:text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-[#1a1a1a] shadow-sm overflow-hidden">
              <div 
                style={{
                  backgroundImage: bannerPreview ? `url(${bannerPreview})` : `url('/default-banner.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="h-32 md:h-40 w-full relative bg-gray-50 dark:bg-[#050505] overflow-hidden border-b border-gray-200 dark:border-[#1a1a1a]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                    <button onClick={() => bannerInputRef.current?.click()} className="flex gap-2 items-center px-4 py-2 bg-black/60 text-white rounded-full text-xs font-bold hover:bg-black/80 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Change Banner
                    </button>
                    {/* FIXED: onChange now safely calls onFileChange without passing the React synthetic event */}
                    <input type="file" ref={bannerInputRef} accept="image/*" onChange={() => onFileChange('banner')} className="hidden" />
                  </div>
                )}
              </div>

              <div className="px-6 md:px-10 pb-8 relative">
                <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-6">
                  
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-[#111] overflow-hidden relative z-10 shadow-sm flex items-center justify-center">
                      {avatarPreview && !avatarError ? (
                        <img 
                            src={avatarPreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            onError={() => setAvatarError(true)} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-bold text-black dark:text-white uppercase bg-gray-200 dark:bg-[#111]" style={{ fontFamily: "'ndot 45', sans-serif" }}>
                          {displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 bg-black text-white rounded-full border-[3px] border-white dark:border-[#0a0a0a] z-20 flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-800" onClick={() => avatarInputRef.current?.click()} title="Change Avatar">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                    )}
                    {/* FIXED: onChange now safely calls onFileChange without passing the React synthetic event */}
                    <input type="file" ref={avatarInputRef} accept="image/*" onChange={() => onFileChange('avatar')} className="hidden" />

                    {!isEditing && (
                      <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 bg-blue-500 text-white rounded-full border-[3px] border-white dark:border-[#0a0a0a] z-20 flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 md:gap-3">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">Cancel</button>
                        <button type="button" onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-opacity flex items-center justify-center min-w-[80px] shadow-md cursor-pointer">
                          {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-transparent rounded-full"></span> : "Save"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={toggleEditMode} className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-opacity shadow-sm cursor-pointer">Edit Profile</button>
                        <button type="button" onClick={() => setShowAccountSettings(true)} className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors bg-white dark:bg-[#0a0a0a] shadow-sm cursor-pointer" title="Settings">
                          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex flex-col items-start w-full max-w-[400px]">
                  {isEditing ? (
                    <>
                      <input type="text" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} autoFocus className="text-2xl md:text-3xl font-bold bg-transparent text-black dark:text-white outline-none w-full border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 pb-1 mb-1" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">{username}</p>
                      <input type="text" value={editBioValue} onChange={(e) => setEditBioValue(e.target.value)} className="text-sm text-gray-600 dark:text-gray-400 bg-transparent outline-none w-full border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 pb-1 mb-1" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white capitalize pb-0 mb-0">{displayName}</h1>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">{username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 pb-1 mb-1">{bio}</p>
                    </>
                  )}

                  {!isEditing && (
                    <div className="flex items-center flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{providerName} Linked</span>
                      <span className="px-3 py-1.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-wide">Verified Node</span>
                      <span className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-[#1a1a1a] shadow-sm p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-xl tracking-widest text-black dark:text-white uppercase">Service Record</h2>
                  <p className="text-xs text-gray-500 mt-1 font-mono uppercase">Telemetry & Verification Stats</p>
                </div>
                <div className={`px-4 py-2 border-2 ${currentRank.border} rounded-lg flex items-center justify-center`}>
                  <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-sm tracking-widest ${currentRank.color}`}>[{currentRank.title}]</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-900 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reputation</span>
                  <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-3xl text-black dark:text-white tracking-widest">{repPoints}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-900 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intel Accuracy</span>
                  <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-3xl text-black dark:text-white tracking-widest">{intelAccuracy}%</span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-900 rounded-2xl col-span-2 md:col-span-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reports Filed</span>
                  <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-3xl text-black dark:text-white tracking-widest">{reportsFiled}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Progress to next rank</span>
                  <span>{repPoints} / {currentRank.max} XP</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-black dark:bg-white" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-[#1a1a1a] shadow-sm p-6 md:p-8 flex flex-col gap-6">
              <div>
                <h2 style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-xl tracking-widest text-black dark:text-white uppercase mb-1">Classified Patches</h2>
                <p className="text-xs text-gray-500 font-mono uppercase">Discover hidden objectives to unlock</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievementPatches.map((patch) => {
                  const isUnlocked = unlockedPatchIds.includes(patch.id);
                  return (
                    <div key={patch.id} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${isUnlocked ? 'border-black dark:border-white bg-gray-50 dark:bg-[#111]' : 'border-dashed border-gray-200 dark:border-gray-800 bg-transparent opacity-50'}`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? 'bg-black text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-gray-200 dark:bg-gray-900 text-gray-400 dark:text-gray-700'}`}>
                        {isUnlocked ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={patch.icon} /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                      </div>
                      <h3 style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-xs text-center tracking-widest uppercase mb-2 ${isUnlocked ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>{isUnlocked ? patch.name : '??????'}</h3>
                      <p className="text-[10px] text-center text-gray-500 font-mono leading-tight">{isUnlocked ? patch.desc : 'Condition Unknown'}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white mb-1">Saved Spots</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Places you've bookmarked.</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-3xl font-bold text-black dark:text-white tracking-tight">{stats.savedSpots}</span>
                  <button type="button" onClick={() => navigate('/locator')} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-blue-500 bg-gray-50 dark:bg-[#111] hover:bg-blue-50 transition-colors">
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
                  <button type="button" onClick={() => navigate('/home')} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-blue-500 bg-gray-50 dark:bg-[#111] hover:bg-blue-50 transition-colors">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showAccountSettings && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
                <div onClick={() => { setShowAccountSettings(false); setIsChangingPassword(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"></div>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col z-10">
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
                    {isChangingPassword ? (
                      <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl">
                        <span className="text-sm font-bold text-black dark:text-white">Enter New Password</span>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-black dark:text-white outline-none focus:border-blue-500 transition-colors" />
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

                    <button type="button" onClick={handleExportData} disabled={isExporting} className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left group cursor-pointer disabled:opacity-50">
                      <div className="flex flex-col pointer-events-none">
                        <span className="text-sm font-bold text-black dark:text-white">{isExporting ? "Compiling Intel..." : "Export Data"}</span>
                        <span className="text-xs text-gray-500 mt-0.5">Download your saved locations as PDF.</span>
                      </div>
                      {isExporting ? (
                        <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      )}
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
    </>
  );
}