import PageHeader from "@/components/PageHeader";

export default function DevlogPage() {
  return (
    <div>
      <PageHeader title="개발노트" description="공부한 개발 정보를 기록합니다." />
      <div className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-foreground/50 dark:border-white/15">
        아직 준비 중이에요. 곧 마크다운 글 목록과 에디터가 들어갈 자리입니다.
      </div>
    </div>
  );
}
