import BudgetApp from "@/components/budget/BudgetApp";
import AssetsTabs from "@/components/assets/AssetsTabs";

export default function AssetsBudgetPage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <AssetsTabs />
      <BudgetApp />
    </div>
  );
}
