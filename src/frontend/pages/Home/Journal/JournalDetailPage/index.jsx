
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getJournalAll } from '@/frontend/utils/api';
import './JournalDetail.scss';

const JournalDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentJournal = useParams();

  // 從location.state獲取journal數據
  const journal = location.state?.journalData;

  // 假設 relatedPosts 初始為空陣列
  const [relatedPosts, setRelatedPosts] = useState([]);

  const handleClick = (post) => {
    navigate(`/journal-list/${post.id}`, { state: { journalData: post } });
    window.scrollTo(0, 0); // 滾動回頂部
  };
  
  useEffect(() => {
    if (!journal) {
      navigate('/journal-list');
      return null;
    } else {
      const getRelatedPosts = async () => {
        try {
          const allJournals = await getJournalAll();
          const otherJournals = allJournals.filter(journal => journal.id !== currentJournal.id);
          const sortedJournals = otherJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
  
          setRelatedPosts(sortedJournals.slice(0, 6)); // 更新狀態
        } catch (error) {
          console.error("Error fetching related posts:", error);
        }
      };
      getRelatedPosts();
    }

  }, [navigate, currentJournal]); 


  // if (loading || !currentJournal) return <div>加載中...</div>;

  return (
    <div className="blog-post-container">
      
      {/* Main Content */}
      <div className="container blog-container mt-5">
        <div className="row">
          {/* Main Content Column */}
          <div className="col-lg-12">
            {/* Post Header */}
            <div className="post-header text-center mb-4">
              <div className="post-category mb-2">
                <a href="#" className="text-decoration-none text-danger fw-bold">LIFESTYLE</a>
              </div>
              <h1 className="post-title fw-bold mb-3">{journal.title}</h1>
              <div className="post-meta text-muted d-flex justify-content-center gap-3 fs-6">
                <span>{journal.date}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="post-featured-image mb-4">
              <img src={journal.images} alt="" className="img-fluid rounded" />
            </div>

            {/* Post Content */}
            <div className="post-content">
              <p className="lead" dangerouslySetInnerHTML={{ __html: journal.content }}></p>

              {/* Related Posts */}
              <div className="related-posts">
                <h3 className="fw-bold mb-4">You May Also Like</h3>
                <div className="row">
                  {relatedPosts.map((post) => (
                    <div className="col-md-4 mb-4" key={post.id}>
                      <div className="card border-0" style={{cursor: 'pointer'}} onClick={() => handleClick(post)}>
                        <img 
                          src={post.images} 
                          className="card-img-top rounded" 
                          alt={post.title} 
                        />
                        <div className="card-body px-0">
                          <h5 className="card-title mt-2">
                            <a 
                              href={`/journal-list/${post.id}`} 
                              className="text-decoration-none text-dark catd-title"
                            >
                              {post.title}
                            </a>
                          </h5>
                      
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            
            </div>
          </div>
          
          
        </div>
      </div>
      
     
    </div>
  );
};

export default JournalDetailPage;






