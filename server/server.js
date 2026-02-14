import connectDB from "./configs/db.js";
import app from "./app.js";

await connectDB();

const port = process.env.PORT || 4000;

//error handling
process.on("unhandledRejection", (err) => {
  console.error(`unhandled Rejection ${err.message}`);
  server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
  console.error(`uncaught Exception ${err.message}`);
  process.exit(1);
});

// Default route
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
