import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1c1b19]/28 data-[state=open]:animate-[fade_420ms_cubic-bezier(0.32,0.72,0,1)]" />
      <DialogPrimitive.Content
        className={cn(
          "apple-sheet fixed top-[8vh] left-1/2 z-50 max-h-[calc(100dvh-12vh)] w-[min(920px,calc(100%-2rem))] -translate-x-1/2 overflow-auto outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[17px] font-semibold tracking-[-0.02em] text-ink", className)}
      {...props}
    />
  );
}

const DialogClose = DialogPrimitive.Close;

export { Dialog, DialogClose, DialogContent, DialogTitle };
