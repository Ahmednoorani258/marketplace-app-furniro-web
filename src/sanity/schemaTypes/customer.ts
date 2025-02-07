import { defineField, defineType } from "sanity";

export const customer = defineType({
  name: "customer",
  type: "document",
  title: "Customer",
  fields: [
    defineField({ name: "name", type: "string", title: "Full Name", validation: (Rule) => Rule.required() }),
    defineField({ name: "email", type: "string", title: "Email", validation: (Rule) => Rule.required().email() }),
    defineField({ name: "phoneNumber", type: "string", title: "Phone Number", validation: (Rule) => Rule.required() }),
    defineField({ name: "address", type: "string", title: "Address", validation: (Rule) => Rule.required() }),
    defineField({ name: "city", type: "string", title: "City", validation: (Rule) => Rule.required() }),
    defineField({ name: "zipCode", type: "string", title: "ZIP Code", validation: (Rule) => Rule.required() }),
    defineField({ name: "companyName", type: "string", title: "Company Name", description: "Optional - Add a company name if applicable." }),
    defineField({ name: "country", type: "string", title: "Country", validation: (Rule) => Rule.required() }),
    defineField({
      name: "orders",
      title: "Orders",
      type: "array",
      of: [{ type: "reference", to: [{ type: "order" }] }], // Keep it simple, Sanity will handle _key
    }),
  ],
});
