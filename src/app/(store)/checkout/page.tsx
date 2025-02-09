"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Service from "@/components/Service";
import BreadCrumb from "@/components/BreadCrumb";

export type FormData = {
  fullName: string;
  companyName?: string;
  country: string;
  streetAddress: string;
  city: string;
  province?: string;
  zipCode: string;
  phone: string;
  email: string;
  paymentMethod: "card" | "cod";
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckOut() {
  const { items } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      paymentMethod: "cod", // default payment method
    },
  });

  // Watch the payment method field to conditionally render the button text
  const selectedPaymentMethod = watch("paymentMethod", "cod");

  // Calculate subtotal
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    const orderPayload = {
      addCart: items,
      billingDetails: {
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        streetAddress: data.streetAddress,
        city: data.city,
        zipCode: data.zipCode,
        phone: data.phone,
      },
      paymentMethod: data.paymentMethod,
    };

    try {
      const res = await fetch("/api/savecustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });


      const result = await res.json();
      console.log("Data saved succefully", result);
    } catch (error) {
      console.error("Error sending order to sanity", error);
    }

    if(orderPayload.addCart.length === 0){
      alert("Cart is empty");
      setTimeout(() => {
        router.push("/shop");
      }, 1000);

    }else{
      if (data.paymentMethod === "card") {
        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          });
  
          const result = await res.json();
  
          if (result.url) {
            // Redirect to Stripe Checkout
            window.location.href = result.url;
          } else {
            console.error("Failed to create Stripe session", result.error);
          }
        } catch (error) {
          console.error("Error creating checkout session", error);
        }
      } else {
        // Handle COD order: process order, clear cart, redirect to thank-you page
        router.push("/success");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <BreadCrumb title="Checkout" url="/checkout" />
      <div className="w-full p-4">
        {/* Responsive Grid: form on left, summary on right for large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Checkout Form */}
          <div className="bg-white p-8 rounded shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("fullName", {
                    required: "Full Name is required",
                    minLength: {
                      value: 3,
                      message: "Full Name must be at least 3 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Full Name cannot be longer than 50 characters",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <input
                  type="text"
                  placeholder="Company Name (Optional)"
                  {...register("companyName", {
                    maxLength: {
                      value: 100,
                      message:
                        "Company Name cannot be longer than 100 characters",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
              </div>

              {/* Country */}
              <div>
                <select
                  {...register("country", { required: "Country is required" })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                >
                  <option value="">Country / Region</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <input
                  type="text"
                  placeholder="Street Address"
                  {...register("streetAddress", {
                    required: "Street Address is required",
                    minLength: {
                      value: 5,
                      message: "Street Address must be at least 5 characters",
                    },
                    maxLength: {
                      value: 150,
                      message:
                        "Street Address cannot be longer than 150 characters",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.streetAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.streetAddress.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <input
                  type="text"
                  placeholder="City"
                  {...register("city", { required: "City is required" })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  {...register("zipCode", {
                    required: "ZIP Code is required",
                    pattern: {
                      value: /^[0-9]{5,6}$/,
                      message: "Invalid ZIP Code format",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: "Phone must be a 11-digit number",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format",
                    },
                  })}
                  className="w-full border border-gray-300 rounded p-5 focus:outline-none focus:ring-2 focus:ring-darkyellow"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Payment Options */}
              <div className="mt-4">
                <label className="flex items-center text-gray-700 mb-2">
                  <input
                    type="radio"
                    value="card"
                    {...register("paymentMethod", {
                      required: "Please select a payment method",
                    })}
                    className="mr-2"
                  />
                  Card Payment
                </label>
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    value="cod"
                    {...register("paymentMethod", {
                      required: "Please select a payment method",
                    })}
                    className="mr-2"
                  />
                  Cash on Delivery
                </label>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>

              {/* Payment Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lightyellow hover:bg-darkyellow text-black py-3 rounded shadow font-bold transition duration-300"
                >
                  {loading
                    ? "Processing..."
                    : selectedPaymentMethod === "card"
                      ? "Proceed to Payment"
                      : "Place Order"}
                </button>
              </div>
            </form>
          </div>

          {/* Product Summary */}
          <div className="bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-darkyellow">
              Order Summary
            </h2>
            {items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-4">
                  <p className="font-bold text-xl text-darkyellow">Subtotal</p>
                  <p className="font-bold text-xl">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Service />
    </div>
  );
}
