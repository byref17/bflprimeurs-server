const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date },
        items: [
            {
                itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
                title: String,
                colisage: String,
                quantity: {
                    type: Number,
                    default: 1,
                },
                prix: {
                    type: String,
                },
            },
        ],
        status: { type: String, default: "pending" },
    },
    { timestamps: true }
);
const Order = model("Order", orderSchema);

module.exports = Order;
