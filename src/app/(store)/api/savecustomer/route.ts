import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const orderPayload = await req.json();
    console.log("Received order payload:", orderPayload);

    const { addCart, billingDetails, paymentMethod } = orderPayload;

    if (
      !billingDetails ||
      !billingDetails.email ||
      !addCart ||
      !Array.isArray(addCart) ||
      addCart.length === 0
    ) {
      console.error("Missing order or billing details");
      return NextResponse.json(
        { error: "Missing order or billing details." },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      phone,
      country,
      streetAddress,
      city,
      zipCode,
      province,
      companyName,
    } = billingDetails;

    // Check if customer exists using email as unique identifier
    const customerQuery = `*[_type == "customer" && email == $email][0]`;
    let customer = await client.fetch(customerQuery, { email });
    console.log("Existing customer:", customer);

    if (!customer) {
      customer = await client.create({
        _type: "customer",
        name: fullName,
        email,
        phoneNumber: phone,
        address: streetAddress,
        city,
        zipCode,
        province,
        companyName: companyName || "",
        country,
        orders: [],
      });
      console.log("Created new customer:", customer);
    }

    const totalAmount = addCart.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const deliveryAddress = `${streetAddress}, ${city}, ${province}, ${zipCode}, ${country}`;

    // Transform addCart items using `id` instead of `_id`
    const products = addCart
      .filter((item: any) => {
        if (!item.id) {
          console.warn("Warning: Product is missing id", item);
          return false;
        }
        return true;
      })
      .map((item: any) => ({
        _key: nanoid(),
        product: { _type: "reference", _ref: item.id },
        quantity: item.quantity,
      }));

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No valid products found in order." },
        { status: 400 }
      );
    }
    console.log("Processed products array:", products);

    const orderDoc = {
      _type: "order",
      customer: { _type: "reference", _ref: customer._id },
      products,
      orderStatus: "pending",
      paymentMethod: paymentMethod === "card" ? "online" : "cod",
      deliveryAddress,
      orderDate: new Date().toISOString(),
      totalAmount,
    };
    console.log("Final order document:", orderDoc);

    const createdOrder = await client.create(orderDoc);
    console.log("Created order:", createdOrder);

    await client
      .patch(customer._id)
      .setIfMissing({ orders: [] })
      .append("orders", [
        { _key: nanoid(), _type: "reference", _ref: createdOrder._id },
      ])
      .commit();

    return NextResponse.json(
      { url: "/success", orderId: createdOrder._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Order processing failed." },
      { status: 500 }
    );
  }
}
