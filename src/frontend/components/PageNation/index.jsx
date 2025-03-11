import PropTypes from "prop-types";

const PageNation = ({ totalPage, page, setPage }) => {
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPage) return;
    setPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPage }, (_, index) => index + 1).map(
      (pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          disabled={page === pageNumber}
        >
          {pageNumber}
        </button>
      )
    );
  };

  return (
    <div className="pagenation">
      <button 
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
        disabled={page === 1}
      >
        <span className="material-icons">chevron_left</span>
      </button>
      <div className="currentPage">{renderPaginationButtons()}</div>
      <button 
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))} 
        disabled={page === totalPage}
      >
        <span className="material-icons">navigate_next</span>
      </button>
    </div>
  );
};

PageNation.propTypes = {
  totalPage: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
};

export default PageNation;
