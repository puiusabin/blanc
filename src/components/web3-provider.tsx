"use client";

// 1. Import modules
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, State } from "wagmi";
import { getConfig } from "@/lib/wagmi";
import { SimpleKitProvider } from "@/components/simplekit";

// 2. Define your Wagmi config
const config = getConfig();

// 3. Initialize your new QueryClient
const queryClient = new QueryClient();

// 4. Create your Wagmi provider
export function Web3Provider(props: {
    initialState: State | undefined;
    children: React.ReactNode;
}) {
    return (
        <WagmiProvider config={config} initialState={props.initialState}>
            <QueryClientProvider client={queryClient}>
                <SimpleKitProvider>{props.children}</SimpleKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}