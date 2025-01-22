import { Card, ReviewCard} from '@/components/Card';
import './Home.scss';
import { useTranslation } from 'react-i18next';

import React, { useEffect, useState } from 'react';
import { getActivity, getJournal, getReviews } from '@/utils/api';


const Home = () => {
    const [activityData, setActivityData] = useState([]);
    const [journalData, setJournalData] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGetActivity = async () => {
            try {
                const response  = await getActivity(); // 呼叫 API 函數
                setActivityData(response); // 將取得的資料設置到 state
                // console.log(response);
            } catch (err) {
                setError('Failed to fetch users');
            } 
        };
        const fetchGetJournal = async () => {
            try {
                const response  = await getJournal(); // 呼叫 API 函數
                setJournalData(response); // 將取得的資料設置到 state
                // console.log(response);
            } catch (err) {
                setError('Failed to fetch users');
            } 
        };
        const fetchReviews = async () => {
            try {
                const response = await getReviews();
                setReviews(response); // 將 API 資料存入 reviews
                // console.log(response);
            } catch (err) {
                setError("Failed to fetch reviews");
                console.error(err);
            }
        };

        fetchGetActivity();
        fetchGetJournal();
        fetchReviews();
    }, []); // 空陣列表示只在組件加載時呼叫一次

    const { t } = useTranslation();

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="home">
            <section className="section banner-section">
                <div className="container">
                    <h2 className="section-title text-center">{t('searchViewInfo')}</h2>
                    <div className="search-wrapper">
                        <div className="search-header">
                            <div className="search-input-group">
                                <input type="text" className="search-input form-control" placeholder={t('banner.searchPlacehoder')} />
                                <button className="btn search-button">{t('banner.search')}</button>
                                <button className="btn search-button-more">{t('banner.searchMore')}</button>
                                {/* <i className="fas fa-search search-icon"></i> */}
                            </div>
                            <div className="quick-filters">
                                <span className="quick-filter">{t('banner.taichung')}</span>
                                <span className="quick-filter">{t('banner.taipei')}</span>
                                <span className="quick-filter">{t('banner.kaohsiung')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section popular-event-section">
                <div className="container">
                    <div className="main-text text-center">
                        <h2 className="section-title">{t('popularEventTitle')}</h2>
                        <p className="section-subtitle">{t('popularEventSubTitle')}</p>
                    </div>
                    <div className="row">
                        {activityData.length > 0 ? (
                            activityData.map((item) => (
                            <div className="col-md-6 col-lg-4" key={item.id}>
                                <Card
                                {...item}
                                onFavoriteToggle={(id) => {
                                    setActivityData((prevData) =>
                                        prevData.map((activity) =>
                                            activity.id === id
                                            ? { ...activity, isFavorited: !activity.isFavorited }
                                            : activity
                                        )
                                    );
                                }}
                                />
                            </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-center">載入中...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="section benefit-section">
                <div className="container">
                <h2 className="section-title text-center py-4">{t('benefit.mainTitle')}</h2>
                <div className="row row-cols-1 row-cols-md-4 g-4">
                    <div className="col">
                    <div className="circle-image">
                        <img src="https://placehold.co/200" alt="..." />
                    </div>
                    <h5 className="card-title">{t('benefit.content.culturalExperienceTitle')}</h5>
                    <p className="card-text">{t('benefit.content.culturalExperienceText')}</p>
                    </div>
                    <div className="col">
                    <div className="circle-image">
                        <img src="https://placehold.co/200" alt="..." />
                    </div>
                    <h5 className="card-title">{t('benefit.content.reservationPlatformTitle')}</h5>
                    <p className="card-text">{t('benefit.content.reservationPlatformText')}</p>
                    </div>
                    <div className="col">
                    <div className="circle-image">
                        <img src="https://placehold.co/200" alt="..." />
                    </div>
                    <h5 className="card-title">{t('benefit.content.recommendationsTitle')}</h5>
                    <p className="card-text">{t('benefit.content.recommendationsText')}</p>
                    </div>
                    <div className="col">
                    <div className="circle-image">
                        <img src="https://placehold.co/200" alt="..." />
                    </div>
                    <h5 className="card-title">{t('benefit.content.DeepConnectionTitle')}</h5>
                    <p className="card-text">{t('benefit.content.DeepConnectionText')}</p>
                    </div>
                </div>
                </div>
            </section>

            <section className="section journal-section">
                <div className="container">
                    <div className="main-text text-center">
                        <h2 className="section-title">{t('journalTitle')}</h2>
                        <p className="section-subtitle">{t('journalSubTitle')}</p>
                    </div>
                    <div className="row">
                        {journalData.length > 0 ? (
                            journalData.map((item) => (
                                <div className="col-md-6 col-lg-3" key={item.id}>
                                <div className="blog-item">
                                    <img src={item.images}  />
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text">{item.body}</p>
                                </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-center">載入中...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="section reviews-section">
                <div className="container">
                    <h2 className="section-title text-center">{t('eventReviews')}</h2>
                    <div className="row">
                        {reviews.length > 0 ? ( 
                            reviews.map((review) => (
                            <div className="col-md-6 col-lg-4" key={review.id}>
                                <ReviewCard
                                    key={review.id}
                                    avatar={review.user.avatar}
                                    name={review.user.name}
                                    rating={review.rating}
                                    activityTitle={review.activityTitle}
                                    reviewContent={review.reviewContent}
                                />
                            </div>
                            ))
                        ) : (
                            <p>目前沒有好評。</p>
                        )}
                       
                    </div>
                </div>
            </section>
    </div>
  );
};

export default Home;