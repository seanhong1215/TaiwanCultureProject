
// module.exports = (req, res, next) => {
//   if (req.path.startsWith("/api/admin")) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || authHeader !== "Bearer admin-token") {
//       return res.status(403).json({ error: "沒有權限" });
//     }
//   }
//   next();
// };