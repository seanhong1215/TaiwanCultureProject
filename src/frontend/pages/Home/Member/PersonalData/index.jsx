import { useState, useEffect } from 'react';
import { userProfiles, updateUsers, getUserDetail} from '@/frontend/utils/api';
import './PersonalData.scss';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/DatePicker/DatePicker.scss"; 
import Swal from 'sweetalert2';

const PersonalData = () => {
const userId = Number(localStorage.getItem("userId")); // 取得 userId
const countries = ["台灣", "日本", "韓國", "歐美"]; // 國家
const genders = ["男生", "女生", "秘密"]; // 性別
const countryCodes = ["+886", "+1", "+81", "+82"]; //國碼
const [formData, setFormData] = useState({
    id: null,
    userName: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    nickName: "",
    gender: "",
    birthday: null,
    country: "",
    countryCode: "+886",
    phoneNumber: "",
    userId
});

const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);

// dropdown
const [isCountryDropdownOpen, setisCountryDropdownOpen] = useState(false); // 控制國家下拉選單
const [isGenderDropdownOpen, setisGenderDropdownOpen] = useState(false); // 控制性別下拉選單
const [isCountryCodeDropdownOpen, setisCountryCodeDropdownOpen] = useState(false); // 控制國碼下拉選單

// 切換國家選單
const toggleDropdownCountry = () => {
    setisCountryDropdownOpen((prev) => !prev);
    setisGenderDropdownOpen(false);
    setisCountryCodeDropdownOpen(false);
};
// 選擇國家
const selectOptionCountry = (country) => {
    setFormData((prevData) => ({
        ...prevData,
        country: country, 
    }));
    setisCountryDropdownOpen(false); 
};

// 切換國家選單
const toggleDropdownGender = () => {
    setisGenderDropdownOpen((prev) => !prev);
    setisCountryDropdownOpen(false);
    setisCountryCodeDropdownOpen(false);

};
// 選擇國家
const selectOptionGender = (gender) => {
    setFormData((prevData) => ({
        ...prevData,
        gender: gender, 
    }));
    setisGenderDropdownOpen(false); 
};

// 切換國碼選單
const toggleDropdownCountryCode = () => {
    setisCountryCodeDropdownOpen((prev) => !prev);
    setisGenderDropdownOpen(false);
    setisCountryDropdownOpen(false);
};
// 選擇國碼
const selectOptionCountryCode = (countryCode) => {
    setFormData((prevData) => ({
        ...prevData,
        countryCode: countryCode, 
    }));
    setisCountryCodeDropdownOpen(false); 
};

// 綁定生日
const handleDateChange = (date) => {
    setFormData((prevData) => ({
        ...prevData,
        birthday: date ? date.toISOString().split("T")[0] : ""
    }));
};

// 處理表單輸入變更
const handleChange = (e) => {
    setFormData({ 
        ...formData, 
        [e.target.id]: e.target.value 
    });
};

// 處理電話欄位變更
const handlePhoneChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value, // name 更新對應欄位
    });
};

// 提交表單
const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.id) {
        try {
            await updateUsers(formData.id, formData);
            localStorage.setItem("nickName", formData.nickName);
            localStorage.setItem("userName", formData.userName);
            // ✅ 觸發 custom event，通知 Header 更新
            window.dispatchEvent(new Event("storageChange"));
            Swal.fire({
                title: "設定更新成功",
                icon: "success"
            })
        } catch (error) {
            setError("更新失敗", error);
        }
    } else {
        try {
            await userProfiles(formData); 
            Swal.fire({
                title: "設定新增成功",
                icon: "success"
            })
        } catch (error) {
            setError("新增失敗", error);
        }
    }
};

const getUsersData = async () => {
    try {
        const response = await getUserDetail(userId);
        if (response && response.id) {
            setFormData(prevData => ({
                ...prevData,
                ...response
            }));
        }
    } catch (err) {
        setError("載入個人資料失敗");
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    getUsersData();
}, []);

if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
}

