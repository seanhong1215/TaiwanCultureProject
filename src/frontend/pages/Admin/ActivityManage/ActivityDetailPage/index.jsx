import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";  
import { Modal, Button, Form, Card, Alert } from "react-bootstrap";
import { addActivitys, updatedActivitys, getActivitys, uploadImageToCloudinary } from '@/frontend/utils/api';
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import './ActivityDetilPage.scss';
import defaultImage from "@/frontend/assets/images/default-images.png";


const EventDetail = () => {
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
  
    const { id } = useParams();
    const [initData ,setInitData] = useState({});

    const [activityData, setActivityData] = useState({  
      images: Array(5).fill().map(() => ({ url: "" })),
      trip: { title: "", highlights: ["","","",""] },
      map: { latitude: 0, longitude: 0, mapLink: "https://maps.google.com" },
      sections: [{ image: "", imageCaption: "", description: "" }]
    });

    const [previewCoverImages, setPreviewCoverImages] = useState(Array(5).fill(defaultImage));
    const [previewSectionImages, setPreviewSectionImages] = useState([defaultImage]);

    const [mainCoverImageFile, setMainCoverImageFile] = useState(null);
    const [mainSectionImageFile, setMainSectionImageFile] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
        const data = await getActivitys(id);
        setInitData(data);
        // 取第一筆 activityDetails（如果有資料）
        const firstActivity = data.activityDetails?.[0] || {
          images: [],
          trip: { title: "", highlights: [] },
          map: { latitude: 0, longitude: 0, mapLink: "" },
          sections: []
        };

         // 檢查 sections 並根據 image 設置 previewSectionImages
         if (firstActivity.sections.length > 0) {
          // 用 map 來處理多個 sections 的圖片
          const images = firstActivity.sections.map((section) => {
            const imageUrl = section.image;
            return imageUrl && imageUrl !== "" ? imageUrl : defaultImage; // 如果 image 是空的，用預設圖片
          });

          setPreviewSectionImages(images); // 更新圖片陣列
        }
  
      // 更新資料時保持原有資料不被清空
      setActivityData(prevState => ({
        ...prevState, // 保留之前的資料
        images: firstActivity.images.length ? firstActivity.images : prevState.images,
        trip: {
          title: firstActivity.trip.title || prevState.trip.title,
          highlights: firstActivity.trip.highlights.length ? firstActivity.trip.highlights : prevState.trip.highlights
        },
        map: {
          latitude: firstActivity.map.latitude || prevState.map.latitude,
          longitude: firstActivity.map.longitude || prevState.map.longitude,
          mapLink: firstActivity.map.mapLink || prevState.map.mapLink
        },
        sections: firstActivity.sections.length ? firstActivity.sections : prevState.sections
      }));
        } catch (err) {
        console.log("獲取資料錯誤:", err);
        } 
    };
    fetchData();
    }, [id]);


    // 更新封面圖片
    const updateImage = (index, event) => {
      const file = event?.target?.files[0];
      setMainCoverImageFile(file);

      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {

        setPreviewCoverImages((prevPreviews) => {
          const updatedPreviews = [...prevPreviews];
          updatedPreviews[index] = reader.result || ""; // ✅ 確保不是 undefined
          return updatedPreviews;
        });

        setActivityData((prevState) => {
          const updatedImages = [...prevState.images];
          updatedImages[index] = file; // 🚀 暫存 File，不馬上上傳
          return { ...prevState, images: updatedImages };
        });
      };
      reader.readAsDataURL(file);
    };


    // 更新活動圖片
    const updateSectionImage = (index, event) => {
      event.preventDefault(); // 確保不會有額外的觸發
      const file = event?.target?.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {

        setPreviewSectionImages((prev) => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result; // ✅ 預覽圖片
          return newPreviews;
        });

        setActivityData((prev) => {
          const updatedSections = [...prev.sections];
          updatedSections[index] = { ...updatedSections[index], image: file }; // ✅ 存 File
          return { ...prev, sections: updatedSections };
        });
      };

      reader.readAsDataURL(file);
    };

    // 上傳圖片
    const handleUploadImage = async(file) => {
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        if (!imageUrl) {
          console.error("圖片上傳失敗，無法取得圖片網址");
          return null;
        }
        return imageUrl;
      } catch (error) {
        console.error("上傳圖片失敗", error);
        return null;
      }
    }
  
    // 新增活動介紹
    const addSection = () => {
      setActivityData((prev) => ({
        ...prev,
        sections: [
          ...(prev.sections || []), // 確保 sections 是陣列
          { imageCaption: "", description: "" }
        ]
      }));
      setPreviewSectionImages((prev) => [...prev, ""]); // 新增一個空的預覽圖片
    };

    // 新增行程特色
    const addTripHighlight = () => {
      setActivityData((prev) => ({
        ...prev,
        trip: {
          ...prev.trip,
          highlights: [...(prev.trip.highlights || []), ""] // 確保 highlights 是陣列
        }
      }));
    };
    
    // 移除行程特色
    const removeTripHighlight = (index) => {
      setActivityData((prev) => ({
        ...prev,
        trip: { ...prev?.trip, highlights: prev?.trip?.highlights.filter((_, i) => i !== index) }
      }));
    };
    
    // 更新活動介紹
    const updateSection = (index, field, value) => {
      const newSections = [...activityData.sections];
      newSections[index][field] = value;
      setActivityData((prev) => ({ ...prev, sections: newSections }));
    };
  
    // 移除活動介紹
    const removeSection = (index) => {
      setActivityData((prev) => {
        const newSections = prev.sections.filter((_, i) => i !== index);
        return { ...prev, sections: newSections };
      });
      setPreviewSectionImages((prev) => prev.filter((_, i) => i !== index)); // 移除對應的預覽圖片
    };
  
    // 儲存變更
    const handleSave = async() => {

      let submitData = {
        ...activityData, // 包含所有資料
        trip: { title: activityData.trip?.title, highlights: activityData.trip?.highlights },
        map: { latitude: activityData.map?.latitude, longitude: activityData.map?.longitude, mapLink: activityData.map?.mapLink },
        images: [...activityData.images], // 複製 images 陣列
        sections: [...activityData.sections] // 複製 sections
      }

      // 儲存原始圖片的 URL
      const originalImages = submitData.images.map(img => img.url || null);

      // 🔄 **上傳 `images[]` (僅更新變動的)**
      for (let i = 0; i < submitData.images.length; i++) {
        if (submitData.images[i] instanceof File) {
          // 🆕 使用者更換了圖片，需上傳
          const uploadedImageUrl = await handleUploadImage(submitData.images[i]);
          if (uploadedImageUrl) {
            submitData.images[i].url = uploadedImageUrl; // ✅ 替換 `File` → `URL`
          }
        } else if (submitData.images[i].url !== originalImages[i]) {
          // 原始圖片 URL 變動
          console.log(`圖片 ${i} 已變更，需更新：`, submitData.images[i].url);
        }
      }

      // 儲存原始圖片的 URL
      const originalSectionImages = submitData.sections.map(section => section.image || null);

      // 🔄 **上傳 `sections[].image`**
      for (let i = 0; i < submitData.sections.length; i++) {
        if (submitData.sections[i].image instanceof File) {
          const uploadedImageUrl = await handleUploadImage(submitData.sections[i].image);
          if (uploadedImageUrl) {
            submitData.sections[i].image = uploadedImageUrl; // ✅ 替換 `File` → `URL`
          }
        } else if (submitData.sections[i].image !== originalSectionImages[i]) {
          // 原始圖片 URL 變動
          console.log(`圖片 ${i} 已變更，需更新：`, submitData.sections[i].image);
        }
      }
    
      // **更新 activityData 狀態**
      setActivityData(submitData);

      if(initData.activityDetails){
        await updatedActivitys(id, {
          activityDetails: [submitData]
        });
        Swal.fire({ title: "編輯成功", icon: "success" });
        
      } else {
          await addActivitys({
            activityDetails: [submitData]
          });
          Swal.fire({ title: "新增成功", icon: "success" });
      }
    };

    // 返回
    const handleClose = () => {
      navigate("/admin/activity-list");
      window.scrollTo({ top: 0, behavior: "smooth" }); // 滑動到最上方
    };

    // 更新表單內容
    const handleChange = (e) => {
      const { name, value } = e.target;
      setActivityData((prev) => ({
        ...prev,
        trip: {
          ...prev.trip, // 保持 trip 的原有結構
          [name]: value, // 更新 trip 內對應的屬性
        },
      }));
    };

    // 更新地圖連結
    const handleMapChange = (e) => {
      const { name, value } = e.target; // 取得 input 的 name 和 value
      setActivityData((prev) => ({
        ...prev,
        map: {
          ...(prev.map || { latitude: 0, longitude: 0, mapLink: "https://maps.google.com" }), // 確保 map 存在
          [name]: value, // 動態更新 latitude 或 longitude
        },
      }));
    };
    
    // 更新 行程特色
    const handleTripChange = (e, index) => {
      const { value } = e.target;
      setActivityData((prev) => {
        const newHighlights = [...(prev.trip?.highlights || [])]; // 避免 prev.trip 為 undefined
        newHighlights[index] = value; // 只更新對應索引的值
        return {
          ...prev,
          trip: { 
            ...prev.trip, 
            highlights: newHighlights 
          },
        };
      });
    };


    

  {error && <Alert variant="danger">{error}</Alert>}

  return (
    <Modal show={true} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>編輯詳細資料</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="trip-form" onSubmit={handleSave}>
          <Form.Group className="mb-4 trip-title">
            <Form.Label>行程標題</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={activityData.trip?.title}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-4 trip-highlights">
            <div className="d-flex align-items-center mb-3">
              <Form.Label>行程特色</Form.Label>
              <Button size="sm" onClick={addTripHighlight}>新增</Button>
            </div>
            <ul>
              {activityData.trip?.highlights.map((highlight, index) => (
                <li key={index} className="d-flex">
                  <Form.Control
                    name={`highlight-${index}`}
                    value={highlight}
                    onChange={(e) => handleTripChange(e, index)}
                  />
                  <Button variant="danger" size="sm" onClick={() => removeTripHighlight(index)}>刪除</Button>
                </li>
              ))}
            </ul>
          </Form.Group>
          <Form.Group className="mb-4 trip-images">
            <div className="d-flex align-items-center">
              <Form.Label>封面圖片</Form.Label>
            </div>
            <div className="d-flex flex-wrap">
              {activityData.images?.map((img, index) => (
                <div key={index} className="position-relative mb-2 mt-4 me-3">
                  <div className="img-thumbnail" style={{ width: "200px", height: "200px", cursor: "pointer" }} onClick={(e) => e.currentTarget.querySelector("input").click()}>
                  {img.url ? (
                      // 如果 img 存在，顯示 img.url
                      <img src={img.url} alt={`圖片 ${index + 1}`} className="img-thumbnail" />
                    ) : (
                      // 如果 img 不存在，顯示 previewCoverImages[index]
                      <img src={previewCoverImages[index]} alt={`圖片 ${index + 1}`} className="img-thumbnail" />
                    )}
                    
                    <input id={`file-input-${index}`} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => updateImage(index, e)} />
                  </div>
                </div>
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-4 trip-map">
            <Form.Label>地圖座標</Form.Label>
            <div className="d-flex gap-3">
              <Form.Control type="text" name="latitude" value={activityData.map?.latitude || ""} onChange={handleMapChange} placeholder="輸入緯度，如 24.1947" />
              <Form.Control type="text" name="longitude" value={activityData.map?.longitude || ""} onChange={handleMapChange} placeholder="輸入經度，如 120.6354" />
            </div>
          </Form.Group>
          <Form.Group className="mb-4 trip-section">
            <div className="d-flex align-items-center mb-2">
              <Form.Label>活動介紹</Form.Label>
              <Button size="sm" onClick={addSection}>新增</Button>
            </div>
            {activityData.sections?.map((section, index) => (
              <Card key={index} className="shadow-sm p-3 mb-3 bg-body rounded">
                <Form.Control className="mb-2" type="file" accept="image/*" onChange={(e) => updateSectionImage(index, e)} />
                {previewSectionImages.length > 0 ? (
                  <img
                  src={previewSectionImages[index]}
                  alt={`預覽圖片 ${index + 1}`}
                  className="img-thumbnail mb-2"
                  style={{ width: "30%" }}
                />
                ) : section.image ? (
                  <img
                    src={section.image}
                    alt="預覽圖片"
                    className="img-thumbnail mb-2"
                    style={{ width: "30%" }}
                  />
                  ) : (
                    // ✅ **如果沒有圖片，顯示預設值**
                    <div className="text-muted">尚無圖片</div>
                  )
                }
                <Form.Control type="text" className="mb-2" placeholder="圖片描述" value={section.imageCaption} onChange={(e) => updateSection(index, "imageCaption", e.target.value)} />
                <Form.Control as="textarea" rows={3} placeholder="活動內容" value={section.description} onChange={(e) => updateSection(index, "description", e.target.value)} />
                {activityData.sections.length > 1 && (
                  <Button variant="danger" size="sm" className="mt-3" onClick={() => removeSection(index)}>刪除區塊</Button>
                )}
              </Card>
            ))}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>取消</Button>
        <Button variant="primary" onClick={handleSave}>儲存變更</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventDetail;


