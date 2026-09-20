import PageHeader from "@/components/PageHeader";
import AssetsTabs from "@/components/assets/AssetsTabs";

export default function AssetsStatsPage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <AssetsTabs />
      <PageHeader title="통계" description="수입·지출 흐름을 한눈에 봅니다." />
      <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-text-tertiary">
        아직 준비 중이에요. 곧 월별·분류별 통계 차트가 들어갈 자리입니다.
      </div>
    </div>
  );
}