if (error) {
    return <div className="alert alert-danger">{error}</div>;
}

return (
        <div className="personal page-container">
            <div className="container">
                <h2 className="info">個人資料</h2>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-lg-4 form-group-field">
                        <label htmlFor="userName" className="form-label">使用者姓名</label>
                        <input
                            type="text"
                            id="userName"
                            className="form-control"
                            placeholder="User name"
                            value={formData.userName}
                            onChange={handleChange}
                        />
                        </div>
                        <div className="col-lg-4 form-group-field">
                        <label htmlFor="nickName" className="form-label">暱稱</label>
                        <input
                            type="text"
                            id="nickName"
                            className="form-control"
                            placeholder="Nick name"
                            value={formData.nickName}
                            onChange={handleChange}
                        />
                        </div>
                        <div className="col-lg-4 form-group-field">
                        <label htmlFor="email" className="form-label">電子郵件</label>
                        <input
                            type="text"
                            id="email"
                            className="form-control"
                            placeholder="Email"
                            value={formData.email}
                            disabled
                            style={{cursor:'not-allowed', opacity: '0.9'}}
                        />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 item-block form-group-field">
                        <label htmlFor="gender" className="form-label">性別</label>
                        <div className="form-control-dropdown">
                            {/* 選擇框 */}
                            <div 
                                id="gender" 
                                className={`dropdown-selected form-control ${formData.gender ? "selected" : ""}`}  
                                onClick={toggleDropdownGender}
                            >
                                {formData.gender || "請選擇"}
                            </div>
                            {/* 下拉選單 */}
                            {isGenderDropdownOpen  && (
                                <ul className="dropdown-list">
                                {genders.map((gender, index) => (
                                    <li key={index} onClick={() => selectOptionGender(gender)}>
                                        {gender}
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>
                        </div>
                        <div className="col-lg-4 item-block form-group-field">
                            <label htmlFor="birthday" className="form-label">生日</label>
                            <DatePicker
                                selected={formData.birthday}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="請選擇"
                                className="date-input"
                                calendarClassName="custom-calendar"
                            />
                        </div>
                        <div className="col-lg-4 item-block form-group-field">
                            <label htmlFor="country" className="form-label">國家</label>
                            <div className="form-control-dropdown">
                                {/* 選擇框 */}
                                <div 
                                    id="country" 
                                    className={`dropdown-selected form-control ${formData.country ? "selected" : ""}`}  
                                    onClick={toggleDropdownCountry}
                                >
                                    {formData.country || "請選擇"}
                                </div>
                                {/* 下拉選單 */}
                                {isCountryDropdownOpen  && (
                                    <ul className="dropdown-list">
                                    {countries.map((country, index) => (
                                        <li key={index} onClick={() => selectOptionCountry(country)}>
                                            {country}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {/* 國碼 + 電話號碼合併 */}
                        <div className="col-lg-12 item-block form-group-field">
                        <label className="form-label">電話號碼</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <div className="form-control-dropdown" style={{ width: '76px' }}>
                                {/* 選擇框 */}
                                <div 
                                    id="CountryCode" 
                                    className={`dropdown-selected form-control ${formData.countryCode ? "selected" : ""}`}  
                                    onClick={toggleDropdownCountryCode}
                                >
                                    {formData.countryCode || "請選擇"}
                                </div>
                                {/* 下拉選單 */}
                                {isCountryCodeDropdownOpen  && (
                                    <ul className="dropdown-list">
                                    {countryCodes.map((countryCode, index) => (
                                        <li key={index} onClick={() => selectOptionCountryCode(countryCode)}>
                                            {countryCode}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                            </div>
                            <input
                            type="tel"
                            name="phoneNumber"
                            className="form-control"
                            style={{ flex: "1" }}
                            placeholder="請輸入電話號碼"
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            />
                        </div>
                        </div>
                    </div>
                    <button type="submit" className="btn custom-btn">儲存</button>
                </form>
            </div>
        </div>
    );
};

export default PersonalData;
