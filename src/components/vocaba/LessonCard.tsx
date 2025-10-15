import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface LessonCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function LessonCard({
  title,
  description,
  selected = false,
  onClick,
}: LessonCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`transition-all cursor-pointer ${selected ? "ring-2 ring-amber-500 rounded-2xl" : ""
        }`}
      onClick={onClick}
    >
      <Card
        className={`rounded-2xl shadow-sm hover:shadow-md transition ${selected ? "border border-amber-500" : "border border-transparent"
          }`}
      >
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 text-green-700">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 leading-snug">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}