import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        // Prevent double-clicks on mobile
        if (loading) return;

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(), // Remove accidental spaces from mobile keyboard
                password
            });

            if (error) {
                alert(error.message);
            } else if (data.user) {
                // Success
                navigate("/admin");
            }
        } catch (err) {
            alert("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-slate-500 mb-8">Manage your blog and projects.</p>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        autoComplete="email" // Helps mobile autofill
                        className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={email} // Controlled component
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password" // Helps mobile autofill
                        className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={password} // Controlled component
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit" // Crucial for mobile keyboards
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}