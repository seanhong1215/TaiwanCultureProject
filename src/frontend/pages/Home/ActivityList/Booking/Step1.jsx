import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step1.scss";
import { useLocation } from "react-router-dom";
import { useForm } from 'react-hook-form';

const renderTooltip = (props) => (
  <Tooltip {...props}>請選擇適合的選項</Tooltip>
);

const Step1 = () => {

  const location = useLocation();
  const submitData = location.state || {}; 
  const navigate = useNavigate();
  const [selectValue , setSelectValue] = useState('')
  const [selectTimeSolt , setSelectTimeSolt] = useState('')
  
  
  
  //react-hook-form
  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      adultCount: selectValue || "",  // 預設為空，讓選項顯示 "請選擇報名人數"
      timeSlot: selectTimeSolt || ""
    },
    mode: "onTouched"
  });
  
  useEffect(() => {
    if (Object.keys(submitData).length > 0) {
      reset({
        ...submitData,
        adultCount: selectValue || "", // 確保 `adultCount` 預設為 ""
        timeSlot: selectTimeSolt || ""
      });
    }
  }, [submitData, reset]);

  const onSubmit = (data) => {
   
    
    const adultCount = Number(data.adultCount); 
    const childCount = Number(data.childCount); 

    const totalPrice = (data.adultCount*data.adultPrice) + (data.childCount*data.childPrice);
    const updatedData = { ...data, adultCount, childCount, totalAmount: totalPrice};
    
    // 當表單提交時，將資料傳遞給 Step2 頁面
    navigate("/activity-list/booking2", { state: updatedData });
  };

  const date = new Date(submitData.last_bookable_date);

  const formattedDate = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;


  
  
  return (
    <Container className="booking-step1 py-5">
    {/* 頁面標題 */}
    <h2 className="text-center mb-5 mb-md-3 fw-bold">預約行程表單</h2>

    {/* 進度指示器 */}
    <div className="progress-steps d-flex justify-content-center mb-5">
      {['行程資料', '確認訂單', '付款資料', '完成預約'].map((step, index) => (
        <Button
          key={index}
          className={`me-2 px-3 fw-semibold ${index === 0 ? "custom-btn" : "outline-custom-btn"}`}
        >
          {index + 1}. {step}
        </Button>
      ))}
    </div>

    <Row className="justify-content-center">
      <Col md={8} lg={10}>
        <Card className="shadow-sm border-0 rounded-3 p-4">
          <Card.Body>
            <h4 className="mb-4 text-center fw-semibold">您的預約行程</h4>
            <Row className="align-items-center">
              <Col md={6} className="text-center">
                <img src={submitData.actImage} alt="" className="img-fluid rounded" />
              </Col>
              <Col md={6} className="form-wrap">
                  <Form.Group className="mb-2 d-flex">
                    <Form.Control disabled value={submitData.activityName} />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control disabled value={formattedDate} />
                  </Form.Group>
                  <div className="mb-2">
                    <Form.Control disabled value="景點/票券" />
                  </div>
                  <div className="mb-2">
                    <Form.Control disabled value="票券當日有效" />
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Control disabled value={`成人 ${submitData.adultPrice} / 張， 兒童 ${submitData.childPrice} / 張`} />
                  </Form.Group>

                {/* 報名人數選擇 */}
                <Form.Group className="mb-2">
                  {/* <Form.Label className="fw-bold">成人人數：</Form.Label> */}
                  <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Select
                      className={`form-control ${errors.adultCount ? "is-invalid" : ""}`}
                      {...register("adultCount", { 
                        validate: (value) => (!value || isNaN(value) || value < 1) ? "成人人數需大於等於 1" : true,
                        onChange: (e) => {
                          const value = e.target.value;
                          setSelectValue(value);
                          setValue("adultCount", value, { shouldValidate: true });
                        },
                      })} 
                      value={selectValue}
                    >
                      <option value="" disabled>請選擇成人人數</option>
                      {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} 人</option>)}
                    </Form.Select>
                  </OverlayTrigger>
                  {errors.adultCount && <div className="invalid-feedback d-block text-start">{errors.adultCount?.message}</div>}
                </Form.Group>

                <Form.Group className="mb-2">
                  {/* <Form.Label className="fw-bold">兒童人數：</Form.Label> */}
                  <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Select
                      className={`form-control ${errors.childCount ? "is-invalid" : ""}`}
                      {...register("childCount", { 
                        validate: (value) => (!value || isNaN(value) || value < 0) ? "兒童人數需為 0 或以上" : true,
                        onChange: (e) => {
                          const value = e.target.value;
                          setValue("childCount", value, { shouldValidate: true });
                        },
                      })} 
                    >
                      <option value="" disabled>請選擇兒童人數</option>
                      {[0, 1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} 人</option>)}
                    </Form.Select>
                  </OverlayTrigger>
                  {errors.childCount && <div className="invalid-feedback d-block text-start">{errors.childCount?.message}</div>}
                </Form.Group>

                {/* 預約時間選擇 */}
                <Form.Group className="mb-2">
                  <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Form.Select 
                      className={`form-control ${errors.timeSlot ? "is-invalid" : ""}`}
                      {...register("timeSlot", { 
                        validate: (value) => value ? true : "請選擇時段",
                        onChange: (e) => {
                          const value = e.target.value;
                          setSelectTimeSolt(value);
                          setValue("timeSlot", value, { shouldValidate: true });
                        },
                      })} 
                      value={selectTimeSolt}>
                      <option value="">請選擇時段</option>
                      {["09:00-12:00", "14:00-17:00", "09:00-17:00", "18:00-21:00"].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Form.Select>
                  </OverlayTrigger>
                  {errors.timeSlot && <div className="invalid-feedback d-block text-start">{errors.timeSlot?.message}</div>}
                </Form.Group>

                {/* 確認按鈕 */}
                  <Form className="text-end" onSubmit={handleSubmit(onSubmit)}>
                    <Button variant="primary" type="submit" className="px-5 custom-btn">確認報名</Button>
                  </Form>
              </Col>
            </Row>

            {/* 報名人數選擇 */}
            {/* <Form.Group className="mt-4">
              <Form.Label className="fw-semibold">人數：</Form.Label>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Form.Select
                  className={`form-control ${errors.adultCount ? "is-invalid" : ""}`}
                  {...register("adultCount", {
                    validate: (value) => value && !isNaN(value) ? true : "報名人數需大於等於 1",
                    onChange: (e) => {
                      const value = e.target.value;
                      setSelectValue(value);
                      setValue("adultCount", value, { shouldValidate: true });
                    },
                  })}
                  value={selectValue}
                >
                  <option value="" disabled>請選擇報名人數</option>
                  {[1, 2, 3].map(num => <option key={num} value={num}>{num} 人</option>)}
                </Form.Select>
              </OverlayTrigger>
              {errors.adultCount && <div className="invalid-feedback d-block">{errors.adultCount?.message}</div>}
            </Form.Group> */}

            {/* 預約時間選擇 */}
            {/* <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">預約時間：</Form.Label>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Form.Select
                  className={`form-control ${errors.timeSlot ? "is-invalid" : ""}`}
                  {...register("timeSlot", {
                    validate: (value) => value ? true : "請選擇時段",
                    onChange: (e) => {
                      const value = e.target.value;
                      setSelectTimeSolt(value);
                      setValue("timeSlot", value, { shouldValidate: true });
                    },
                  })}
                  value={setSelectTimeSolt}
                >
                  <option value="">請選擇時段</option>
                  {["09:00-12:00", "14:00-17:00", "09:00-17:00", "18:00-21:00"].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Form.Select>
              </OverlayTrigger>
              {errors.timeSlot && <div className="invalid-feedback d-block">{errors.timeSlot?.message}</div>}
            </Form.Group> */}

            
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
  );
};

export default Step1;
