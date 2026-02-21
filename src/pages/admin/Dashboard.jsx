import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ blogs: 0, projects: 0, skills: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            const { count: b } = await supabase.from("blogs").select("*", { count: 'exact', head: true });
            const { count: p } = await supabase.from("projects").select("*", { count: 'exact', head: true });
            const { count: s } = await supabase.from("skills").select("*", { count: 'exact', head: true });
            setCounts({ blogs: b || 0, projects: p || 0, skills: s || 0 });
        };
        fetchCounts();
    }, [pathname]); // Refresh when navigating back to home

    const stats = [
        { label: "Total Blogs", count: counts.blogs, icon: "✍️", color: "from-blue-500 to-indigo-600" },
        { label: "Project Skill", count: counts.projects, icon: "🚀", color: "from-purple-500 to-pink-600" },
        { label: "Active Skills", count: counts.skills, icon: "⚡", color: "from-amber-400 to-orange-500" },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-950 text-white sticky top-0 h-screen hidden lg:flex flex-col shadow-2xl">
                <div className="p-8 text-2xl font-black italic tracking-tighter">
                    SKILL<span className="text-indigo-500">BLOG</span>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {["admin", "blogs", "projects", "skills"].map((item) => (
                        <NavLink
                            key={item}
                            to={item === "admin" ? "/admin" : `/admin/${item}`}
                            end={item === "admin"}
                            className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive ? "bg-indigo-600 shadow-lg translate-x-2" : "text-slate-400 hover:bg-white/5"}`}
                        >
                            <span className="capitalize">{item}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-900">
                    <button onClick={() => navigate("/login")} className="w-full text-left p-4 text-slate-500 hover:text-rose-400 transition-colors">Logout</button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Navbar />
                <main className="p-8 lg:p-12 max-w-7xl w-full mx-auto">
                    {pathname === "/admin" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                                        <h3 className="text-4xl font-black text-slate-800 mt-1">{s.count}</h3>
                                    </div>
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl shadow-lg text-white`}>{s.icon}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className={pathname === "/admin" ? "" : "bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm min-h-[60vh]"}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}