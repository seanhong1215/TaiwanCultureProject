import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step2.scss";
import { useLocation } from "react-router-dom";
import { formatDateZh } from "@/frontend/utils/date";
import BookingSteps from "@/frontend/components/BookingSteps";
import { resolveBookingData, saveBookingDraft } from '@/frontend/utils/bookingDraft';

const Step2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 重新整理時 location.state 會消失，退回 sessionStorage 的草稿
  const submitData = resolveBookingData(location.state);

  // 導回列表前先看草稿：原本只認 location.state，
  // 使用者在流程中重新整理就會被踢回活動列表、資料全失
  useEffect(() => {
    if (!submitData.activityName) {
      navigate('/activity-list', { replace: true });
      return;
    }
    if (location.state) saveBookingDraft(location.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);


  const formattedDate = formatDateZh(submitData.last_bookable_date);

  return (
    <Container className="booking-step2 py-4">
      {/* 頁面標題 */}
      <h2 className="text-center mb-4">確認表單</h2>

       {/* 進度指示器 */}
        <BookingSteps current={2} />

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
