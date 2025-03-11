import { useState, useEffect, useRef  } from 'react'
import { NavLink } from 'react-router-dom';
import './Menu.scss';
import { getMembers, updatedMembers, uploadImageToCloudinary } from '@/frontend/utils/api';


const Menu = () => {
      const userId = Number(localStorage.getItem("userId")); // 取得 userId
      const userName = localStorage.getItem("userName"); // 取得 userName
      const [ userData, setUserData ] = useState({});

      const [error, setError] = useState("");
      const fileInputRef = useRef(null); // 引用 input

      // 點擊圖片時觸發 input 
      const handleFileChange  = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click(); 
        }
      };

      //上傳圖片
    const handleUpload = async (event) => {
      const file = event.target.files[0];
        if (!file) return alert("請選擇圖片！");
        
        const reader = new FileReader();
        reader.onloadend = () => setUserData({image: reader.result}); // 預覽圖片
        reader.readAsDataURL(file);

      // 檢查文件類型
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        setError('請上傳 JPG、PNG 或 GIF 格式的圖片');
        return;
      }

      // 檢查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('圖片大小不能超過 5MB');
        return;
      }

      try {
        const imageUrl = await uploadImageToCloudinary(file);

        if (!imageUrl) setError('無法取得圖片 URL');
        
        await updatedMembers(userId, {avatar: imageUrl});


        setUserData((prev) => ({
          ...prev,
          avatar: imageUrl, // 更新的圖片
          name: userName
        }));

        await getUsersAvatar();
        localStorage.setItem("userAvator", imageUrl);
        window.location.reload();
      } catch (error) {
        setError('Upload failed:', error);
      }
      
    };

      const getUsersAvatar = async () => {
        try{
          const getMember = await getMembers(userId);
          setUserData({...getMember});
        } catch(error){
            console.log(error);
        }
      }

      useEffect(() => {
        getUsersAvatar();
      }, []);


  return (
    <div className="custom-menu">
      <div className="user-image-wrap text-center">
            <label className="d-inline-block position-relative" style={{ cursor: "pointer" }}>
              <div className="avatar-img-wrap">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                className="d-none"
              />
                <img
                  src={userData.avatar || "https://mighty.tools/mockmind-api/content/human/119.jpg"}
                  alt="User Avatar"
                  className="rounded-circle img-hover"
                  width="100"
                  height="100"
                  onClick={handleFileChange}
                />
                <span className="material-icons camera-icon">photo_camera</span>
              </div>
            </label>
            <p className="mt-2">{userData.name}</p>
        </div>

      <ul className="menu-item-wrap">
        <li>
          <NavLink to="/member-center/personal-data" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">account_circle</span>個人資料
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/order-management/list" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">receipt_long</span>訂單資訊
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/activity-review" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">star_rate</span>活動評價
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/collection-list" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">favorite</span>收藏清單
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/sign-in" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">task_alt</span>會員簽到
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/activity-points" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">monetization_on</span>活動點數
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/customer-support" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">support_agent</span>客服支援
          </NavLink>
        </li>
        <li>
          <NavLink to="/member-center/center" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <span className="material-icons">diamond</span>會員專區
          </NavLink>
        </li>
      </ul>
      
  </div>
  );
};

export default Menu;
