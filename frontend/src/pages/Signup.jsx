import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";
import AnimatedPage from "../components/AnimatedPage"; 
import SchematicGlobeSVG from "../components/SchematicGlobeSVG";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleManualSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      
      // REDIRECT TO WELCOME INSTEAD OF HOME
      navigate("/welcome"); 
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      
      // REDIRECT TO WELCOME INSTEAD OF HOME
      navigate("/welcome"); 
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <AnimatedPage>
      <div className="flex min-h-[100dvh] w-full bg-[#fdfdfd] dark:bg-[#050505] transition-colors duration-500 font-sans">
        
        {/* LEFT PANEL: The Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[400px] flex flex-col"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-2">Create Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Initialize your hardware uplink.</p>
            </div>

            <div className="flex gap-4 w-full mb-8">
              <button type="button" onClick={() => handleOAuthSignup(googleProvider)} className="flex-1 py-3.5 flex items-center justify-center bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all shadow-sm cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </button>
              <button type="button" onClick={() => handleOAuthSignup(githubProvider)} className="flex-1 py-3.5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all shadow-md cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Or create with</span>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800"></div>
            </div>

            <form onSubmit={handleManualSignup} className="flex flex-col gap-5">
              {error && <p className="text-red-500 text-[11px] font-mono uppercase border border-red-500/20 bg-red-500/10 p-3 rounded-xl">{error}</p>}
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Alias / Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-black dark:focus:border-white transition-colors border border-gray-200 dark:border-gray-800 text-black dark:text-white" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-black dark:focus:border-white transition-colors border border-gray-200 dark:border-gray-800 text-black dark:text-white" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-transparent px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-black dark:focus:border-white transition-colors border border-gray-200 dark:border-gray-800 text-black dark:text-white" required />
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg disabled:opacity-50 flex items-center justify-center cursor-pointer">
                {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin"></div> : "Initialize Account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                Already registered? <span className="underline decoration-dashed underline-offset-4">Log in here</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL: Tactical Graphic */}
        <div className="hidden lg:flex w-1/2 bg-[#050505] border-l border-white/5 relative items-center justify-center overflow-hidden p-12 lg:p-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]"></div>
          <div className="absolute opacity-[0.15]">
            <SchematicGlobeSVG className="w-[800px] h-auto animate-[spin_150s_linear_infinite_reverse] text-white" />
          </div>

          <div className="relative z-10 flex flex-col items-start w-full max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
              <span className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase font-bold">New Node Registration</span>
            </div>
            <h1 className="text-6xl xl:text-7xl font-bold text-white tracking-tighter leading-[0.9] mb-8">
              Join the<br/>Network.
            </h1>
            <p className="text-gray-500 font-mono text-xs max-w-sm leading-relaxed">
              Initialize a secure identity to pin local extraction points and bypass network trackers.
            </p>
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}