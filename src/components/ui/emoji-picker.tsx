
import React from "react";
import { Card } from "@/components/ui/card";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const emojis = [
  "😊", "😃", "😂", "❤️", "👍", "🔥", "🎉", "✨", 
  "🤔", "😍", "🙌", "👏", "🤝", "👋", "🙏", "💯",
  "⭐", "💪", "🤞", "👌", "🎂", "🎁", "📷", "😎",
  "👨‍💻", "👩‍💻", "💻", "📱", "📚", "🎯", "🚀", "💡"
];

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  return (
    <Card className={`p-2 ${className}`}>
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((emoji) => (
          <div
            key={emoji}
            className="text-2xl cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center justify-center"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </div>
        ))}
      </div>
    </Card>
  );
}
