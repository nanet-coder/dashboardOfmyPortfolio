import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";

export default function Skills() {
    const [skills, setSkills] = useState([]);
    const [name, setName] = useState("");
    const [rating, setRating] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSkills = async () => {
        const { data } = await supabase.from("skills").select("*").order("rating", { ascending: false });
        setSkills(data || []);
    };

    useEffect(() => { fetchSkills(); }, []);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setLoading(true);
        let icon_url = "";
        if (imageFile) icon_url = await uploadImage(imageFile);
        await supabase.from("skills").insert({ name, rating, icon_url });
        setName(""); setRating(""); setImageFile(null); setImagePreview(null);
        fetchSkills();
        setLoading(false);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-180px)] overflow-hidden">

            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-1 pb-4">
                <form className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner h-full overflow-y-auto scrollbar-hide" onSubmit={handleAddSkill}>
                    <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">⚡ New Skill</h2>

                    <input type="text" placeholder="Skill Name" className="w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={name} onChange={e => setName(e.target.value)} required />
                    <input type="number" placeholder="Rating %" className="w-full p-4 rounded-2xl border-none shadow-sm" value={rating} onChange={e => setRating(e.target.value)} required />

                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center relative group hover:border-indigo-400 transition-colors bg-white">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => {
                            setImageFile(e.target.files[0]);
                            if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0]));
                        }} />
                        {imagePreview ? (
                            <img src={imagePreview} className="w-16 h-16 mx-auto object-contain" />
                        ) : (
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Upload Icon</p>
                        )}
                    </div>

                    <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
                        {loading ? "..." : "ADD SKILL"}
                    </button>
                </form>
            </div>

            {/* RIGHT COLUMN: LIST (COLOR ALWAYS ON) */}
            <div className="lg:col-span-2 overflow-y-auto scrollbar-hide pr-2 pb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {skills.map(s => (
                        <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 relative">

                            <button onClick={async () => { if (confirm("Delete?")) { await supabase.from("skills").delete().eq("id", s.id); fetchSkills(); } }}
                                className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>

                            {/* FIXED: No grayscale, No opacity, No hover color-change */}
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 p-4 transition-transform group-hover:scale-105 duration-300">
                                {s.icon_url ? (
                                    <img src={s.icon_url} alt={s.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-3xl">⚡</span>
                                )}
                            </div>

                            <h3 className="font-black text-slate-800 text-sm">{s.name}</h3>

                            <div className="flex items-center gap-2 mt-4 w-full">
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.rating}%` }}></div>
                                </div>
                                <span className="text-indigo-600 font-black text-[10px]">{s.rating}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}