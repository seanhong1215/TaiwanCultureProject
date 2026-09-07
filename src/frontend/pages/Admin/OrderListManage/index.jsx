import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Table } from "react-bootstrap";
import OrderModal from '@/frontend/components/Modal/OrderModal';
import PageNation from "@/frontend/components/PageNation";
import { useAdminOrdersQuery, useSaveOrderMutation, useDeleteOrderMutation } from './hooks';


const OrderManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const { orders, totalItems, totalPage } = useAdminOrdersQuery(page, limit);
  const saveOrderMutation = useSaveOrderMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  useEffect(() => {
    // 每次換頁時，讓畫面回到頂部
    window.scrollTo(0, 0);
  }, [page]);

  const handleShow = (order = null) => {
    setCurrentOrder(order);
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentOrder({
      paymentData: {},
      activityName: '',
      activityLocation: '',
      timeSlot: '',
      adultCount: 0,
      childCount: 0,
      adultPrice: 200,
      childPrice: 150,
      paymentStatus: "",
      reservedStatus: "",
      totalAmount: 0
    });
    setShowModal(false);
    // setCurrentOrder(null);
  };

  const handleSave = async (order) => {
    try {
      await saveOrderMutation.mutateAsync(order);
      Swal.fire({ title: order.id ? "更新成功" : "新增成功", icon: "success" });
    } catch (error) {
      console.error("儲存訂單失敗:", error);
      Swal.fire({ title: "儲存失敗", icon: "error" });
    }
    setShowModal(false);
  };

  const handleDelete = async (orderId) => {
    const result = await Swal.fire({
      title: "確定刪除?",
      text: "此操作無法恢復!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "是的, 刪除!",
      cancelButtonText: "取消",
    });
    if (result.isConfirmed) {
      try {
        await deleteOrderMutation.mutateAsync(orderId);
        Swal.fire({ title: "刪除成功", icon: "success" });
      } catch (error) {
        console.error("刪除訂單失敗:", error);
        Swal.fire({ title: "刪除失敗", icon: "error" });
      }
    }
  };


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="d-flex align-items-center gap-2 fw-bold fs-4 mb-0">訂單管理</h2>
            <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => handleShow()}>新增訂單</button>
        </div>
      
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>訂單編號</th>
            <th>下單時間</th>
            <th>預約姓名</th>
            <th>活動名稱</th>
            <th>活動期間</th>
            <th>預約狀態</th>
            <th>訂單金額</th>
            <th>訂單狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.createdAt}</td>
              <td>{order.paymentData.contactName}</td>
              <td>{order.activityName}</td>
              <td>{order.last_bookable_date}</td>
              <td>{order.reservedStatus === "reserved" ? "預約中" : order.reservedStatus === "in_progress" ? "進行中" : order.reservedStatus === "cancel" ? "已取消" : order.reservedStatus === "finished" ? "已完成" : "未知狀態"}</td>
              <td>{order.totalAmount}</td>
              <td>{order.paymentStatus === "PAID" ? "已付款" : order.paymentStatus === "PENDING" ? "尚未付款" : "未知的狀態"}</td>
              <td>
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleShow(order)}>查看</button>{' '}
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(order.id)}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <OrderModal 
        showModal ={showModal} 
        handleClose={handleClose}
        handleSave={handleSave} 
        currentOrder={currentOrder}
        />

      <div className="row">
        <div className="col-12 mb-4">
          {/* Render Pagination only if there are results */}
          {totalPage > 0 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
        </div>
      </div>
    </div>
  );
  
};

export default OrderManagement;