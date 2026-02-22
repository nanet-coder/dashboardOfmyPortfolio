import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { HiLockClosed, HiMail } from "react-icons/hi";

export default function Login() {
    const navigate = useNavigate();

    // Controlled State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        // ១. ប្រើ .trim() ដើម្បីលុបចន្លោះដែលលើសពី Email (ការពារបញ្ហាលើ Mobile)
        const cleanEmail = email.trim();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password
            });

            if (error) {
                setErrorMsg(error.message);
            } else if (data.user) {
                // ប្តូរទៅកាន់ទំព័រ Admin ដោយមិនចាំបាច់ Refresh (SPA Routing)
                navigate("/admin");
            }
        } catch (err) {
            setErrorMsg("មានបញ្ហាបច្ចេកទេសមួយបានកើតឡើង។");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <HiLockClosed size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome Back</h1>
                    <p className="text-slate-500 font-medium mt-2">ចូលគ្រប់គ្រង Blog និងគម្រោងរបស់អ្នក</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl animate-shake">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="relative">
                        <HiMail className="absolute left-5 top-5 text-slate-400" size={20} />
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="អ៊ីមែល (Email)"
                            // ២. ប្រើ value={email} ដើម្បីឱ្យ React គ្រប់គ្រង Input (Controlled Component)
                            value={email}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <HiLockClosed className="absolute left-5 top-5 text-slate-400" size={20} />
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="លេខសម្ងាត់ (Password)"
                            value={password}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* ៣. បន្ថែម type="submit" ដើម្បីឱ្យ Keyboard ទូរស័ព្ទស្គាល់ប៊ូតុង Go/Enter */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>កំពុងត្រួតពិនិត្យ...</span>
                            </>
                        ) : (
                            "ចូលប្រើប្រាស់"
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-10">
                    SK Blog Dashboard v2.0
                </p>
            </div>
        </div>
    );
}