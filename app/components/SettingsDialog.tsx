"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export default function SettingsDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="mr-2">⚙️</Button>
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <div className="text-sm font-medium">Language</div>
              <LocaleSwitcher />
            </div>
            <div>
              <div className="text-sm font-medium">Theme</div>
              <ThemeToggle />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
