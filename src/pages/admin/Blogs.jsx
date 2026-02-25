import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";
import { HiPlus, HiX, HiCalendar, HiLink, HiVideoCamera, HiSearch } from "react-icons/hi";

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // 1. Add Search State
    const [form, setForm] = useState({ title: "", date: "", video_url: "", content: "" });

    // File & UI States
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [videoMode, setVideoMode] = useState("url");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBlogs = async () => {
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .order("id", { ascending: false });

        if (error) console.error("Error fetching blogs:", error);
        else setBlogs(data || []);
    };

    useEffect(() => { fetchBlogs(); }, []);

    // 2. Filter Logic
    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setEditingId(null);
        setForm({ title: "", date: "", video_url: "", content: "" });
        setImagePreview(null);
        setImageFile(null);
        setVideoFile(null);
        setVideoMode("url");
    };

    const uploadVideoToStorage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-videos/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const openForm = (blog = null) => {
        if (blog) {
            setEditingId(blog.id);
            setForm({ title: blog.title, date: blog.date, video_url: blog.video_url || "", content: blog.content });
            setImagePreview(blog.image_url);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let image_url = imagePreview;
            let video_url = form.video_url;
            if (imageFile) image_url = await uploadImage(imageFile);
            if (videoMode === "upload" && videoFile) video_url = await uploadVideoToStorage(videoFile);

            const payload = { title: form.title, date: form.date, content: form.content, image_url, video_url };
            if (editingId) await supabase.from("blogs").update(payload).eq("id", editingId);
            else await supabase.from("blogs").insert(payload);

            resetForm();
            setIsModalOpen(false);
            await fetchBlogs();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative ">
            {/* MOBILE FLOATING BUTTON */}
            <button
                onClick={() => openForm()}
                className="lg:hidden fixed bottom-6 right-6 z-[60] bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
            >
                <HiPlus size={28} />
            </button>

            <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-220px)] overflow-hidden">

                {/* LEFT COLUMN: FORM */}
                <div className={`${isModalOpen ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" : "hidden lg:block lg:col-span-1"}`}>
                    <div className="bg-white lg:bg-transparent w-full max-w-xl lg:max-w-none p-6 lg:p-0 rounded-[2.5rem] relative max-h-[90vh] lg:max-h-full flex flex-col shadow-2xl lg:shadow-none">
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="lg:hidden absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors">
                            <HiX size={24} />
                        </button>
                        <form className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner overflow-y-auto scrollbar-hide" onSubmit={handleSubmit}>
                            <h2 className="text-xl font-black text-slate-800 mb-2">{editingId ? "✨ Edit Post" : "✍️ New Blog"}</h2>
                            <input type="text" placeholder="Post Title" className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            <div className="relative">
                                <input type="date" className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm text-slate-500 focus:ring-2 focus:ring-indigo-500" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                                <HiCalendar className="absolute left-4 top-4 text-slate-400" size={20} />
                            </div>
                            <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
                                <button type="button" onClick={() => setVideoMode("url")} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoMode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Video URL</button>
                                <button type="button" onClick={() => setVideoMode("upload")} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoMode === 'upload' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}`}>Upload MP4</button>
                            </div>
                            {videoMode === "url" ? (
                                <div className="relative">
                                    <input type="url" placeholder="YouTube/Video Link" className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />
                                    <HiLink className="absolute left-4 top-4 text-slate-400" size={20} />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-rose-200 rounded-2xl p-4 text-center relative bg-white">
                                    <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setVideoFile(e.target.files[0])} />
                                    <div className="flex flex-col items-center gap-1">
                                        <HiVideoCamera className="text-rose-300" size={24} />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{videoFile ? videoFile.name : "Select Video File"}</p>
                                    </div>
                                </div>
                            )}
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center relative bg-white hover:border-indigo-400 transition-colors">
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                                {imagePreview ? <img src={imagePreview} className="h-24 w-full object-cover rounded-xl" /> : <p className="text-slate-400 text-[10px] font-bold uppercase py-2">Upload Cover Image</p>}
                            </div>
                            <textarea placeholder="Write your content..." className="w-full p-4 rounded-2xl border-none h-32 shadow-sm focus:ring-2 focus:ring-indigo-500" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
                            <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">{loading ? "PROCESSING..." : editingId ? "UPDATE POST" : "PUBLISH POST"}</button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: SEARCH + LIST */}
                <div className="lg:col-span-2 h-full flex flex-col overflow-hidden">
                    {/* 3. Search Bar UI */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by title or content..."
                            className="w-full p-4 pl-12 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-0 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <HiSearch className="absolute left-4 top-4 text-slate-400" size={24} />
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 pr-2">
                        <div className="space-y-6">
                            {filteredBlogs.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest">
                                    {searchTerm ? "No results found" : "No blog posts yet"}
                                </div>
                            ) : (
                                filteredBlogs.map(b => (
                                    <div key={b.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all group overflow-hidden">
                                        <div className="relative w-full sm:w-40 h-40 shrink-0">
                                            <img src={b.image_url} className="w-full h-full rounded-[2rem] object-cover shadow-md" alt="" />
                                            {b.video_url && (
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                                    <HiVideoCamera className="text-indigo-600" size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 py-2 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{b.title}</h3>
                                                <span className="shrink-0 text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full uppercase tracking-tighter">{b.date}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{b.content}</p>
                                            <div className="flex gap-4 mt-auto pt-4 border-t border-slate-50">
                                                <button onClick={() => openForm(b)} className="text-indigo-600 font-black text-xs uppercase hover:underline">Edit</button>
                                                <button onClick={async () => { if (confirm("Delete this post?")) { await supabase.from("blogs").delete().eq("id", b.id); fetchBlogs(); } }} className="text-rose-500 font-black text-xs uppercase hover:underline">Delete</button>
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