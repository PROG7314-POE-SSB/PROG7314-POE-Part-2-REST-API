const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const pantryController = require("../controllers/pantyController");

// POST /api/pantry
router.post("/", verifyToken, pantryController.addItem);

// GET /api/pantry
router.get("/", verifyToken, pantryController.getAllItems);

// GET /api/pantry/:id
router.get("/:id", verifyToken, pantryController.getItemById);

// PUT /api/pantry/:id
router.put("/:id", verifyToken, pantryController.updateItem);

// DELETE /api/pantry/:id
router.delete("/:id", verifyToken, pantryController.deleteItem);

module.exports = router;
