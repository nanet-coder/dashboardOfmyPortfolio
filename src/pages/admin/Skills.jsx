import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";
import { HiPlus, HiX, HiLightningBolt, HiSearch } from "react-icons/hi";

export default function Skills() {
    const [skills, setSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // 1. Search State
    const [name, setName] = useState("");
    const [rating, setRating] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSkills = async () => {
        const { data } = await supabase.from("skills").select("*").order("rating", { ascending: false });
        setSkills(data || []);
    };

    useEffect(() => { fetchSkills(); }, []);

    // 2. Filter Logic
    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let icon_url = "";
            if (imageFile) icon_url = await uploadImage(imageFile);
            await supabase.from("skills").insert({ name, rating: parseInt(rating), icon_url });
            setName(""); setRating(""); setImageFile(null); setImagePreview(null);
            setIsModalOpen(false);
            fetchSkills();
        } catch (err) { alert(err.message); }
        setLoading(false);
    };

    return (
        <div className="relative">
            {/* FAB for Mobile */}
            <button onClick={() => setIsModalOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-[60] bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
                <HiPlus size={28} />
            </button>

            <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-220px)] overflow-hidden">
                {/* FORM COLUMN / MODAL */}
                <div className={`${isModalOpen ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" : "hidden lg:block lg:col-span-1"}`}>
                    <div className="bg-white lg:bg-transparent w-full max-w-xl p-6 lg:p-0 rounded-[2.5rem] relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <button onClick={() => setIsModalOpen(false)} className="lg:hidden absolute top-4 right-6 text-slate-400 hover:text-rose-500"><HiX size={24} /></button>

                        <form className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner" onSubmit={handleAddSkill}>
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <HiLightningBolt className="text-amber-400" /> New Skill
                            </h2>

                            <input type="text" placeholder="Skill Name (e.g. React)" className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={name} onChange={e => setName(e.target.value)} required />

                            <div className="relative">
                                <input type="number" min="0" max="100" placeholder="Rating (0-100)" className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={rating} onChange={e => setRating(e.target.value)} required />
                                <span className="absolute right-4 top-4 font-black text-slate-300">%</span>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white relative hover:border-indigo-400 transition-colors">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setImageFile(e.target.files[0]); if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                                {imagePreview ? <img src={imagePreview} className="w-12 h-12 mx-auto object-contain" /> : <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon / Logo</p>}
                            </div>

                            <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
                                {loading ? "ADDING..." : "ADD SKILL"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* SKILLS LIST + SEARCH */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">

                    {/* 3. BORDERLESS SEARCH BOX */}
                    <div className="relative mb-6 group">
                        <input
                            type="text"
                            placeholder="Search skills..."
                            className="w-full p-4 pl-12 bg-white rounded-3xl border-none shadow-sm focus:shadow-md focus:ring-0 outline-none transition-all text-slate-600 font-semibold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <HiSearch className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={24} />

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-4 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <HiX size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-20">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredSkills.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest">
                                    {searchTerm ? "Skill not found" : "No skills added yet"}
                                </div>
                            ) : (
                                filteredSkills.map(s => (
                                    <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all relative hover:shadow-lg hover:-translate-y-1">
                                        <button onClick={async () => { if (confirm("Delete this skill?")) { await supabase.from("skills").delete().eq("id", s.id); fetchSkills(); } }} className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <HiX size={18} />
                                        </button>

                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 p-2 group-hover:bg-indigo-50 transition-colors">
                                            {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-contain" /> : <HiLightningBolt className="text-slate-300" size={24} />}
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">{s.name}</h3>
                                            <span className="text-[10px] font-bold text-indigo-500 mt-1">{s.rating}%</span>
                                        </div>

                                        <div className="bg-slate-100 h-1.5 rounded-full mt-4 w-full overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${s.rating}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}