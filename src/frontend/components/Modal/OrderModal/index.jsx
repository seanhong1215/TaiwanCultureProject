import PropTypes from "prop-types";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";  
import './OrderModal.scss';


const OrderModal = ({ showModal, handleClose, handleSave, currentOrder, setCurrentOrder }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [formData, setFormData] = useState(
    { 
      contactName: '',
      activityName: '',
      activityLocation: '',
      last_bookable_date: '',
      timeSlot: '',
      adultCount: 0,
      childCount: 0,
      adultPrice: 200,
      childPrice: 150,
      paymentStatus: "",
      reservedStatus: "",
      totalAmount: 0 
    });

    useEffect(() => {
      if (currentOrder) {
        setFormData({
          paymentData: currentOrder.paymentData || {},
          activityName: currentOrder.activityName || '',
          activityLocation: currentOrder.activityLocation || '',
          last_bookable_date: currentOrder.last_bookable_date || '',
          timeSlot: currentOrder.timeSlot || '',
          paymentStatus: currentOrder.paymentStatus || '',
          reservedStatus: currentOrder.reservedStatus || '',
          adultCount: currentOrder.adultCount || 0,
          childCount: currentOrder.childCount || 0,
          adultPrice: currentOrder.adultPrice || 200,
          childPrice: currentOrder.childPrice || 150,
          totalAmount: currentOrder.totalAmount || 0
        });
      }
    }, [currentOrder]); // 監聽 `currentOrder` 的變化


  const calculateTotal = () => {
    return Number(formData.adultCount) * Number(formData.adultPrice) +
    Number(formData.childCount) * Number(formData.childPrice);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name.includes('.')) {
      // 處理巢狀結構
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (name === 'timeSlot') {
      setSelectedTimeSlot(e.target.value);
    } else {
      // 一般輸入 & 計算總金額
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [name]: value,
        };
  
        if (['adultCount', 'childCount', 'adultPrice', 'childPrice'].includes(name)) {
          updatedData.totalAmount = calculateTotal(
            updatedData.adultCount,
            updatedData.childCount,
            updatedData.adultPrice,
            updatedData.childPrice
          );
        }
  
        return updatedData;
      });
    }
  };

  const handleClick = () => {
    handleSave(formData);
  }

  return (
    <Modal show={showModal} onHide={handleClose}>
          <Form className="order-modal-form" onSubmit={handleSubmit(handleClick)}>
          <Modal.Header closeButton>
        <Modal.Title>{currentOrder ? "查看訂單" : "新增訂單"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>聯絡人姓名</Form.Label>
            <Form.Control name="contactName" value={formData.paymentData?.contactName} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>活動名稱</Form.Label>
            <Form.Control name="activityName" value={formData.activityName} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>活動地點</Form.Label>
            <Form.Control name="activityLocation" value={formData.activityLocation} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>活動日期</Form.Label>
            <Form.Control type="date" name="last_bookable_date" value={formData.last_bookable_date} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
          <Form.Label>活動時段</Form.Label>
          <Form.Select name="timeSlot" value={formData.timeSlot} onChange={handleChange}>
            <option disabled value="">
              請選擇時段
            </option>
            <option value="09:00-12:00">09:00-12:00</option>
            <option value="14:00-17:00">14:00-17:00</option>
            <option value="09:00-17:00">09:00-17:00</option>
            <option value="18:00-21:00">18:00-21:00</option>
          </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>成人人數</Form.Label>
            <Form.Control type="number" name="adultCount" value={formData.adultCount} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>兒童人數</Form.Label>
            <Form.Control type="number" name="childCount" value={formData.childCount} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>預約狀態</Form.Label>
            <Form.Control type="text" name="status" value={formData.reservedStatus === "reserved" ? "預約中" : formData.reservedStatus === "in_progress" ? "進行中" : formData.reservedStatus === "cancel" ? "已取消" : "未知的狀態"} onChange={handleChange} />
          </Form.Group>


          <Form.Group>
            <Form.Label>訂單狀態</Form.Label>
            <Form.Control type="text" name="paymentStatus" value={formData.paymentStatus === "PAID" ? "已付款" : formData.paymentStatus === "PENDING" ? "尚未付款" : "未知的狀態"} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <p className="fs-4 fw-bold">總金額: ${calculateTotal()}</p>
          </Form.Group>
          
        </Modal.Body>

        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>取消</Button>
            { !currentOrder && (
            <Button variant="primary" type="submit">建立訂單</Button>
          ) }
        </Modal.Footer>
          </Form>
    </Modal>
  );
};

OrderModal.propTypes = {
  showModal: PropTypes.bool.isRequired, // 是否顯示 Modal
  handleClose: PropTypes.func.isRequired, // 關閉 Modal 的函數
  handleSave: PropTypes.func.isRequired, // 儲存資料的函數
  currentOrder: PropTypes.shape({
      id: PropTypes.string,
      paymentData: PropTypes.object,
      activityName: PropTypes.string,
      activityLocation: PropTypes.string,
      timeSlot: PropTypes.string,
      last_bookable_date: PropTypes.string,
      paymentStatus: PropTypes.string,
      reservedStatus: PropTypes.string,
      adultCount: PropTypes.number,
      childCount: PropTypes.number,
      adultPrice: PropTypes.number,
      childPrice: PropTypes.number,
      totalAmount: PropTypes.number,
    }),
    setCurrentOrder: PropTypes.func.isRequired,
};

export default OrderModal;



