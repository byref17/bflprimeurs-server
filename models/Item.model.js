const { Schema, model } = require("mongoose");

const itemSchema = new Schema(
    {
        image: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },

        origin: {
            type: String,
            required: true,
        },
        family: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        colisage: {
            type: String,
            required: true,
        },
        prix: {
            type: String,
            required: true,
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

const Item = model("Item", itemSchema);

module.exports = Item;
