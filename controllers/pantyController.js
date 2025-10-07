const { db } = require("../services/firebase");
const admin = require("firebase-admin");

// Helper function is simpler now
function getItemsCollection(userId) {
  return db.collection("users").doc(userId).collection("pantryItems");
}

/**
 * Add a new pantry item
 * POST /api/pantry
 */
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, description, imageUrl, expiryDate, quantity, category, location } = req.body;

    if (!title || !quantity || !category || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const itemsCollection = getItemsCollection(userId);
    const newItemRef = itemsCollection.doc(); // Create a new document reference

    const itemData = {
      id: newItemRef.id,
      title,
      description: description || "",
      imageUrl: imageUrl || "",
      expiryDate: expiryDate || null,
      quantity: Number(quantity),
      category,
      location, // e.g., "FRIDGE", "FREEZER", "PANTRY"
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newItemRef.set(itemData);
    res.status(201).json(itemData); // Return the created item

  } catch (error) {
    console.error("Error adding pantry item:", error);
    res.status(500).json({ error: "Failed to add pantry item" });
  }
};

/**
 * Get all items for the authenticated user
 * GET /api/pantry
 */
exports.getAllItems = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await getItemsCollection(userId).orderBy("addedAt", "desc").get();
    const allItems = snapshot.docs.map((doc) => doc.data());

    // Group the items by location for the client
    const results = {
      pantry: allItems.filter(item => item.location === 'PANTRY'),
      fridge: allItems.filter(item => item.location === 'FRIDGE'),
      freezer: allItems.filter(item => item.location === 'FREEZER'),
    };

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    res.status(500).json({ error: "Failed to fetch pantry items" });
  }
};


/**
 * Get a single item by ID
 * GET /api/pantry/:id
 */
exports.getItemById = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { id } = req.params;

        const docRef = getItemsCollection(userId).doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            return res.status(200).json(doc.data());
        }

        res.status(404).json({ error: "Item not found" });
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ error: "Failed to fetch item" });
    }
};

/**
 * Update pantry item
 * PUT /api/pantry/:id
 */
exports.updateItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const updateData = req.body;

    const itemRef = getItemsCollection(userId).doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    await itemRef.update({
      ...updateData,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating pantry item:", error);
    res.status(500).json({ error: "Failed to update pantry item" });
  }
};

/**
 * Delete pantry item
 * DELETE /api/pantry/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const itemRef = getItemsCollection(userId).doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    await itemRef.delete();
    res.status(200).json({ message: "Item deleted successfully" });

  } catch (error) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ error: "Failed to delete pantry item" });
  }
};