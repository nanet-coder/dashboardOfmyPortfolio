import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [projectUrl, setProjectUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async () => {
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
        if (error) console.log(error);
        else setProjects(data);
    };

    useEffect(() => { fetchProjects(); }, []);

    const saveProject = async (e) => {
        e.preventDefault();
        setLoading(true);
        let image_url = imagePreview; // Default to existing if editing

        if (imageFile) {
            image_url = await uploadImage(imageFile);
        }

        const payload = { title, desc, project_url: projectUrl, image_url };

        if (editingId) {
            await supabase.from("projects").update(payload).eq("id", editingId);
        } else {
            await supabase.from("projects").insert(payload);
        }

        // Reset Form
        setTitle(""); setDesc(""); setProjectUrl("");
        setImageFile(null); setImagePreview(null); setEditingId(null);
        fetchProjects();
        setLoading(false);
    };

    const editProject = (p) => {
        setTitle(p.title); setDesc(p.desc); setProjectUrl(p.project_url);
        setImagePreview(p.image_url); setEditingId(p.id); setImageFile(null);
    };

    const deleteProject = async (id) => {
        if (window.confirm("Delete this project?")) {
            await supabase.from("projects").delete().eq("id", id);
            fetchProjects();
        }
    };

    return (
        /* Container fixed height to match Blogs/Skills scroll logic */
        <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-180px)] overflow-hidden">

            {/* LEFT COLUMN: STICKY FORM */}
            <div className="lg:col-span-1 pb-4">
                <form
                    className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner h-full overflow-y-auto scrollbar-hide"
                    onSubmit={saveProject}
                >
                    <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                        🚀 {editingId ? "Edit Project" : "New Project"}
                    </h2>

                    <input
                        type="text"
                        placeholder="Project Title"
                        className="w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <textarea
                        placeholder="Description..."
                        className="w-full p-4 rounded-2xl border-none h-32 shadow-sm focus:ring-2 focus:ring-indigo-500"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        required
                    />

                    <input
                        type="url"
                        placeholder="Project URL (Demo Link)"
                        className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500"
                        value={projectUrl}
                        onChange={e => setProjectUrl(e.target.value)}
                    />

                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center relative group hover:border-indigo-400 transition-colors bg-white">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={e => {
                                setImageFile(e.target.files[0]);
                                if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0]));
                            }}
                        />
                        {imagePreview ? (
                            <img src={imagePreview} className="h-32 w-full object-cover rounded-xl" />
                        ) : (
                            <div className="py-4">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Upload Project Screenshot</p>
                            </div>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                    >
                        {loading ? "SAVING..." : editingId ? "UPDATE PROJECT" : "ADD PROJECT"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={() => { setEditingId(null); setTitle(""); setDesc(""); setProjectUrl(""); setImagePreview(null); }}
                            className="w-full py-2 text-slate-400 font-bold text-xs uppercase"
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            {/* RIGHT COLUMN: SCROLLABLE LIST (FULL COLOR) */}
            <div className="lg:col-span-2 overflow-y-auto scrollbar-hide pr-2 pb-10">
                <div className="grid grid-cols-1 gap-6">
                    {projects.length === 0 && (
                        <div className="p-20 text-center text-slate-300 font-bold border-2 border-dashed rounded-[3rem]">
                            No projects yet.
                        </div>
                    )}

                    {projects.map(p => (
                        <div
                            key={p.id}
                            className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            {/* Full Color Image - No Grayscale */}
                            <div className="w-full md:w-56 h-40 shrink-0 relative rounded-[2rem] overflow-hidden shadow-sm">
                                {p.image_url ? (
                                    <img src={p.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 italic text-xs">No Image</div>
                                )}
                            </div>

                            <div className="flex-1 py-2 flex flex-col">
                            

                                <p className="text-slate-400 text-sm line-clamp-2 mt-2 leading-relaxed">{p.desc}</p>

                                <div className="flex gap-4 mt-auto pt-4 border-t border-slate-50">
                                    <button onClick={() => editProject(p)} className="text-indigo-600 font-black text-xs uppercase hover:text-indigo-400">Edit</button>
                                    <button onClick={() => deleteProject(p.id)} className="text-rose-500 font-black text-xs uppercase hover:text-rose-300">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}