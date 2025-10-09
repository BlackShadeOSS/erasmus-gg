import { Flame } from "lucide-react";

interface XPBadgeProps {
  xp: number;
  streak: number;
}

export default function XPBadge({ xp, streak }: XPBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-green-100 px-4 py-2 rounded-full shadow-sm">
      <span className="font-semibold text-green-700">{xp} XP</span>
      <div className="flex items-center gap-1 text-orange-500 font-medium">
        <Flame size={18} />
        {streak}
      </div>
    </div>
  );
}
