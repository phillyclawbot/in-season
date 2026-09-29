import type { Metadata } from "next";
import GroceryApp from "@/components/grocery/GroceryApp";

export const metadata: Metadata = {
  title: "Grocery List — In Season",
  description: "A shared grocery list for two, sorted by aisle, with this week's local sales.",
};

export default function GroceryPage() {
  return <GroceryApp />;
}
