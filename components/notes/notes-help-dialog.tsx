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
    "Click the Create note button to start a new log entry. Fill in the date, rate your sweat severity for each area (palms, feet, underarms, face, other), answer the trigger and emotional impact questions, then add any extra notes.",
  deleting:
    "When editing a log, use the delete button in the top right corner to permanently remove it. You’ll be asked to confirm before it’s deleted.",
  autoSave:
    "Your log is saved automatically as you type. No need to click save — just fill in the form and your changes are stored after a short pause.",
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
