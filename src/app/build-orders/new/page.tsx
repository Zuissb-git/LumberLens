import { OrderForm } from "@/components/build-orders/order-form";

export const metadata = {
  title: "New Build Order — LumberLens",
};

export default function NewBuildOrderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OrderForm />
    </div>
  );
}
