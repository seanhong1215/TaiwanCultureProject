import Swal from 'sweetalert2';
import axios from './client';

// 圖片上傳
export const uploadImageToCloudinary = async (file) => {
    try {
        // 簽名與上傳都在後端完成，前端只負責送檔案（Token 由 interceptor 自動帶上）
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await axios.post(`/upload-to-cloudinary`, formData);

        if (!data.secure_url) {
            Swal.fire({ title: "無法取得圖片 URL", icon: "warning" });
            return;
        }
        return data.secure_url;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        Swal.fire({ title: '上傳圖片失敗: ' + message, icon: "error" });
    }
};
