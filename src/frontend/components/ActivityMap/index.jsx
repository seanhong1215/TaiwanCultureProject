import PropTypes from "prop-types";
import { useRef, useEffect, useState } from 'react';
import './ActivityMap.scss';

/**
 * 活動地點地圖。
 *
 * 先前的實作有兩個問題：
 * 1. `import L from 'leaflet'` 是靜態引入，leaflet 與它的 CSS（約 150 kB）
 *    會跟著活動詳情頁一起下載並執行，即使使用者從來沒有捲到地圖區塊。
 *    地圖一掛載就立刻請求圖磚，是這一頁卡頓的主因。
 * 2. loading 為 true 時顯示的是「找不到活動資訊」，把「還在載入」
 *    講成了「沒有資料」。
 *
 * 現在改成捲動到附近才動態載入 leaflet，並且在那之前先用等高的
 * 佔位區塊撐住版面，避免地圖載入時整頁跳動。
 */
const ActivityMap = ({ activityDetailData, loading = false }) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [failed, setFailed] = useState(false);

  const detail = Array.isArray(activityDetailData) ? activityDetailData[0] : null;
  const mapData = detail?.map;
  const title = detail?.trip?.title ?? '';
  const latitude = mapData?.latitude;
  const longitude = mapData?.longitude;
  const hasCoordinates = Boolean(latitude && longitude);

  // 捲到地圖附近（提前 200px）才開始載入
  useEffect(() => {
    if (!hasCoordinates || shouldLoad) return undefined;

    const element = containerRef.current;
    if (!element) return undefined;

    // 環境不支援時直接載入，不要讓地圖永遠不出現
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasCoordinates, shouldLoad]);

  // 動態載入 leaflet 並初始化地圖
  useEffect(() => {
    if (!shouldLoad || !hasCoordinates) return undefined;

    let cancelled = false;

    const setupMap = async () => {
      try {
        const [leaflet] = await Promise.all([
          import('leaflet'),
          import('leaflet/dist/leaflet.css'),
        ]);
        const L = leaflet.default ?? leaflet;

        // 元件可能在等待期間就被卸載了
        if (cancelled || !containerRef.current || mapInstanceRef.current) return;

        const map = L.map(containerRef.current).setView([latitude, longitude], 13);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map).bindPopup(title).openPopup();
      } catch (error) {
        console.error('地圖載入失敗:', error);
        if (!cancelled) setFailed(true);
      }
    };

    setupMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shouldLoad, hasCoordinates, latitude, longitude, title]);

  if (loading) {
    return <div className="activity-map activity-map--placeholder">地圖載入中…</div>;
  }

  if (!detail) {
    return <p className="activity-map__message">找不到活動資訊</p>;
  }

  if (!hasCoordinates) {
    return <p className="activity-map__message">此活動未提供地圖資訊</p>;
  }

  if (failed) {
    return <p className="activity-map__message">地圖載入失敗，請稍後再試</p>;
  }

  // 尚未捲到畫面時，容器維持同樣高度以避免版面跳動
  return (
    <div ref={containerRef} className="activity-map">
      {!shouldLoad && <span className="activity-map__hint">地圖將於捲動至此時載入</span>}
    </div>
  );
};

ActivityMap.propTypes = {
  activityDetailData: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        trip: PropTypes.shape({
          title: PropTypes.string,
        }),
        map: PropTypes.shape({
          latitude: PropTypes.string,
          longitude: PropTypes.string,
        }),
      })
    ),
    PropTypes.object,
  ]),
  loading: PropTypes.bool,
};

export default ActivityMap;
