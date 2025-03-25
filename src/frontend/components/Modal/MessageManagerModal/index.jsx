import { useState } from 'react';
import PropTypes from "prop-types";

const MessageManagerModal = ({showModal, handleCloseModal, selectedReview}) => { 

  return (
    <>
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">編輯留言</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input type="text" className="form-control mb-3" defaultValue={selectedReview.name} />
                <textarea
                  className="form-control"
                  rows={4}
                  defaultValue={selectedReview.reviewContent}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// PropTypes 定義
MessageManagerModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    handleCloseModal: PropTypes.func.isRequired,
    selectedReview: PropTypes.object.isRequired,
  };

export default MessageManagerModal;
