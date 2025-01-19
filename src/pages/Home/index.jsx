import Card from '@/components/Card/index.jsx';
import './Home.scss';

const Home = () => {
  return (
    <div className="home">
       <section className="section section-0">
        <h2 className="section-title">立即搜索全台特色景點資訊！</h2>
        {/* <p className="section-subtitle">副標題 1</p> */}
        <div className="row row-cols-1">
          
        </div>
      </section>

      <section className="section section-1">
        <h2 className="section-title">熱門活動</h2>
        <p className="section-subtitle">體驗在地文化，暢遊台灣。 品嚐台灣道地美食！</p>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <Card
              image="https://placehold.co/400x300"
              title="卡片標題 1"  
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/400x300"
              title="卡片標題 2"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/400x300"
              title="卡片標題 3"
              description="這是卡片內容描述。"
            />
          </div>
        </div>
      </section>

      <section className="section section-2">
        <h2 className="section-title">為什麼選擇我們</h2>
        {/* <p className="section-subtitle">副標題 2</p> */}
        <div className="row row-cols-1 row-cols-md-4 g-4">
          <div className="col">
            <div className="circle-image">
              <img src="https://placehold.co/200" alt="..." />
            </div>
          </div>
          <div className="col">
            <div className="circle-image">
              <img src="https://placehold.co/200" alt="..." />
            </div>
          </div>
          <div className="col">
            <div className="circle-image">
              <img src="https://placehold.co/200" alt="..." />
            </div>
          </div>
          <div className="col">
            <div className="circle-image">
              <img src="https://placehold.co/200" alt="..." />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-3">
        <h2 className="section-title">慢活日誌</h2>
        <p className="section-subtitle">放慢腳步，細品生活之美。</p>
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
          <div className="col">
            <div className="blog-item">
              <img src="https://placehold.co/300x600" alt="..." />
              <h5 className="blog-title py-2">部落格標題 1</h5>
              <p className="blog-description">這是部落格文章簡介。</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-item">
              <img src="https://placehold.co/300x600" alt="..." />
              <h5 className="blog-title py-2">部落格標題 2</h5>
              <p className="blog-description">這是部落格文章簡介。</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-item">
              <img src="https://placehold.co/300x600" alt="..." />
              <h5 className="blog-title py-2">部落格標題 3</h5>
              <p className="blog-description">這是部落格文章簡介。</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-item">
              <img src="https://placehold.co/300x600" alt="..." />
              <h5 className="blog-title py-2">部落格標題 4</h5>
              <p className="blog-description">這是部落格文章簡介。</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-item">
              <img src="https://placehold.co/300x600" alt="..." />
              <h5 className="blog-title py-2">部落格標題 5</h5>
              <p className="blog-description">這是部落格文章簡介。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-4">
        <h2 className="section-title">活動好評</h2>
        {/* <p className="section-subtitle">副標題 4</p> */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 1"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 2"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 3"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 4"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 5"
              description="這是卡片內容描述。"
            />
          </div>
          <div className="col">
            <Card
              image="https://placehold.co/200x100"
              title="卡片標題 6"
              description="這是卡片內容描述。"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;