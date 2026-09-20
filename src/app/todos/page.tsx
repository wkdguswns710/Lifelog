import PageHeader from "@/components/PageHeader";
import TodoApp from "@/components/todos/TodoApp";

export default function TodosPage() {
  return (
    <div className="mx-auto max-w-[1383px]">
      <PageHeader title="할 일" description="오늘/최근 해야 할 일을 관리합니다." />
      <TodoApp />
    </div>
  );
}
