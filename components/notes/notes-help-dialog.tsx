"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HELP_CONTENT = {
  creating:
    "Click the Create note button to start a new log entry. Rate palms, feet, underarms, and face, or add up to five custom areas such as your scalp, neck, back, chest, or groin. Each custom area receives its own color and 0–10 severity score, and appears in your saved log and progress chart.",
  deleting:
    "When editing a log, use the delete button in the top right corner to permanently remove it. You’ll be asked to confirm before it’s deleted.",
  autoSave:
    "Your log is saved automatically as you type. No need to click save — just fill in the form and your changes are stored after a short pause.",
  customAreas:
    "You can keep up to five custom body parts active at once. Each keeps the same color and appears automatically in future logs. Removing one permanently removes that body part and all of its recorded history from every log and chart.",
};

export function NotesHelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Help with notes"
        >
          <HelpCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to use your sweat log</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="mb-1 font-medium text-foreground">Creating a note</h4>
            <p>{HELP_CONTENT.creating}</p>
          </div>
          <div>
            <h4 className="mb-1 font-medium text-foreground">Deleting a note</h4>
            <p>{HELP_CONTENT.deleting}</p>
          </div>
          <div>
            <h4 className="mb-1 font-medium text-foreground">Auto-save</h4>
            <p>{HELP_CONTENT.autoSave}</p>
          </div>
          <div>
            <h4 className="mb-1 font-medium text-foreground">Custom body parts and history</h4>
            <p>{HELP_CONTENT.customAreas}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
