import PropTypes from "prop-types";
import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

const MemberModal = ({ showModal, handleClose, handleSave, editingUser = null, loading }) => {
  const { register, setValue, handleSubmit, formState: { errors }, reset } = useForm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    // status: '啟用'
  });

  useEffect(() => {
    if (editingUser) {
      const updatedData = {
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || '',
        // status: editingUser.status || ''
      };
      setFormData(updatedData);
      reset(updatedData);
    } else if (!showModal) {
      // 當 Modal 關閉時，清空表單
      reset({
          name: '',
          email: '',
          role: '',
          // status: '啟用'
      });
  }
  }, [editingUser, reset, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValue(name, value); // 確保 useForm 內部同步變更
  };

  const onSubmit = (data) => {
    handleSave(data); // 使用最新的 useForm 值
  };



  return (
  <Modal show={showModal} onHide={handleClose}>
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Modal.Header closeButton>
        <Modal.Title>{editingUser ? "編輯會員" : "新增會員"}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>會員名稱</Form.Label>
          <Form.Control
            type="text"
            {...register("name", { required: "請輸入會員名稱" })}
            onChange={handleChange}
            placeholder="請輸入會員名稱"
            isInvalid={!!errors.name}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>會員角色</Form.Label>
          <Form.Control
            type="text"
            {...register("role", { required: "請輸入會員角色" })}
            onChange={handleChange}
            placeholder="請輸入會員角色"
            isInvalid={!!errors.role}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
        
        {!editingUser && (
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            onChange={handleChange}
            {...register("email", { 
              required: "請輸入 Email",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "請輸入有效的 Email 格式"
              }
            })}
            placeholder="請輸入 Email"
            isInvalid={!!errors.email}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>
        )}
        {!editingUser && (
        <Form.Group className="mb-3">
          <Form.Label>密碼</Form.Label>
          <Form.Control
            type="text"
            {...register("password", { required: "請輸入密碼" })}
            onChange={handleChange}
            placeholder="請輸入密碼"
            isInvalid={!!errors.password}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
        )}
        {!editingUser && (
        <Form.Group className="mb-3">
          <Form.Label>確認密碼</Form.Label>
          <Form.Control
            type="text"
            {...register("confirmPassword", { required: "請確認密碼" })}
            onChange={handleChange}
            placeholder="請確認密碼"
            isInvalid={!!errors.confirmPassword}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>帳號狀態</Form.Label>
          <Form.Select
            onChange={handleChange}
            {...register("status", { required: "請選擇帳號狀態" })}
            isInvalid={!!errors.status}
            disabled={loading}
          >
            <option value="啟用">啟用</option>
            <option value="停用">停用</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.status?.message}
          </Form.Control.Feedback>
        </Form.Group>
       
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? '處理中...' : '儲存'}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
  );
};


MemberModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  editingUser: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    passwprd: PropTypes.string,
    status: PropTypes.string
  })
};



export default MemberModal;
