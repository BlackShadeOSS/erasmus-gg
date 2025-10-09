interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-green-200 h-3 rounded-full overflow-hidden">
      <div
        className="bg-green-600 h-full transition-all duration-500"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
