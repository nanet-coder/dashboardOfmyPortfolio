import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadImage";

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState({ title: "", date: "", video_url: "", content: "" });

    // File States
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    // UI States
    const [videoMode, setVideoMode] = useState("url"); // 'url' or 'upload'
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBlogs = async () => {
        const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
        setBlogs(data || []);
    };

    useEffect(() => { fetchBlogs(); }, []);

    // Helper: Upload Video to Storage
    const uploadVideoToStorage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-videos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('uploads') // Bucket name
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let image_url = imagePreview;
            let video_url = form.video_url;

            // 1. Handle Image Upload
            if (imageFile) image_url = await uploadImage(imageFile);

            // 2. Handle Video Upload (if in upload mode)
            if (videoMode === "upload" && videoFile) {
                video_url = await uploadVideoToStorage(videoFile);
            }

            const payload = { ...form, image_url, video_url };

            if (editingId) await supabase.from("blogs").update(payload).eq("id", editingId);
            else await supabase.from("blogs").insert(payload);

            // Reset
            setEditingId(null);
            setForm({ title: "", date: "", video_url: "", content: "" });
            setImageFile(null);
            setImagePreview(null);
            setVideoFile(null);
            fetchBlogs();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-10 h-[calc(100vh-180px)] overflow-hidden">

            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-1 pb-4">
                <form className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner h-full overflow-y-auto scrollbar-hide" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-black text-slate-800 mb-2">
                        {editingId ? "✨ Edit Post" : "✍️ New Blog"}
                    </h2>

                    <input type="text" placeholder="Title" className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    <input type="date" className="w-full p-4 rounded-2xl border-none shadow-sm text-slate-500" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />

                    {/* --- VIDEO SELECTOR TOGGLE --- */}
                    <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
                        <button
                            type="button"
                            onClick={() => setVideoMode("url")}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoMode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        >
                            Video URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setVideoMode("upload")}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoMode === 'upload' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}`}
                        >
                            Upload Video
                        </button>
                    </div>

                    {/* Conditional Video Input */}
                    {videoMode === "url" ? (
                        <div className="relative">
                            <input type="url" placeholder="Paste YouTube/Video URL" className="w-full p-4 pl-12 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />
                            <span className="absolute left-4 top-4 opacity-50">🔗</span>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-rose-200 rounded-2xl p-4 text-center relative bg-white hover:border-rose-400 transition-colors">
                            <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setVideoFile(e.target.files[0])} />
                            <div className="py-2">
                                {videoFile ? (
                                    <p className="text-rose-500 text-[10px] font-bold">🎬 {videoFile.name}</p>
                                ) : (
                                    <p className="text-slate-400 text-[10px] font-bold uppercase">Click to Upload MP4</p>
                                )}
                            </div>
                        </div>
                    )}
                    {/* --- END VIDEO SELECTOR --- */}

                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center relative group hover:border-indigo-400 transition-colors bg-white">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                        {imagePreview ? (
                            <img src={imagePreview} className="h-24 w-full object-cover rounded-xl" />
                        ) : (
                            <p className="text-slate-400 text-[10px] font-bold uppercase py-2">Upload Cover Image</p>
                        )}
                    </div>

                    <textarea placeholder="Content..." className="w-full p-4 rounded-2xl border-none h-32 shadow-sm" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />

                    <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
                        {loading ? "PROCESSING..." : editingId ? "Update" : "Publish"}
                    </button>
                </form>
            </div>

            {/* RIGHT COLUMN: LIST */}
            <div className="lg:col-span-2 h-full overflow-y-auto scrollbar-hide pb-10 pr-2">
                {/* ... (Your existing mapping logic for the blog list) ... */}
                <div className="space-y-6">
                    {blogs.map(b => (
                        <div key={b.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all group relative overflow-hidden">
                            <img src={b.image_url} className="w-full sm:w-40 h-40 rounded-[2rem] object-cover shadow-md" alt="" />
                            <div className="flex-1 py-2 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{b.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-300">{b.date}</span>
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-2 mt-2">{b.content}</p>
                                <div className="flex gap-4 mt-auto pt-4 border-t border-slate-50">
                                    <button onClick={() => { setEditingId(b.id); setForm(b); setImagePreview(b.image_url); }} className="text-indigo-600 font-black text-xs uppercase">Edit</button>
                                    <button onClick={async () => { if (confirm("Delete?")) { await supabase.from("blogs").delete().eq("id", b.id); fetchBlogs(); } }} className="text-rose-500 font-black text-xs uppercase">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}