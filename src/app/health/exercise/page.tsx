import PageHeader from "@/components/PageHeader";

export default function ExercisePage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <PageHeader title="운동" description="운동 기록을 관리합니다." />
      푸쉬업 걷기 러닝복 러닝자세 러닝센터 사이클 수영
      스트레칭 바른자세 푸시업 코어 도수치료
      <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-sm text-text-tertiary">
        아직 준비 중이에요.
      </div>
    </div>
  );
}
