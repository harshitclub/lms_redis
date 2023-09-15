import { app } from "./app";
import connectDB from "./utils/db";
require("dotenv").config();

const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
  console.log(`Server Start At ${PORT}`);
  connectDB();
});
