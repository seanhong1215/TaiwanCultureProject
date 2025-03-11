import React from "react";
import './JournalList.scss';
import Breadcrumb from "@/frontend/components/Breadcrumb"
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/DatePicker/DatePicker.scss";
import { getJournalPage, getJournalAll } from '@/frontend/utils/api';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";

const JournalListPage = () => {
    const [totalPage , setTotalPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
    const [page, setPage] = useState(1); // 頁數狀態
    const limit = 8;
    const [journalData, setJournalData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);  

      // 轉址功能
      const navigate = useNavigate();
      const handleNavigate = (e , journal) => {
          e.preventDefault();
          navigate(`/journal-list/${journal.id}`);
          window.scrollTo({ top: 0, behavior: "smooth" }); // 滑動到最上方
      };

    useEffect(() => {
      const fetchGetJournal = async () => {
        setLoading(true);
        try {
          // 先獲取所有資料
          const allDataResponse = await getJournalAll();
          const totalItems = allDataResponse.length; // 直接計算總筆數

          // 設定總筆數
          setTotalItems(totalItems);

          // 計算總頁數
          const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
          setTotalPage(totalPages);

          // 獲取當前頁面的資料
          const response = await getJournalPage(page, limit);
          setJournalData(response); 

        } catch (error) {
          setError('Error fetching journal:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchGetJournal();

       // 每次換頁時，讓畫面回到頂部
      window.scrollTo(0, 0);
    }, [page]); // 監聽 `page`，確保換頁時觸發請求
    

  return (
    <div className="test-container">
      <div className="content">
        <div className="container">
          {/* 麵包屑 */}
          <Breadcrumb />
          <div className="row">
          {journalData.length > 0 ? (
            journalData.map((item) => (
              <div className="col-md-6 col-lg-3" key={item.id} onClick={(e) => handleNavigate(e, item)} style={{cursor:'pointer'}}>
                <div className="card mb-3">
                  <img src={item.images} className="card-img-top" alt="activity" />
                  <div className="card-body">
                    <p className="card-date">{item.date}</p>
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text" dangerouslySetInnerHTML={{ __html: item.content }}></p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">目前沒有資料</p>
          )}

          </div>
          <div className="row">
            <div className="col-12">
              {totalPage > 0 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalListPage;
