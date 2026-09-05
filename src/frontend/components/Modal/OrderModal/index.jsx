import PropTypes from "prop-types";
import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import './OrderModal.scss';

const DEFAULT_ORDER = {
  paymentData: {},
  contactName: '',
  activityName: '',
  activityLocation: '',
  last_bookable_date: '',
  timeSlot: '',
  adultCount: 0,
  childCount: 0,
  adultPrice: 200,
  childPrice: 150,
  paymentStatus: "PENDING",
  reservedStatus: "reserved",
  totalAmount: 0,
};

const OrderModal = ({ showModal, handleClose, handleSave, currentOrder, setCurrentOrder }) => {
  const [formData, setFormData] = useState(DEFAULT_ORDER);
  const isEdit = !!currentOrder?.id;

  useEffect(() => {
    if (currentOrder?.id) {
      setFormData({
        id: currentOrder.id,
        paymentData: currentOrder.paymentData || {},
        contactName: currentOrder.paymentData?.contactName || '',
        activityName: currentOrder.activityName || '',
        activityLocation: currentOrder.activityLocation || '',
        last_bookable_date: currentOrder.last_bookable_date || '',
        timeSlot: currentOrder.timeSlot || '',
        paymentStatus: currentOrder.paymentStatus || 'PENDING',
        reservedStatus: currentOrder.reservedStatus || 'reserved',
        adultCount: currentOrder.adultCount || 0,
        childCount: currentOrder.childCount || 0,
        adultPrice: currentOrder.adultPrice || 200,
        childPrice: currentOrder.childPrice || 150,
        totalAmount: currentOrder.totalAmount || 0,
      });
    } else {
      setFormData(DEFAULT_ORDER);
    }
  }, [currentOrder]);

  const calculateTotal = (data = formData) => {
    return Number(data.adultCount) * Number(data.adultPrice) +
      Number(data.childCount) * Number(data.childPrice);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (['adultCount', 'childCount', 'adultPrice', 'childPrice'].includes(name)) {
        updated.totalAmount = calculateTotal(updated);
      }
      return updated;
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    handleSave({
      ...formData,
      totalAmount: calculateTotal(),
      paymentData: { ...formData.paymentData, contactName: formData.contactName },
    });
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Form className="order-modal-form" onSubmit={handleClick}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "查看 / 編輯訂單" : "新增訂單"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>聯絡人姓名</Form.Label>
            <Form.Control name="contactName" value={formData.contactName} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>活動名稱</Form.Label>
            <Form.Control name="activityName" value={formData.activityName} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>活動地點</Form.Label>
            <Form.Control name="activityLocation" value={formData.activityLocation} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>活動日期</Form.Label>
            <Form.Control type="date" name="last_bookable_date" value={formData.last_bookable_date} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>活動時段</Form.Label>
            <Form.Select name="timeSlot" value={formData.timeSlot} onChange={handleChange}>
              <option value="">請選擇時段</option>
              <option value="09:00-12:00">09:00-12:00</option>
              <option value="14:00-17:00">14:00-17:00</option>
              <option value="09:00-17:00">09:00-17:00</option>
              <option value="18:00-21:00">18:00-21:00</option>
            </Form.Select>
          </Form.Group>

          <div className="row mb-2">
            <div className="col">
              <Form.Group>
                <Form.Label>成人人數</Form.Label>
                <Form.Control type="number" min="0" name="adultCount" value={formData.adultCount} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label>兒童人數</Form.Label>
                <Form.Control type="number" min="0" name="childCount" value={formData.childCount} onChange={handleChange} />
              </Form.Group>
            </div>
          </div>

          <div className="row mb-2">
            <div className="col">
              <Form.Group>
                <Form.Label>成人票價</Form.Label>
                <Form.Control type="number" min="0" name="adultPrice" value={formData.adultPrice} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group>
                <Form.Label>兒童票價</Form.Label>
                <Form.Control type="number" min="0" name="childPrice" value={formData.childPrice} onChange={handleChange} />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-2">
            <Form.Label>預約狀態</Form.Label>
            <Form.Select name="reservedStatus" value={formData.reservedStatus} onChange={handleChange}>
              <option value="reserved">預約中</option>
              <option value="in_progress">進行中</option>
              <option value="finished">已完成</option>
              <option value="cancel">已取消</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>訂單狀態</Form.Label>
            <Form.Select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
              <option value="PENDING">尚未付款</option>
              <option value="PAID">已付款</option>
            </Form.Select>
          </Form.Group>

          <p className="fs-5 fw-bold mb-0">總金額：${calculateTotal()}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>取消</Button>
          <Button variant="primary" type="submit">{isEdit ? "更新訂單" : "建立訂單"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

OrderModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  currentOrder: PropTypes.object,
  setCurrentOrder: PropTypes.func.isRequired,
};

export default OrderModal;
