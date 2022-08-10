import mongoose from "mongoose";
import "dotenv/config";

// Intialize connection to database
mongoose.connect(process.env.DATABSE_URL).catch((err) => {
  console.log(err);
  process.exit(1);
});

const recipeSchema = new mongoose.Schema(
  { _id: "number", name: "string", slug: "string" },
  { collection: "recipedata" }
);
const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
