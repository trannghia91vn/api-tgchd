const app = require("./app");

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server của boss đang chạy ở cổng ${PORT}`);
});
