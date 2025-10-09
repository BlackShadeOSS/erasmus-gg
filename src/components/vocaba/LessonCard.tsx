import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "./ProgressBar";

interface LessonCardProps {
  title: string;
  progress: number;
}

export default function LessonCard({ title, progress }: LessonCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-green-700">{title}</h3>
          <ProgressBar progress={progress} />
          <p className="text-sm text-gray-500 mt-1">
            {progress}% completed
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
