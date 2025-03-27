import { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Container } from "react-bootstrap";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get("/api/notifications").then((res) => {
      setNotifications(res.data);
    });
  }, []);

  return (
    <Container className="mt-4">
      <h4>🔔 通知列表</h4>
      <ListGroup>
        {notifications.map((n) => (
          <ListGroup.Item key={n.id}>
            {n.message} - {new Date(n.timestamp).toLocaleString()}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default NotificationsPage;
