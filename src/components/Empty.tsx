import { cn } from "@/lib/utils";

interface EmptyProps {
  message?: string;
  icon?: string;
}

// Empty component for displaying empty states
export function Empty({ message = "暂无数据", icon = "fa-file-alt" }: EmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full text-gray-500 p-6")}>
      <i className={`fa-regular ${icon} text-5xl mb-4 text-gray-300`}></i>
      <p className="text-lg">{message}</p>
    </div>
  );
}