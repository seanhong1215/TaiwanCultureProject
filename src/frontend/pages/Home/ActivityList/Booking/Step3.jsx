import React, { useState , useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step3.scss";
import { createOrder, addNotifications } from "@/frontend/utils/api"
import { useLocation } from "react-router-dom";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { toSafePaymentRecord } from "@/frontend/utils/payment";
import BookingSteps from "@/frontend/components/BookingSteps";

const Step3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submitData = location.state || {};

  useEffect(() => {
    if (!location.state?.activityName) {
      navigate('/activity-list', { replace: true });
    }
  }, []);

  const userName = localStorage.getItem("userName");

  const {
      register,
      watch,
      reset,
      setValue,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        contactName : userName,
        cardNumber: '', 
        expiryDate: '', 
        cvv: '', 
      },
      mode: "onTouched"
    });

  const onSubmit  = async (data) => {
    // 只保留持卡人／卡別／末四碼；完整卡號、有效期限與 CVV 不離開此元件
    const orderData = {
      ...submitData, // 包含使用者表單資料
      paymentData: toSafePaymentRecord(data)
    };

    try {
      // 執行 POST 請求
      const createResponse = await createOrder(orderData);

      // 通知必須在導頁「之前」送出：navigate 會卸載本元件，
      // 原本寫在 navigate 之後的請求實際上不一定會送出去。
      // 通知失敗不應該擋住已成功的訂單，因此獨立 catch。
      await addNotifications({
        message: `新預約：${userName}`,
        timestamp: new Date().toISOString()
      }).catch((err) => console.error("建立通知失敗:", err));

      Swal.fire({
        title: "預約成功",
        icon: "success"
      });
      navigate("/activity-list/booking4", { state: createResponse });

    } catch (error) {
      console.error("發送請求時出錯:", error);
      Swal.fire({
        title: "預約失敗",
        text: error.response?.data?.message || error.message,
        icon: "error"
      });
    }
  };
  

  return (
    <Container className="payment-step py-4">
      {/* 頁面標題 */}
      <h2 className="text-center mb-4">付款資料</h2>

       {/* 進度指示器 */}
          <BookingSteps current={3} />

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-3 payment-card">
            <Card.Body>
              <h4 className="mb-3">請輸入付款資料</h4>
              
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="cardName">
                  <Form.Label>持卡人姓名</Form.Label>
                  <Form.Control type="text" placeholder="輸入持卡人姓名" disabled name="contactName" className={`form-label ${errors.contactName && "is-invalid"}`} />
                  {errors.contactName && <div className="invalid-feedback text-start">{errors.contactName?.message}</div>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="cardNumber">
                  <Form.Label>信用卡號</Form.Label>
                  <Form.Control type="text" placeholder="xxxx-xxxx-xxxx-xxxx" className={`form-label ${errors.cardNumber && "is-invalid"}`} {...register("cardNumber", { required: "此欄位為必填"  })} />
                  {errors.cardNumber && <div className="invalid-feedback text-start">{errors.cardNumber?.message}</div>}
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="expiryDate">
                      <Form.Label>有效期限</Form.Label>
                      <Form.Control type="text" placeholder="MM/YY"className={`form-label ${errors.expiryDate && "is-invalid"}`} {...register("expiryDate", { required: "此欄位為必填" , pattern : {
                  value : /^(0[1-9]|1[0-2])\/\d{2}$/ ,
                  message : "請輸入正確有效期限"
                  }})}/>
                      {errors.expiryDate && <div className="invalid-feedback text-start">{errors.expiryDate?.message}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cvv">
                      <Form.Label>安全碼</Form.Label>
                      <Form.Control type="text" placeholder="XXX"className={`form-label ${errors.cvv && "is-invalid"}`} {...register("cvv", { required: "此欄位為必填" , pattern : {
                  value : /^.{3,}$/ ,
                  message : "安全碼為3位數字"
                  }})}/>
                      {errors.cvv && <div className="invalid-feedback text-start">{errors.cvv?.message}</div>}
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="text-center mt-4">
                  <Button variant="secondary" className="me-2" onClick={() => navigate("/activity-list/booking2",{ state: submitData })}>返回上一頁</Button>
                  <Button type="submit" variant="primary" className="px-4 custom-btn">提交</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Step3;
