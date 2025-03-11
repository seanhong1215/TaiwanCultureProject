import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./Breadcrumb.scss";
import { getActivitys } from "@/frontend/utils/api"; // 假設有 API 可查詢活動名稱

const pathNameMap = {
  "activity-list": "所有活動",
  "journal-list": "慢活日誌",
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const { id } = useParams(); // 獲取活動 ID
  const [activityName, setActivityName] = useState("");

  useEffect(() => {
    if (id) {
        getActivitys(id).then((data) => setActivityName(data.content.title));
    }
  }, [id]);
  
  return (
    <nav className="breadcrumb">
      <Link to="/" className="homeLink">首頁</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = pathNameMap[name] || (id && activityName ? activityName : decodeURIComponent(name));

        return (
          <span key={routeTo} className="breadcrumbItem">
            {isLast ? (
              <span className="breadcrumbCurrent">{displayName}</span>
            ) : (
              <Link to={routeTo} className="breadcrumbLink">{displayName}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;



