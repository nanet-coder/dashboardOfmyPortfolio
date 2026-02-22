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
            // Fetching all counts in parallel for better performance
            const [bRes, pRes, sRes] = await Promise.all([
                supabase.from("blogs").select("*", { count: 'exact', head: true }),
                supabase.from("projects").select("*", { count: 'exact', head: true }),
                supabase.from("skills").select("*", { count: 'exact', head: true })
            ]);

            setCounts({
                blogs: bRes.count || 0,
                projects: pRes.count || 0,
                skills: sRes.count || 0
            });
        };
        fetchCounts();
    }, [pathname]);

    const navItems = [
        { path: "/admin", label: "Home", icon: "🏠" },
        { path: "/admin/blogs", label: "Blogs", icon: "✍️" },
        { path: "/admin/projects", label: "Projects", icon: "🚀" },
        { path: "/admin/skills", label: "Skills", icon: "⚡" },
    ];

    // Stats data configuration for the UI
    const statsData = [
        { label: "Total Blogs", value: counts.blogs, color: "bg-indigo-50 text-indigo-600", icon: "📝" },
        { label: "Active Projects", value: counts.projects, color: "bg-rose-50 text-rose-600", icon: "📂" },
        { label: "Skills Mastered", value: counts.skills, color: "bg-amber-50 text-amber-600", icon: "🔥" },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* SIDEBAR (Remains same) */}
            <aside className="w-20 lg:w-72 bg-slate-950 text-white flex flex-col sticky top-0 h-screen z-50 transition-all shadow-2xl shrink-0">
                <div className="p-6 lg:p-8 text-xl lg:text-2xl font-black italic tracking-tighter text-center lg:text-left">
                    SK<span className="text-indigo-500">B</span><span className="hidden lg:inline text-indigo-500">LOG</span>
                </div>

                <nav className="flex-1 px-2 lg:px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/admin"}
                            className={({ isActive }) => `
                                flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl transition-all 
                                ${isActive ? "bg-indigo-600 shadow-lg text-white" : "text-slate-400 hover:bg-white/5"}
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="hidden lg:block capitalize font-bold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-900">
                    <button onClick={() => navigate("/login")} className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 text-slate-500 hover:text-rose-400 font-bold text-xs uppercase tracking-widest transition-colors">
                        <span>🚪</span>
                        <span className="hidden lg:block">Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Navbar />
                <main className="p-4 lg:p-12 max-w-7xl w-full mx-auto">

                    {/* STATS AREA - Only visible on /admin */}
                    {pathname === "/admin" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {statsData.map((stat, index) => (
                                <div key={index} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                                        <h2 className="text-3xl font-black text-slate-800 leading-none mt-1">{stat.value}</h2>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CONTENT CONTAINER */}
                    <div className={pathname === "/admin" ? "" : "bg-white rounded-[3rem] border border-slate-200 p-4 lg:p-8 shadow-sm min-h-[70vh]"}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}