import PropTypes from "prop-types";
import { Button, Table, Modal, Form } from "react-bootstrap";
import  { useState, useEffect, useRef } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EditorToolbar, { modules, formats } from '@/frontend/components/EditorToolbar';
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadImageToCloudinary } from '@/frontend/utils/api.js';
import './Blog.scss';



const blogModal = ({ showModal, handleClose, handleSave, currentBlog, setCurrentBlog }) => {
  const { control, register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      date: currentBlog.date ? new Date(currentBlog.date) : null, // 預設值為 currentBlog.date
    },
  });
  
  const quillRef = useRef(null);
  const [editorValue, setEditorValue] = useState('');

  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);


    // 初始化
  useEffect(() => {
    if (currentBlog?.id) {
      try {
        // 檢查內容是否為JSON，如果是則轉換為 HTML
        const parsedContent = JSON.parse(currentBlog.content);
        if (parsedContent.blocks) {
          setEditorValue(parsedContent.blocks.map(block => block.text).join("\n"));
        } else {
          setEditorValue(currentBlog.content); // 已經是 HTML
        }
      } catch (error) {
        setEditorValue(currentBlog.content); // 不是 JSON，直接當作 HTML
      }
    } else {
      setEditorValue("");
    }
  }, [currentBlog?.id]);


  useEffect(() => {
    if (currentBlog && typeof currentBlog.images) {
      const imageString = typeof currentBlog.images === "string"
      ? currentBlog.images
      : JSON.stringify(currentBlog.images); // 確保為字串

      setPreviewImages([imageString]); 
    } else {
      setPreviewImages([imageString]); 
    }
  }, [currentBlog]);


  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBlog((prev) => ({ ...prev, [name]: value }));
  };


  // **處理編輯器內容變更**
  const onEditorValueChange = (value) => {
    setEditorValue(value);
    setCurrentBlog((prev) => ({ ...prev, content: value }));
  };

    // **按下「儲存」按鈕時，確保傳遞最新的內容**
    const handleSaveClick = () => {
      handleSave({ ...currentBlog, content: editorValue });
    };

      // 處理主圖片上傳
  const handleMainImageChange = async(e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);

      // 預覽圖片
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImages([event.target.result]);
      };
      reader.readAsDataURL(file);
      
      // 上傳圖片
      const imageUrl = await uploadImageToCloudinary(file);
      setCurrentBlog((prev) => ({
        ...prev,
        images: imageUrl,
      }));
    }
  };


  return (
    <Modal size="xl" show={showModal} onHide={handleClose}>
      <Form onSubmit={handleSubmit(handleSaveClick)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentBlog.id ? "編輯文章" : "新增文章"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

        <Form.Group className="mb-3">
          <Form.Label>標題</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={currentBlog.title}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>日期</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={currentBlog.date}
            onChange={handleInputChange}
          />
        </Form.Group>

        {/* <Form.Group className="mb-3">
            <Form.Label>日期</Form.Label>
            <Controller
            name="date"
            value={currentBlog.date}
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  field.onChange(date); 
                  setValue('date', date);
                }}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="選擇日期"
              />
            )}
          />
          </Form.Group> */}

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
                  className="mt-3 blog-img"
                />
              </div>
            )}
            {/* {errors.images && (
              <p className="text-danger">{errors.images.message}</p>
            )} */}
          </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>內容</Form.Label>
              <EditorToolbar />
              <ReactQuill theme="snow" ref={quillRef} value={editorValue} modules={modules} formats={formats} onChange={onEditorValueChange} />
            </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>狀態</Form.Label>
          <Form.Select
            value={currentBlog.status}
            onChange={handleInputChange}
          >
            <option value="發佈">發佈</option>
            <option value="草稿">草稿</option>
          </Form.Select>
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


blogModal.propTypes = {
  showModal: PropTypes.bool.isRequired, // 是否顯示 Modal
  handleClose: PropTypes.func.isRequired, // 關閉 Modal 的函數
  handleSave: PropTypes.func.isRequired, // 儲存資料的函數
  currentBlog: PropTypes.object.isRequired,
  setCurrentBlog: PropTypes.func.isRequired,
};

export default blogModal;
