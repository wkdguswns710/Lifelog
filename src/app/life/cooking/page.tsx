import PageHeader from "@/components/PageHeader";

export default function CookingPage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <PageHeader title="요리" description="요리 관련 기록을 관리합니다." />
      프렌치토스트
      <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-text-tertiary">
        아직 준비 중이에요.
      </div>
    </div>
  );
}
