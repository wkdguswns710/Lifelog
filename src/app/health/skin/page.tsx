import PageHeader from "@/components/PageHeader";

export default function SkinPage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <PageHeader title="피부" description="피부 관리 기록을 관리합니다." />
      아랫목제모 얼굴제모 겨드제모 브라질제모 치아미백
      <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-text-tertiary">
        아직 준비 중이에요.
      </div>
    </div>
  );
}
