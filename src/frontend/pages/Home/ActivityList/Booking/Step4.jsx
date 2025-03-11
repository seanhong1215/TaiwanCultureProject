import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step4.scss";
import { useLocation } from "react-router-dom";

const Step4 = () => {
  const navigate = useNavigate();

    const location = useLocation();
    const submitData = location.state || {}; 
    
    const date = new Date(submitData.last_bookable_date);

    const formattedDate = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
    
  return (
    <Container className="completion-page py-4">
      {/* 頁面標題 */}
      <h2 className="text-center mb-4">報名成功！</h2>
      
 {/* 進度指示器 */}
    <div className="progress-steps d-flex justify-content-center mb-5">
      {['行程資料', '確認訂單', '付款資料', '完成預約'].map((step, index) => (
        <Button
          key={index}
          className={`me-2 px-3 fw-semibold ${index === 3 ? "custom-btn" : "outline-custom-btn"}`}
        >
          {index + 4}. {step}
        </Button>
      ))}
    </div>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-3 completion-card text-center">
            <Card.Body>
              <h4 className="mb-3">您的預約行程已確認！</h4>
              <p>我們已經發送報名確認通知至您的 Email，請查收。</p>
              <p>如果您需要修改行程或有任何問題，請聯繫客服。</p>
              
              <Card className="p-4 mt-4 text-start mx-auto shadow-lg" style={{ maxWidth: "400px", minHeight: "350px" }}>
                <Card.Body className="d-flex flex-column">
                  {/* 標題區 */}
                  <h5 className="text-center">您的行程</h5>
                  
                  {/* 主要內容 */}
                  <div className="m-auto">
                    <p className="mb-2"><strong>{submitData.activityName}</strong></p>
                    <p className="mb-2"><strong>報名人數：</strong> {submitData.adultCount} 位成人, {submitData.childCount} 位兒童</p>
                    <p className="mb-2"><strong>活動日期：</strong> {formattedDate}</p>
                    <p className="mb-2"><strong>活動地點：</strong> {submitData.activityLocation}</p>
                    <p className="mb-2"><strong>總金額：</strong> {submitData.totalAmount}</p>
                    <p className="mb-2"><strong>支付狀態：</strong> {submitData.paymentStatus === "PAID" ? '已支付' : '待支付'}</p>
                    <p className="mb-2"><strong>訂單編號：</strong> {submitData.orderId}</p>
                  </div>

                
                </Card.Body>
              </Card>

              {/* 返回按鈕 */}
              <div className="mt-4">
                <Button className="px-4 me-2 custom-btn" onClick={() => navigate("/member-center/center")}>前往會員中心</Button>
                <Button className="px-4 btn btn-secondary" onClick={() => navigate("/")}>回到首頁</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Step4;