import { http, HttpResponse } from "msw"

const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
const mockChainId = "0x1"

export const web3Handlers = [
  http.post("https://mainnet.infura.io/*", async ({ request }) => {
    const body: any = await request.json()

    switch (body.method) {
      case "eth_chainId":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: mockChainId,
        })

      case "eth_accounts":
      case "eth_requestAccounts":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: [mockAddress],
        })

      case "eth_getBalance":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x1bc16d674ec80000",
        })

      case "eth_blockNumber":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x1234567",
        })

      case "eth_getTransactionCount":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x1",
        })

      case "eth_estimateGas":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x5208",
        })

      case "eth_gasPrice":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x3b9aca00",
        })

      case "eth_sendTransaction":
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: "0x" + "0".repeat(63) + "1",
        })

      default:
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32601,
            message: "Method not found",
          },
        })
    }
  }),

  http.post("https://sepolia.infura.io/*", async ({ request }) => {
    const body: any = await request.json()

    return HttpResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: "0xaa36a7",
    })
  }),
]
