"use client";

import * as React from "react";

import {
    SimpleKitModal,
    SimpleKitModalBody,
    SimpleKitModalContent,
    SimpleKitModalDescription,
    SimpleKitModalFooter,
    SimpleKitModalHeader,
    SimpleKitModalTitle,
} from "@/components/simplekit-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    type Connector,
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
    useBalance,
} from "wagmi";
import { formatEther } from "viem";
import { Check, ChevronLeft, Copy, RotateCcw } from "lucide-react";

const MODAL_CLOSE_DURATION = 320;
const RECENT_CONNECTOR_KEY = "simplekit-recent-connector";

const SimpleKitContext = React.createContext<{
    pendingConnector: Connector | null;
    setPendingConnector: React.Dispatch<React.SetStateAction<Connector | null>>;
    isConnectorError: boolean;
    setIsConnectorError: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    recentConnectorId: string | null;
    setRecentConnectorId: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    pendingConnector: null,
    setPendingConnector: () => null,
    isConnectorError: false,
    setIsConnectorError: () => false,
    open: false,
    setOpen: () => false,
    recentConnectorId: null,
    setRecentConnectorId: () => null,
});

function SimpleKitProvider(props: { children: React.ReactNode }) {
    const { status, address, connector } = useAccount();
    const [pendingConnector, setPendingConnector] =
        React.useState<Connector | null>(null);
    const [isConnectorError, setIsConnectorError] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [recentConnectorId, setRecentConnectorId] = React.useState<string | null>(
        () => {
            if (typeof window !== "undefined") {
                return localStorage.getItem(RECENT_CONNECTOR_KEY);
            }
            return null;
        }
    );
    const isConnected = address && !pendingConnector;

    React.useEffect(() => {
        if (status === "connected" && pendingConnector) {
            setOpen(false);

            // Save the recent connector to localStorage
            if (pendingConnector.id) {
                localStorage.setItem(RECENT_CONNECTOR_KEY, pendingConnector.id);
                setRecentConnectorId(pendingConnector.id);
            }

            const timeout = setTimeout(() => {
                setPendingConnector(null);
                setIsConnectorError(false);
            }, MODAL_CLOSE_DURATION);

            return () => clearTimeout(timeout);
        }
    }, [status, setOpen, pendingConnector, setPendingConnector]);

    // Update recent connector when already connected (on page load)
    React.useEffect(() => {
        if (status === "connected" && connector?.id && !pendingConnector) {
            localStorage.setItem(RECENT_CONNECTOR_KEY, connector.id);
            setRecentConnectorId(connector.id);
        }
    }, [status, connector, pendingConnector]);

    return (
        <SimpleKitContext.Provider
            value={{
                pendingConnector,
                setPendingConnector,
                isConnectorError,
                setIsConnectorError,
                open,
                setOpen,
                recentConnectorId,
                setRecentConnectorId,
            }}
        >
            {props.children}
            <SimpleKitModal open={open} onOpenChange={setOpen}>
                <SimpleKitModalContent>
                    {isConnected ? <Account /> : <Connectors />}
                </SimpleKitModalContent>
            </SimpleKitModal>
        </SimpleKitContext.Provider>
    );
}

function ConnectWalletButton() {
    const simplekit = useSimpleKit();
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

    return (
        <Button onClick={simplekit.toggleModal} className="rounded-xl">
            {simplekit.isConnected ? (
                <>
                    {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
                    {address && (
                        <span>{ensName ? `${ensName}` : simplekit.formattedAddress}</span>
                    )}
                </>
            ) : (
                "Connect Wallet"
            )}
        </Button>
    );
}

function Account() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address });
    const { data: userBalance } = useBalance({ address });
    const context = React.useContext(SimpleKitContext);

    const formattedAddress = address?.slice(0, 6) + "•••" + address?.slice(-4);
    const formattedUserBalace = userBalance?.value
        ? parseFloat(formatEther(userBalance.value)).toFixed(4)
        : undefined;

    function handleDisconnect() {
        context.setOpen(false);
        setTimeout(() => {
            disconnect();
        }, MODAL_CLOSE_DURATION);
    }

    return (
        <>
            <SimpleKitModalHeader>
                <SimpleKitModalTitle>Connected</SimpleKitModalTitle>
                <SimpleKitModalDescription className="sr-only">
                    Account modal for your connected Web3 wallet.
                </SimpleKitModalDescription>
            </SimpleKitModalHeader>
            <SimpleKitModalBody className="h-[280px]">
                <div className="flex w-full flex-col items-center justify-center gap-8 md:pt-5">
                    <div className="size-24 flex items-center justify-center">
                        <img
                            className="rounded-full"
                            src={`https://avatar.vercel.sh/${address}?size=150`}
                            alt="User gradient avatar"
                        />
                    </div>

                    <div className="space-y-1 px-3.5 text-center sm:px-0">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-semibold">
                                <div>{ensName ? `${ensName}` : formattedAddress}</div>
                            </h1>
                            <CopyAddressButton />
                        </div>
                        <p className="text-balance text-sm text-muted-foreground">
                            {`${formattedUserBalace ?? "0.00"} ETH`}
                        </p>
                    </div>

                    <Button className="w-full rounded-xl" onClick={handleDisconnect}>
                        Disconnect
                    </Button>
                </div>
            </SimpleKitModalBody>
        </>
    );
}

