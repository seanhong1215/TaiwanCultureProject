import React, { useState , useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Step3.scss";
import { createOrder } from "@/frontend/utils/api"
import { useLocation } from "react-router-dom";
import { useForm } from 'react-hook-form';
import axios from "axios";
import Swal from 'sweetalert2';

axios.defaults.baseURL = process.env.NODE_ENV === 'production'
 ? 'https://taiwan-culture-project.onrender.com'
 : 'http://localhost:3002'

const Step3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submitData = location.state || {}; 

  const {
      register,
      watch,
      reset,
      setValue,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        contactName : '',
        cardNumber: '', 
        expiryDate: '', 
        cvv: '', 
      },
      mode: "onTouched"
    });

  const onSubmit  = async (data) => {
    const orderData = {
      ...submitData, // 包含用户表单数据
      paymentData: data
    };



 
    
    
    try {
      // const timeSlot = submitData.timeSlot;
      // 執行 POST 請求
      const createResponse = await createOrder(orderData);
      Swal.fire({
              title: "預約成功",
              icon: "success"
          })
      navigate("/activity-list/booking4" ,{ state: createResponse } );
    } catch (error) {
      // 處理錯誤
      console.error("發送請求時出錯:", error);
    }
  };
  

  return (
    <Container className="payment-step py-4">
      {/* 頁面標題 */}
      <h2 className="text-center mb-4">付款資料</h2>

       {/* 進度指示器 */}
          <div className="progress-steps d-flex justify-content-center mb-5">
            {['行程資料', '確認訂單', '付款資料', '完成預約'].map((step, index) => (
              <Button
                key={index}
                className={`me-2 px-3 fw-semibold ${index === 2 ? "custom-btn" : "outline-custom-btn"}`}
              >
                {index + 3}. {step}
              </Button>
            ))}
          </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-3 payment-card">
            <Card.Body>
              <h4 className="mb-3">請輸入付款資料</h4>
              
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="cardName">
                  <Form.Label>持卡人姓名</Form.Label>
                  <Form.Control type="text" placeholder="輸入持卡人姓名" name="contactName" className={`form-label ${errors.contactName && "is-invalid"}`} {...register('contactName' , 
                  {required : '請輸入持卡人姓名', pattern : {
                  value : /^.{3,}$/ ,
                  message : "至少3個字"
                  }})}/>
                  {errors.contactName && <div className="invalid-feedback text-start">{errors.contactName?.message}</div>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="cardNumber">
                  <Form.Label>信用卡號</Form.Label>
                  <Form.Control type="text" placeholder="xxxx-xxxx-xxxx-xxxx" {...register("cardNumber", { required: "此欄位為必填" ,  pattern : {
                  value : /^.{3,}$/ ,
                  message : "至少3個字"
                  } })} />
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
