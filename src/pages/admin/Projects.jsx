import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";
import { HiPlus, HiX, HiLink, HiExternalLink, HiSearch } from "react-icons/hi";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // 1. Search State
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [projectUrl, setProjectUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProjects = async () => {
        const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
        setProjects(data || []);
    };

    useEffect(() => { fetchProjects(); }, []);

    // 2. Search Logic (Filtering)
    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openForm = (p = null) => {
        if (p) {
            setEditingId(p.id);
            setTitle(p.title);
            setDesc(p.desc);
            setProjectUrl(p.project_url || "");
            setImagePreview(p.image_url);
        } else {
            setEditingId(null);
            setTitle("");
            setDesc("");
            setProjectUrl("");
            setImagePreview(null);
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let image_url = imagePreview;
            if (imageFile) image_url = await uploadImage(imageFile);

            const payload = { title, desc, project_url: projectUrl, image_url };

            if (editingId) await supabase.from("projects").update(payload).eq("id", editingId);
            else await supabase.from("projects").insert(payload);

            setIsModalOpen(false);
            fetchProjects();
        } catch (err) { alert(err.message); }
        setLoading(false);
    };

    return (
        <div className="relative">
            {/* FAB for Mobile */}
            <button onClick={() => openForm()} className="lg:hidden fixed bottom-6 right-6 z-[60] bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
                <HiPlus size={28} />
            </button>

            <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-220px)] overflow-hidden">
                {/* FORM COLUMN / MODAL */}
                {/* FORM COLUMN / MODAL */}
                <div className={`${isModalOpen ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" : "hidden lg:block lg:col-span-1"}`}>
                    <div className="bg-white lg:bg-transparent w-full max-w-xl p-6 lg:p-0 rounded-[2.5rem] relative max-h-[90vh] overflow-y-auto scrollbar-hide ">
                        {/* Close button now visible on all screens */}
                        <button
                            onClick={() => { setIsModalOpen(false); setImagePreview(null); setImageFile(null); setEditingId(null); setTitle(""); setDesc(""); setProjectUrl(""); }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <HiX size={24} />
                        </button>

                        <form className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner" onSubmit={handleSave}>
                            <h2 className="text-xl font-black text-slate-800">🚀 {editingId ? "Edit" : "New"} Project</h2>
                            <input type="text" placeholder="Project Title" className="w-full p-4 rounded-2xl border-none shadow-sm" value={title} onChange={e => setTitle(e.target.value)} required />
                            <div className="relative">
                                <input type="url" placeholder="Project Link" className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} />
                                <HiLink className="absolute left-4 top-4 text-slate-400" size={20} />
                            </div>
                            <textarea placeholder="Description" className="w-full p-4 rounded-2xl border-none h-24 shadow-sm" value={desc} onChange={e => setDesc(e.target.value)} required />
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-white relative hover:border-indigo-400 transition-colors">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setImageFile(e.target.files[0]); if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                                {imagePreview ? <img src={imagePreview} className="h-20 mx-auto rounded-xl" /> : <p className="text-[10px] font-bold text-slate-400 uppercase">Screenshot</p>}
                            </div>
                            <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">{loading ? "SAVING..." : "SAVE PROJECT"}</button>
                        </form>
                    </div>
                </div>

                {/* LIST COLUMN + SEARCH BAR */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">

                    {/* 3. BORDERLESS SEARCH BOX */}
                    <div className="relative mb-6 group">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full p-4 pl-12 bg-white rounded-[2rem] border-none shadow-sm focus:shadow-md focus:ring-0 outline-none transition-all text-slate-600 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <HiSearch className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={24} />

                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-4 text-slate-300 hover:text-rose-500">
                                <HiX size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-20">
                        <div className="grid grid-cols-1 gap-6">
                            {filteredProjects.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest">
                                    {searchTerm ? "No projects found" : "No projects yet"}
                                </div>
                            ) : (
                                filteredProjects.map(p => (
                                    <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all group">
                                        <img src={p.image_url} className="w-full md:w-40 h-32 rounded-[1.5rem] object-cover shadow-sm" alt="" />
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-black text-lg text-slate-800">{p.title}</h3>
                                                {p.project_url && (
                                                    <a href={p.project_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors">
                                                        <HiExternalLink size={20} />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-xs mt-2 line-clamp-2">{p.desc}</p>
                                            <div className="flex gap-4 mt-auto pt-4 border-t border-slate-50">
                                                <button onClick={() => openForm(p)} className="text-indigo-600 font-black text-xs uppercase hover:underline">Edit</button>
                                                <button onClick={async () => { if (confirm("Delete?")) { await supabase.from("projects").delete().eq("id", p.id); fetchProjects(); } }} className="text-rose-500 font-black text-xs uppercase hover:underline">Delete</button>
                                            </div>
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