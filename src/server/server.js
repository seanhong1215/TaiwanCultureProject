const path = require("path");
const jsonServer = require("json-server");
const auth = require("json-server-auth");

const jwt_decode = require("jwt-decode");

require('dotenv').config(); // 引入 dotenv 庫來讀取 .env 檔案
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const port = process.env.PORT || 3001;

console.log(JWT_SECRET_KEY);

const server = jsonServer.create();
const router = jsonServer.router("src/json/db.json");
const middlewares = jsonServer.defaults();

const rules = auth.rewriter({
  // Permission rules
  // users: 600,
  users: 640,
  posts: 664,

  // Other rules
  // '/posts/:category': '/posts?category=:category',
});

// /!\ Bind the router db to the app server
server.db = router.db;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if (req.method === "POST") {
    const token = req.header("Authorization")
      ? req.header("Authorization").replace("Bearer ", "")
      : null;

    if (token) {
      try {

        const decoded = jwt_decode(token); // 解碼 JWT
        console.log({ token, decoded }); // 輸出解碼後的 JWT 資料

        const intSub = Number(decoded.sub);
        req.body.userId = intSub;

      } catch (err) {
        console.error("Invalid Token:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
      }

    }
    /* end of IF-token */
  }

  // Continue to JSON Server router
  next();
});
/* end of custom */

server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

// Use default router
server.use("/api", router);

server.listen(port, () => {
  console.log("JSON Server Listening on:" + port);
});