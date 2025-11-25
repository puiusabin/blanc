"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface BaseProps {
  children: React.ReactNode;
}

interface RootWalletKitModalProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface WalletKitModalProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const desktop = "(min-width: 768px)";

const WalletKitModal = ({ children, ...props }: RootWalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModal = isDesktop ? Dialog : Drawer;

  return <WalletKitModal {...props}>{children}</WalletKitModal>;
};

const WalletKitModalTrigger = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <WalletKitModalTrigger className={className} {...props}>
      {children}
    </WalletKitModalTrigger>
  );
};

const WalletKitModalClose = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <WalletKitModalClose className={className} {...props}>
      {children}
    </WalletKitModalClose>
  );
};

const WalletKitModalContent = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalContent = isDesktop ? DialogContent : DrawerContent;

  if (isDesktop) {
    return (
      <WalletKitModalContent
        className={cn("md:max-w-[500px] p-0 gap-0 [&>button]:hidden", className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        {children}
      </WalletKitModalContent>
    );
  }

  return (
    <WalletKitModalContent
      className={cn("[&>button]:right-[26px] [&>button]:top-[26px] border-t", className)}
      onOpenAutoFocus={(e) => e.preventDefault()}
      {...props}
    >
      {children}
    </WalletKitModalContent>
  );
};

const WalletKitModalDescription = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <WalletKitModalDescription className={className} {...props}>
      {children}
    </WalletKitModalDescription>
  );
};

const WalletKitModalHeader = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <WalletKitModalHeader className={cn("space-y-0 pb-6 md:pb-4 md:px-6", className)} {...props}>
      {children}
    </WalletKitModalHeader>
  );
};

const WalletKitModalTitle = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <WalletKitModalTitle className={cn("text-center", className)} {...props}>
      {children}
    </WalletKitModalTitle>
  );
};

const WalletKitModalBody = ({ className, children, ...props }: WalletKitModalProps) => {
  return (
    <div className={cn("px-6 md:px-6", className)} {...props}>
      {children}
    </div>
  );
};

const WalletKitModalFooter = ({ className, children, ...props }: WalletKitModalProps) => {
  const isDesktop = useMediaQuery(desktop);
  const WalletKitModalFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <WalletKitModalFooter className={cn("py-3.5 md:py-0", className)} {...props}>
      {children}
    </WalletKitModalFooter>
  );
};

export {
  WalletKitModal,
  WalletKitModalTrigger,
  WalletKitModalClose,
  WalletKitModalContent,
  WalletKitModalDescription,
  WalletKitModalHeader,
  WalletKitModalTitle,
  WalletKitModalBody,
  WalletKitModalFooter,
};

/*
 * Hook used to calculate the width of the screen using the
 * MediaQueryListEvent. This can be moved to a separate file
 * if desired (src/hooks/use-media-query.tsx).
 */
export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}
