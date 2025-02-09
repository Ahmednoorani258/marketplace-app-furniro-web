import { defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  type: "document",
  title: "Order",
  fields: [
    defineField({ name: "customer", type: "reference", title: "Customer", to: [{ type: "customer" }], validation: (Rule) => Rule.required() }),
    defineField({
      name: "products",
      type: "array",
      title: "Products",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "product", type: "reference", title: "Product", to: [{ type: "product" }], validation: (Rule) => Rule.required() }),
            defineField({ name: "quantity", type: "number", title: "Quantity", validation: (Rule) => Rule.required().min(1) }),
          ],
          preview: {
            select: {
              title: "product.name",
              quantity: "quantity",
            },
            prepare(selection) {
              const { title, quantity } = selection;
              return {
                title: title || "Unknown Product",
                subtitle: `Quantity: ${quantity || 0}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "orderStatus",
      type: "string",
      title: "Order Status",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "dropdown",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "paymentMethod",
      type: "string",
      title: "Payment Method",
      options: {
        list: [
          { title: "Cash on Delivery (COD)", value: "cod" },
          { title: "Online", value: "online" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "deliveryAddress", type: "string", title: "Delivery Address", validation: (Rule) => Rule.required() }),
    defineField({ name: "orderDate", type: "datetime", title: "Order Date", validation: (Rule) => Rule.required(), initialValue: () => new Date().toISOString() }),
    defineField({ name: "totalAmount", type: "number", title: "Total Amount", validation: (Rule) => Rule.required().min(0) }),
  ],
  preview: {
    select: {
      customer: "customer.name",
      status: "orderStatus",
      amount: "totalAmount",
    },
    prepare(selection) {
      const { customer, status, amount } = selection;
      return {
        title: customer || "Unknown Customer",
        subtitle: `Status: ${status || "Unknown"} | Total: $${amount || 0}`,
      };
    },
  },
});
