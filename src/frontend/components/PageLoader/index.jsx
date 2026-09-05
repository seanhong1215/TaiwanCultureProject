/** 路由層 code splitting 的 Suspense fallback */
const PageLoader = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: '60vh' }}
    role="status"
    aria-live="polite"
  >
    <div className="spinner-border text-secondary" aria-hidden="true" />
    <span className="visually-hidden">載入中…</span>
  </div>
);

export default PageLoader;
