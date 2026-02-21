import { supabase } from "../supabaseClient";

export const uploadImage = async (file) => {
    const name = `${Date.now()}-${file.name}`;

    await supabase.storage
        .from("images")
        .upload(name, file);

    return supabase.storage
        .from("images")
        .getPublicUrl(name).data.publicUrl;
};
