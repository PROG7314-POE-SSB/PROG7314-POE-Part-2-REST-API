const express = require("express");
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Helper: Get collection reference for a user's shopping list
 */
const getShoppingListRef = (userId) => db.collection("users").doc(userId).collection("shoppingLists");

/**
 * Add a new item to the shopping list
 * POST /api/shopping-list
 */
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, description, quantity, category } = req.body;

    if (!title || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItemRef = getShoppingListRef(userId).collection("items").doc();
    const itemData = {
      id: newItemRef.id,
      title,
      description: description || "",
      quantity: Number(quantity),
      category: category || "",
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newItemRef.set(itemData);

    res.status(201).json({ message: "Item added successfully", item: itemData });
  } catch (error) {
    console.error("Error adding shopping list item:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
};

/**
 * Get all items for the authenticated user
 * GET /api/shopping-list
 */
exports.getAllItems = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await getShoppingListRef(userId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
        return res.status(200).json([]);
    }

    const lists = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(lists);
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    res.status(500).json({ error: "Failed to fetch shopping lists" });
  }
};



/**
 * Get a single item by ID
 * GET /api/shopping-list/:id
 */
exports.getItemById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const docRef = getShoppingListRef(userId).collection("items").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

/**
 * Update an item
 * PUT /api/shopping-list/:id
 */
exports.updateItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { title, description, quantity, category } = req.body;

    const docRef = getShoppingListRef(userId).collection("items").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updatedData = {
      title: title || doc.data().title,
      description: description || doc.data().description,
      quantity: quantity !== undefined ? Number(quantity) : doc.data().quantity,
      category: category || doc.data().category,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.update(updatedData);
    res.status(200).json({ message: "Item updated successfully", item: updatedData });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
};

/**
 * Delete an item
 * DELETE /api/shopping-list/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    await getShoppingListRef(userId).collection("items").doc(id).delete();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

/**
 * Generate a shopping list (example: based on pantry items low in stock)
 * POST /api/shopping-list/generate
 */
exports.generateList = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { recipeId, recipeName, ingredients } = req.body;

    if (!recipeId || !recipeName || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Missing required recipe data." });
    }

    // 1. Fetch user's pantry items
    const pantryRef = db.collection("users").doc(userId).collection("pantry");
    const pantrySnapshot = await pantryRef.get();
    const pantryItems = new Map();
    pantrySnapshot.docs.forEach(doc => {
      // Assuming pantry item names are unique and used as keys
      pantryItems.set(doc.data().name.toLowerCase(), doc.data());
    });

    // 2. Determine which ingredients are needed
    const neededItems = [];
    for (const ingredient of ingredients) {
      const pantryItem = pantryItems.get(ingredient.name.toLowerCase());
      const requiredQuantity = Number(ingredient.quantity) || 0;

      if (!pantryItem || pantryItem.quantity < requiredQuantity) {
        const quantityInPantry = pantryItem ? pantryItem.quantity : 0;
        const quantityToBuy = requiredQuantity - quantityInPantry;

        if (quantityToBuy > 0) {
            neededItems.push({
                // Generate a unique ID for the item within the list
                itemId: db.collection("users").doc().id, 
                name: ingredient.name,
                quantity: quantityToBuy,
                unit: ingredient.unit,
                checked: false,
                addedAt: admin.firestore.Timestamp.now(), // Use Firestore Timestamp
            });
        }
      }
    }

    // 3. If no items are needed, inform the user
    if (neededItems.length === 0) {
      return res.status(200).json({ message: "You have all the ingredients!", list: null });
    }

    // 4. Create the new shopping list
    const shoppingListRef = getShoppingListRef(userId).doc();
    const newListData = {
      listId: shoppingListRef.id,
      listName: recipeName,
      description: `Shopping list for ${recipeName}`,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      isSmartGenerated: true,
      recipeId: recipeId,
      recipeName: recipeName,
      items: neededItems,
      totalItems: neededItems.length,
      checkedItems: 0,
      isCompleted: false,
    };

    await shoppingListRef.set(newListData);

    res.status(201).json({ message: "Shopping list created successfully", list: newListData });

  } catch (error) {
    console.error("Error generating shopping list from recipe:", error);
    res.status(500).json({ error: "Failed to generate shopping list." });
  }
};