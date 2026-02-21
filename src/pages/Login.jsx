import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-slate-500 mb-8">Manage your blog and projects.</p>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate("/admin"); }}>
                    <input type="email" placeholder="Email" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                    <input type="password" placeholder="Password" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                    <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Sign In</button>
                </form>
            </div>
        </div>
    );
}