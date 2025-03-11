import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step2.scss";
import { useLocation } from "react-router-dom";

const Step2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const submitData = location.state || {}; 

  const date = new Date(submitData.last_bookable_date);

  const formattedDate = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;

  return (
    <Container className="booking-step2 py-4">
      {/* 頁面標題 */}
      <h2 className="text-center mb-4">確認表單</h2>

       {/* 進度指示器 */}
        <div className="progress-steps d-flex justify-content-center mb-5">
          {['行程資料', '確認訂單', '付款資料', '完成預約'].map((step, index) => (
            <Button
              key={index}
              className={`me-2 px-3 fw-semibold ${index === 1 ? "custom-btn" : "outline-custom-btn"}`}
            >
              {index + 2}. {step}
            </Button>
          ))}
        </div>

      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="p-4">
            <Card.Body>
              <h4 className="mb-3 text-center">您想報名的是</h4>
              <Row>
                <Col md={12}>
                <Card className="p-4 text-start mx-auto shadow-lg" style={{ maxWidth: "400px", minHeight: "350px" }}>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    {/* 標題區 */}
                    <h5 className="mb-3 text-center">行程訂單</h5>
                    
                    {/* 主要內容 */}
                    <div>
                      <h6 className="fw-bold">{submitData.activityName}</h6>
                      <p className="mb-2"><strong>報名人數：</strong> {submitData.adultCount} 位成人, {submitData.childCount} 位兒童</p>
                      <p className="mb-2"><strong>日期：</strong> {formattedDate}</p>
                      <p className="mb-2"><strong>票價：</strong> 成人 {submitData.adultPrice} / 張，兒童 {submitData.childPrice} / 張</p>
                      <p className="mb-2"><strong>時間：</strong> {submitData.timeSlot}</p>
                      <p className="mb-2"><strong>地點：</strong> {submitData.activityLocation}</p>
                    </div>

                    {/* 總金額 */}
                    <h5 className="fw-bold text-danger text-center mt-3">NT$ {submitData.totalAmount}</h5>
                  </Card.Body>
                </Card>

                </Col>
              </Row>

              {/* 操作按鈕 */}
              <div className="mt-4 text-center">
                <Button variant="secondary" className="me-2" onClick={() => navigate("/activity-list/booking1", { state: submitData })}>返回行程資訊</Button>
                <Button variant="primary" className="px-4 custom-btn" onClick={() => navigate("/activity-list/booking3", { state: submitData })}>去結帳</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Step2;
