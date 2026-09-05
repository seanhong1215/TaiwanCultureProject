import PropTypes from "prop-types";
import { Button, Table, Modal, Form, Alert} from "react-bootstrap";
import { useForm, Controller  } from "react-hook-form";
import { useState, useEffect} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { uploadImageToCloudinary } from '@/frontend/utils/api.js';


const ActivityModal = ({ showModal, handleClose, handleSave, currentEvent, setCurrentEvent }) => {
  const { control, watch, register, handleSubmit, formState: { errors }, setValue, setError, clearErrors, reset } = useForm();

  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);


  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');

  const cities = ["宜蘭", "台北", "新竹", "苗栗", "台中", "雲林", "高雄", "墾丁", "屏東", "台東", "花蓮"]; 
  const eventTypes = ["一日行程", "特色體驗", "戶外探索"]; 

  // 監聽 `eventType、citie` 的值
  const selectedEventType = watch("eventType", ""); // 預設值為空
  const selectedCity = watch("city", ""); // 預設值為空

  useEffect(() => {
    if (currentEvent && currentEvent.content) {
      setValue("content", {
        title: currentEvent.content?.title || "",
        description: currentEvent.content?.description || ""
      });
      setValue("city", currentEvent.city || "");
      setValue("startDate", currentEvent.startDate || null);
      setValue("endDate", currentEvent.endDate || null);
      setValue("images", currentEvent.images || "");
      setValue("eventType", currentEvent.eventType || "");
      setValue("eventAddress", currentEvent.eventAddress || "");
      setValue("rating", Number(currentEvent.rating) || 0);
      setValue("price", Number(currentEvent.price) || 0);

      if (currentEvent && typeof currentEvent.images) {
        const imageString = typeof currentEvent.images === "string"
        ? currentEvent.images
        : JSON.stringify(currentEvent.images); // 確保為字串

        setPreviewImages([imageString]); 
        setValue("images", imageString);
      }
    } else {
      reset();
      setPreviewImages([]);
    }
  }, [currentEvent, setValue, reset]);

  // 處理主圖片上傳
  const handleMainImageChange = async(e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file); // 記錄檔案

      // 清除錯誤提示
      clearErrors("images");

      // 預覽圖片
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImages([event.target.result]);
      };
      reader.readAsDataURL(file);

      // 更新表單數據，確保 react-hook-form 能夠驗證
      setValue("images", file);
    } else {
      // 如果使用者未選擇圖片，則顯示錯誤訊息
      setError("images", { type: "manual", message: "圖片是必填的" });
    }
  };

  const handleUploadImage = async(file) => {
    try {
      // 上傳圖片
      const imageUrl = await uploadImageToCloudinary(file);
      setCurrentEvent((prev) => ({
        ...prev,
        images: imageUrl || prev.images,
      }));
      setValue("images", imageUrl, { shouldValidate: true });
      return imageUrl;
    } catch (error) {
      console.error("上傳圖片失敗", error);
    }
  }


  const onSubmit = async(data) => {
    try {

        let updatedEvent = {
          ...data, // 保留原來的值
          startDate: data.startDate !== currentEvent?.startDate ? format(new Date(data.startDate), 'yyyy-MM-dd') : currentEvent?.startDate,
          endDate: data.endDate !== currentEvent?.endDate ? format(new Date(data.endDate), 'yyyy-MM-dd') : currentEvent?.endDate,
          rating: data.rating !== currentEvent?.rating ? Number(data.rating) : currentEvent?.rating,
          id: currentEvent?.id, // 保留 ID
          activityDetails: currentEvent?.activityDetails || [] // 保留原活動詳情
        };

        // 只有當 mainImageFile 存在且圖片變動時才上傳新圖片，否則保留原資料
        if (mainImageFile) {
          if (!currentEvent?.images || currentEvent.images !== mainImageFile) {
            const imageUrl = await handleUploadImage(mainImageFile);
            updatedEvent.images = imageUrl;
          } else {
            updatedEvent.images = currentEvent.images; // 沒變動則保留
          }
        } else {
          updatedEvent.images = currentEvent?.images ?? null; // 保留 API 的原始圖片
        }

        await handleSave(updatedEvent);

  } catch (error) {
    console.error("Form submission error:", error);
  }
  };

  return (
    <Modal size="lg" show={showModal} onHide={handleClose}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEvent ? "編輯活動" : "新增活動"}</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>名稱</Form.Label>
            <Form.Control
              type="text"
              placeholder="活動名稱"
              {...register("content[title]", { required: "活動名稱是必填的" })}
            />
            {errors?.content?.title && (
              <p className="text-danger">{errors.content.title.message}</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>描述</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="活動內容"
              rows={3}
              {...register("content[description]", {
                required: "描述是必填的",
              })}
            />
            {errors?.content?.description && (
              <p className="text-danger">
                {errors.content.description.message}
              </p>
            )}
          </Form.Group>

          {/* Event Type Dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>活動類型</Form.Label>
            <Form.Select
              {...register("eventType", { required: "活動類型是必填的" })}
              value={selectedEventType || ""}
              onChange={(e) => setValue("eventType", e.target.value)}
            >
              <option disabled selected className="placeholder-option">請選擇活動類型</option>
              {eventTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
            {errors.eventType && (
              <p className="text-danger">{errors.eventType.message}</p>
            )}
          </Form.Group>

          {/* City Dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>城市</Form.Label>
            <Form.Select
              {...register("city", { required: "城市是必填的" })}
              value={selectedCity || ""}
              onChange={(e) => setValue("city", e.target.value)}
            >
              <option disabled selected className="placeholder-option">請選擇城市</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </Form.Select>
            {errors.city && <p className="text-danger">{errors.city.message}</p>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>活動地址</Form.Label>
            <Form.Control
              type="text"
              placeholder="活動地址"
              {...register("eventAddress", { required: "活動地址是必填的" })}
            />
            {errors.eventAddress && (
              <p className="text-danger">{errors.eventAddress.message}</p>
            )}
          </Form.Group>

          {/* Start Date Picker */}
          <Form.Group className="mb-3">
            <Form.Label>開始日期</Form.Label>
            <Controller
            name="startDate"
            control={control}
            rules={{ required: "開始日期是必填的" }}
            // {...register("startDate", { required: "開始日期是必填的" })}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="選擇開始日期"
              />
            )}
          />
            {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
          </Form.Group>

          {/* End Date Picker */}
          <Form.Group className="mb-3">
            <Form.Label>結束日期</Form.Label>
            <Controller
            name="endDate"
            control={control}
            rules={{ required: "結束日期是必填的" }}

            // {...register("endDate", { required: "結束日期是必填的" })}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="yyyy/MM/dd"
                className="form-control"
                placeholderText="選擇結束日期"
              />
            )}
          />
            {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
          </Form.Group>

          {/* Price */}
          <Form.Group className="mb-3">
            <Form.Label>價格</Form.Label>
            <Form.Control
              type="number"
              {...register("price", { required: "價錢是必填的" })}
            />
            {errors.price && <p className="text-danger">{errors.price.message}</p>}
          </Form.Group>

           {/* Image Upload */}
          <Form.Group className="mb-3">
            <Form.Label>活動主圖</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              placeholder="活動主圖"
            />
           {previewImages.length > 0 && (
              <div className="mt-3">
                <img
                  src={previewImages[0]}
                  alt="主圖預覽"
                  className="mt-3"
                  style={{ width: "75%", objectFit: "cover" }}
                />
              </div>
            )}
            {errors.images && <p className="text-danger">{errors.images.message}</p>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>評分</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              max="5"
              {...register("rating", { required: "評分是必填的" })}
            />
            {errors.rating && <p className="text-danger">{errors.rating.message}</p>}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>取消</Button>
          <Button variant="primary" type="submit">儲存</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};


ActivityModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  currentEvent: PropTypes.shape({
    id: PropTypes.number,
    city: PropTypes.string,
    images: PropTypes.oneOfType([
      PropTypes.string, 
      PropTypes.oneOf([null]) // 允許 null
    ]),
    isFavorited: PropTypes.bool,
    rating: PropTypes.number,
    price: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    eventType: PropTypes.string,
    eventAddress: PropTypes.string,
    activityDetails: PropTypes.array,
    content: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
    }),
  }),
  setCurrentEvent: PropTypes.func.isRequired,
};

export default ActivityModal;
