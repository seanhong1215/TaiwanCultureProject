import { useState } from 'react';
import { orderService, TIME_SLOTS } from './orderService';


export const OrderForm = () => {
  const [formData, setFormData] = useState({
    contactName: '',
    activityName: '',
    activityLocation: '',
    activityPeriod: {
      startDate: '',
      endDate: ''
    },
    timeSlot: 'FULL_DAY',
    adultCount: 0,
    childCount: 0,
    adultPrice: 200,
    childPrice: 150,
    totalAmount: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await orderService.createOrder(formData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateTotal = () => {
    return formData.adultCount * formData.adultPrice +
           formData.childCount * formData.childPrice;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalAmount: calculateTotal()
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container p-4">
      <h2 className="mb-4">建立新訂單</h2>
      
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">聯絡人姓名</label>
          <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">活動名稱</label>
          <input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-12">
          <label className="form-label">活動地點</label>
          <input type="text" name="activityLocation" value={formData.activityLocation} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">開始日期</label>
          <input type="date" name="activityPeriod.startDate" value={formData.activityPeriod.startDate} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">結束日期</label>
          <input type="date" name="activityPeriod.endDate" value={formData.activityPeriod.endDate} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">時段選擇</label>
          <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="form-select" required>
            {Object.entries(TIME_SLOTS).map(([key, slot]) => (
              <option key={key} value={key}>{slot.label} ({slot.time})</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">成人人數</label>
          <input type="number" name="adultCount" value={formData.adultCount} onChange={handleChange} min="0" className="form-control" required />
        </div>

        <div className="col-md-3">
          <label className="form-label">兒童人數</label>
          <input type="number" name="childCount" value={formData.childCount} onChange={handleChange} min="0" className="form-control" required />
        </div>

        <div className="col-12">
          <p className="fs-4 fw-bold">總金額: ${calculateTotal()}</p>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary w-100">建立訂單</button>
        </div>
      </div>
    </form>
  );
};
