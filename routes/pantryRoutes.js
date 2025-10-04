const express = require("express");
const createPantry = require("../controllers/pantyController");
const router = express.Router();

// POST /api/pantry
router.post("/", pantryController.addItem);

// GET /api/pantry
router.get("/", pantryController.getAllItems);

// GET /api/pantry/:id
router.get("/:id", pantryController.getItemById);

// PUT /api/pantry/:id
router.put("/:id", pantryController.updateItem);

// DELETE /api/pantry/:id
router.delete("/:id", pantryController.deleteItem);

module.exports = router;