export default function Navbar() {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 flex items-center justify-between px-10">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skill Blog Admin</h2>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                    A
                </div>
            </div>
        </header>
    );
}