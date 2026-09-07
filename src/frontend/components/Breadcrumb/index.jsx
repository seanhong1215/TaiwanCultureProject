import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./Breadcrumb.scss";
import { getActivitys } from "@/frontend/utils/api/activity";
import { getJournals } from "@/frontend/utils/api/journal";

const Breadcrumb = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const { id } = useParams(); // 獲取活動 ID
  const [activityName, setActivityName] = useState("");
  const [journalName, setJournalName] = useState("");

  // 放在元件內才會隨著語言切換即時更新顯示文字
  const pathNameMap = {
    "activity-list": t('menu.activityList'),
    "journal-list": t('menu.journal'),
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          // Check the pathname to fetch either activity or journal data
          if (location.pathname.includes("activity")) {
            const activityData = await getActivitys(id);
            setActivityName(activityData.content.title);
          } else if (location.pathname.includes("journal")) {
            const journalData = await getJournals(id);
            setJournalName(journalData.title);
          }
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };

      fetchData(); // 呼叫異步函數
    }
  }, [id, location.pathname]); // Re-fetch if pathname or id changes
  
  return (
    <nav className="breadcrumb">
      <Link to="/" className="homeLink">{t('common.home')}</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
       // 根據頁面類型選擇顯示活動名稱或日誌名稱
       let displayName = pathNameMap[name] || decodeURIComponent(name);
       // 如果是最後一個元素，顯示對應的活動名稱或日誌名稱
       if (isLast) {
        if (location.pathname.includes("activity") && activityName) {
          displayName = activityName;
        } else if (location.pathname.includes("journal") && journalName) {
          displayName = journalName;
        }
      }
       
        return (
          <span key={routeTo} className="breadcrumbItem">
            {isLast ? (
              <span className="breadcrumbCurrent">{displayName}</span>
            ) : (
              <Link to={routeTo} className="breadcrumbLink">
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;