function Connectors() {
    const context = React.useContext(SimpleKitContext);

    return (
        <>
            <SimpleKitModalHeader>
                <BackChevron />
                <SimpleKitModalTitle>
                    {context.pendingConnector?.name ?? "Connect Wallet"}
                </SimpleKitModalTitle>
                <SimpleKitModalDescription className="sr-only">
                    Connect your Web3 wallet or create a new one.
                </SimpleKitModalDescription>
            </SimpleKitModalHeader>
            <SimpleKitModalBody>
                {context.pendingConnector ? <WalletConnecting /> : <WalletOptions />}
            </SimpleKitModalBody>
            <SimpleKitModalFooter>
                <div className="h-0" />
            </SimpleKitModalFooter>
        </>
    );
}

function WalletConnecting() {
    const context = React.useContext(SimpleKitContext);

    return (
        <div className="flex w-full flex-col items-center justify-center gap-9 md:pt-5">
            {context.pendingConnector?.icon && (
                <div className="size-[116px] relative flex items-center justify-center rounded-2xl border p-3">
                    <img
                        src={context.pendingConnector?.icon}
                        alt={context.pendingConnector?.name}
                        className="size-full overflow-hidden rounded-2xl"
                    />
                    {context.isConnectorError ? <RetryConnectorButton /> : null}
                </div>
            )}

            <div className="space-y-3.5 px-3.5 text-center sm:px-0">
                <h1 className="text-xl font-semibold">
                    {context.isConnectorError ? "Request Error" : "Requesting Connection"}
                </h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {context.isConnectorError
                        ? "There was an error with the request. Click above to try again."
                        : `Open the ${context.pendingConnector?.name} browser extension to connect your wallet.`}
                </p>
            </div>
        </div>
    );
}

function WalletOptions() {
    const context = React.useContext(SimpleKitContext);
    const { connectors, connect } = useConnectors();

    return (
        <div className="flex flex-col gap-3.5">
            {connectors.map((connector) => (
                <WalletOption
                    key={connector.uid}
                    connector={connector}
                    onClick={() => {
                        context.setIsConnectorError(false);
                        context.setPendingConnector(connector);
                        connect({ connector });
                    }}
                />
            ))}
        </div>
    );
}

function WalletOption(props: { connector: Connector; onClick: () => void }) {
    const context = React.useContext(SimpleKitContext);
    const [ready, setReady] = React.useState(false);
    const [isDetected, setIsDetected] = React.useState(false);
    const isRecent = context.recentConnectorId === props.connector.id;

    React.useEffect(() => {
        async function checkReady() {
            const provider = await props.connector.getProvider();
            setReady(!!provider);

            // Only show badge for injected wallets (MetaMask, browser extensions)
            // Don't show for WalletConnect, Coinbase SDK, etc.
            const isInjectedWallet =
                props.connector.id === "metaMask" ||
                props.connector.id === "metaMaskSDK" ||
                props.connector.id === "injected" ||
                props.connector.id.startsWith("io.metamask") ||
                props.connector.type === "injected";

            setIsDetected(!!provider && isInjectedWallet);
        }
        checkReady()
            .then(() => null)
            .catch(() => null);
    }, [props.connector]);

    return (
        <Button
            disabled={!ready}
            onClick={props.onClick}
            size="lg"
            variant="secondary"
            className="justify-between rounded-xl px-4 py-7 text-base font-semibold"
        >
            <div className="flex items-center gap-2">
                <p>{props.connector.name}</p>
                {isRecent && (
                    <Badge variant="outline" className="text-xs">
                        Recent
                    </Badge>
                )}
            </div>
            {props.connector.icon && (
                <div className="relative">
                    <img
                        src={props.connector.icon}
                        alt={props.connector.name}
                        className="size-8 overflow-hidden rounded-[6px]"
                    />
                    {isDetected && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-secondary" />
                    )}
                </div>
            )}
        </Button>
    );
}

function CopyAddressButton() {
    const { address } = useAccount();
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (copied) setCopied(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [copied, setCopied]);

    async function handleCopy() {
        setCopied(true);
        await navigator.clipboard.writeText(address!);
    }

    return (
        <button className="text-muted-foreground" onClick={handleCopy}>
            {copied ? (
                <Check className="size-4" strokeWidth={4} />
            ) : (
                <Copy className="size-4" strokeWidth={4} />
            )}
        </button>
    );
}

function BackChevron() {
    const context = React.useContext(SimpleKitContext);

    if (!context.pendingConnector) {
        return null;
    }

    function handleClick() {
        context.setIsConnectorError(false);
        context.setPendingConnector(null);
    }

    return (
        <button
            className="absolute left-[26px] top-[42px] z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground md:top-[26px]"
            onClick={handleClick}
        >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Cancel connection</span>
        </button>
    );
}

