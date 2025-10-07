const {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  generateList,
} = require("../controllers/shoppingController");
const express = require("express");
const router = express.Router();


/**
 * Routes definition
 */
router.post("/", addItem);
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.post("/generate", generateList);

module.exports = router;
