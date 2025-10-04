const { db } = require("../services/firebase");
const admin = require("firebase-admin");

/**
 * Helper: Get Firestore collection reference for a user’s location
 */
function getCollectionRef(userId, location) {
  const loc = location.toLowerCase(); // "pantry" | "fridge" | "freezer"
  return db.collection("pantry").doc(userId).collection(loc);
}

/**
 * Add a new pantry item
 * POST /api/pantry
 */
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.uid; // set by verifyToken middleware
    const {
      title,
      description,
      imageUrl,
      expiryDate,
      quantity,
      category,
      location,
    } = req.body;

    if (!title || !quantity || !category || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItemRef = getCollectionRef(userId, location).doc();

    const itemData = {
      id: newItemRef.id,
      title,
      description: description || "",
      imageUrl: imageUrl || "", // Supabase URL provided by client
      expiryDate: expiryDate || null,
      quantity: Number(quantity),
      category,
      location,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newItemRef.set(itemData);

    res.status(201).json({
      message: "Item added successfully",
      item: itemData,
    });
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

    const locations = ["pantry", "fridge", "freezer"];
    const results = {};

    for (const loc of locations) {
      const snapshot = await db
        .collection("pantry")
        .doc(userId)
        .collection(loc)
        .orderBy("addedAt", "desc")
        .get();

      results[loc] = snapshot.docs.map((doc) => doc.data());
    }

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

    const locations = ["pantry", "fridge", "freezer"];
    for (const loc of locations) {
      const docRef = db
        .collection("pantry")
        .doc(userId)
        .collection(loc)
        .doc(id);

      const doc = await docRef.get();
      if (doc.exists) {
        return res.status(200).json(doc.data());
      }
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

    const locations = ["pantry", "fridge", "freezer"];
    let updated = false;

    for (const loc of locations) {
      const itemRef = db
        .collection("pantry")
        .doc(userId)
        .collection(loc)
        .doc(id);

      const doc = await itemRef.get();
      if (doc.exists) {
        await itemRef.update({
          ...updateData,
          last_updated: admin.firestore.FieldValue.serverTimestamp(),
        });
        updated = true;
        break;
      }
    }

    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }

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

    const locations = ["pantry", "fridge", "freezer"];
    let deleted = false;

    for (const loc of locations) {
      const itemRef = db
        .collection("pantry")
        .doc(userId)
        .collection(loc)
        .doc(id);

      const doc = await itemRef.get();
      if (doc.exists) {
        await itemRef.delete();
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ error: "Failed to delete pantry item" });
  }
};
