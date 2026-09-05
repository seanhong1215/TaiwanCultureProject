import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * 路由層級的錯誤畫面，同時處理：
 *   - 404：網址沒有對應的路由（由 router 的 `*` catch-all 傳入 notFound）
 *   - 500：頁面元件 render / loader 拋出的例外（由 errorElement 觸發）
 * 沒有這一層時，任何一個元件出錯都會讓整站變成白畫面。
 */
const ErrorPage = ({ notFound = false }) => {
  const error = useRouteError();

  // catch-all 路由不會拋出例外，useRouteError() 會是 undefined，
  // 因此不能只靠 error 判斷，必須讓呼叫端明確指定這是 404。
  const isNotFound = notFound || (isRouteErrorResponse(error) && error.status === 404);

  const title = isNotFound ? '找不到這個頁面' : '頁面發生錯誤';
  const description = isNotFound
    ? '你要找的頁面可能已被移除，或是網址輸入有誤。'
    : '我們已記錄這個問題，請稍後再試，或返回首頁重新操作。';

  return (
    <main className="container py-5 text-center" style={{ minHeight: '70vh' }}>
      <p className="display-1 fw-bold text-secondary mb-3">{isNotFound ? '404' : '500'}</p>
      <h1 className="h3 mb-3">{title}</h1>
      <p className="text-muted mb-4">{description}</p>

      {!isNotFound && error && import.meta.env.DEV && (
        <pre
          className="text-start bg-light border rounded p-3 mx-auto"
          style={{ maxWidth: 720, overflowX: 'auto' }}
        >
          {error instanceof Error ? error.stack : String(error)}
        </pre>
      )}

      <Link to="/" className="btn btn-primary px-4">回到首頁</Link>
    </main>
  );
};

ErrorPage.propTypes = {
  notFound: PropTypes.bool,
};

export default ErrorPage;