function RetryConnectorButton() {
    const context = React.useContext(SimpleKitContext);
    const { connect } = useConnect({
        mutation: {
            onError: () => context.setIsConnectorError(true),
        },
    });

    function handleClick() {
        if (context.pendingConnector) {
            context.setIsConnectorError(false);
            connect({ connector: context.pendingConnector });
        }
    }

    return (
        <Button
            size="icon"
            variant="secondary"
            className="group absolute -bottom-2 -right-2 rounded-full bg-muted p-1.5 shadow"
            onClick={handleClick}
        >
            <RotateCcw className="size-4 transition-transform group-hover:-rotate-45" />
        </Button>
    );
}

function useConnectors() {
    const context = React.useContext(SimpleKitContext);
    const { connect, connectors } = useConnect({
        mutation: {
            onError: () => context.setIsConnectorError(true),
        },
    });

    const sortedConnectors = React.useMemo(() => {
        let metaMaskConnector: Connector | undefined;
        let injectedConnector: Connector | undefined;
        let baseAccountConnector: Connector | undefined;
        let walletConnectConnector: Connector | undefined;

        const formattedConnectors = connectors.reduce(
            (acc: Array<Connector>, curr) => {
                console.log(curr.id);
                switch (curr.id) {
                    case "metaMaskSDK":
                        metaMaskConnector = {
                            ...curr,
                            icon: "https://utfs.io/f/be0bd88f-ce87-4cbc-b2e5-c578fa866173-sq4a0b.png",
                        };
                        return acc;
                    case "metaMask":
                        injectedConnector = {
                            ...curr,
                            icon: "https://utfs.io/f/be0bd88f-ce87-4cbc-b2e5-c578fa866173-sq4a0b.png",
                        };
                        return acc;
                    case "coinbaseWalletSDK":
                        acc.push({
                            ...curr,
                            icon: "https://utfs.io/f/53e47f86-5f12-404f-a98b-19dc7b760333-chngxw.png",
                        });
                        return acc;
                    case "injected":
                        // Skip generic injected connector
                        return acc;
                    case "baseAccount":
                        // Keep Base Account separate to add it second to last
                        baseAccountConnector = {
                            ...curr,
                            icon: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
                        };
                        return acc;
                    case "safe":
                        acc.push({
                            ...curr,
                            icon: "https://utfs.io/f/164ea200-3e15-4a9b-9ce5-a397894c442a-awpd29.png",
                        });
                        return acc;
                    case "walletConnect":
                        // Keep WalletConnect separate to add it last
                        walletConnectConnector = {
                            ...curr,
                            icon: "https://utfs.io/f/5bfaa4d1-b872-48a7-9d37-c2517d4fc07a-utlf4g.png",
                        };
                        return acc;
                    case "com.coinbase.wallet":
                        acc.push({
                            ...curr,
                            icon: "https://utfs.io/f/53e47f86-5f12-404f-a98b-19dc7b760333-chngxw.png",
                        });
                        return acc;
                    default:
                        acc.unshift(curr);
                        return acc;
                }
            },
            [],
        );

        let finalConnectors: Connector[] = [];

        if (
            metaMaskConnector &&
            !formattedConnectors.find(
                ({ id }) =>
                    id === "io.metamask" ||
                    id === "io.metamask.mobile" ||
                    id === "injected",
            )
        ) {
            finalConnectors = [metaMaskConnector, ...formattedConnectors];
        } else if (injectedConnector) {
            const nonMetaMaskConnectors = formattedConnectors.filter(
                ({ id }) => id !== "io.metamask" && id !== "io.metamask.mobile",
            );
            finalConnectors = [injectedConnector, ...nonMetaMaskConnectors];
        } else {
            finalConnectors = formattedConnectors;
        }

        // Add Base Account second to last
        if (baseAccountConnector) {
            finalConnectors.push(baseAccountConnector);
        }

        // Always add WalletConnect last
        if (walletConnectConnector) {
            finalConnectors.push(walletConnectConnector);
        }

        return finalConnectors;
    }, [connectors]);

    return { connectors: sortedConnectors, connect };
}

/*
 * This hook can be moved to a separate file
 * if desired (src/hooks/use-simple-kit.tsx).
 */
function useSimpleKit() {
    const { address } = useAccount();
    const context = React.useContext(SimpleKitContext);

    const isModalOpen = context.open;
    const isConnected = address && !context.pendingConnector;
    const formattedAddress = address?.slice(0, 6) + "•••" + address?.slice(-4);

    function open() {
        context.setOpen(true);
    }

    function close() {
        context.setOpen(false);
    }

    function toggleModal() {
        context.setOpen((prevState) => !prevState);
    }

    return {
        isModalOpen,
        isConnected,
        formattedAddress,
        open,
        close,
        toggleModal,
    };
}

export {
    SimpleKitProvider,
    ConnectWalletButton,
    useSimpleKit,
    SimpleKitContext,
};