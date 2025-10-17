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
import { ScrollArea } from "@/components/ui/scroll-area";

interface BaseProps {
    children: React.ReactNode;
}

interface RootSimpleKitModalProps extends BaseProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface SimpleKitModalProps extends BaseProps {
    className?: string;
    asChild?: true;
}

const desktop = "(min-width: 768px)";

const SimpleKitModal = ({ children, ...props }: RootSimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModal = isDesktop ? Dialog : Drawer;

    return <SimpleKitModal {...props}>{children}</SimpleKitModal>;
};

const SimpleKitModalTrigger = ({
                                   className,
                                   children,
                                   ...props
                               }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

    return (
        <SimpleKitModalTrigger className={className} {...props}>
            {children}
        </SimpleKitModalTrigger>
    );
};

const SimpleKitModalClose = ({
                                 className,
                                 children,
                                 ...props
                             }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalClose = isDesktop ? DialogClose : DrawerClose;

    return (
        <SimpleKitModalClose className={className} {...props}>
            {children}
        </SimpleKitModalClose>
    );
};

const SimpleKitModalContent = ({
                                   className,
                                   children,
                                   ...props
                               }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalContent = isDesktop ? DialogContent : DrawerContent;

    return (
        <SimpleKitModalContent
            className={cn(
                "md:max-w-[360px] [&>button]:right-[26px] [&>button]:top-[26px]",
                className,
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            {...props}
        >
            {children}
        </SimpleKitModalContent>
    );
};

const SimpleKitModalDescription = ({
                                       className,
                                       children,
                                       ...props
                                   }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalDescription = isDesktop
        ? DialogDescription
        : DrawerDescription;

    return (
        <SimpleKitModalDescription className={className} {...props}>
            {children}
        </SimpleKitModalDescription>
    );
};

const SimpleKitModalHeader = ({
                                  className,
                                  children,
                                  ...props
                              }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalHeader = isDesktop ? DialogHeader : DrawerHeader;

    return (
        <SimpleKitModalHeader
            className={cn("space-y-0 pb-6 md:pb-3", className)}
            {...props}
        >
            {children}
        </SimpleKitModalHeader>
    );
};

const SimpleKitModalTitle = ({
                                 className,
                                 children,
                                 ...props
                             }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalTitle = isDesktop ? DialogTitle : DrawerTitle;

    return (
        <SimpleKitModalTitle className={cn("text-center", className)} {...props}>
            {children}
        </SimpleKitModalTitle>
    );
};

const SimpleKitModalBody = ({
                                className,
                                children,
                                ...props
                            }: SimpleKitModalProps) => {
    return (
        <div
            className={cn(
                "px-6 md:px-0",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const SimpleKitModalFooter = ({
                                  className,
                                  children,
                                  ...props
                              }: SimpleKitModalProps) => {
    const isDesktop = useMediaQuery(desktop);
    const SimpleKitModalFooter = isDesktop ? DialogFooter : DrawerFooter;

    return (
        <SimpleKitModalFooter
            className={cn("py-3.5 md:py-0", className)}
            {...props}
        >
            {children}
        </SimpleKitModalFooter>
    );
};

export {
    SimpleKitModal,
    SimpleKitModalTrigger,
    SimpleKitModalClose,
    SimpleKitModalContent,
    SimpleKitModalDescription,
    SimpleKitModalHeader,
    SimpleKitModalTitle,
    SimpleKitModalBody,
    SimpleKitModalFooter,
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