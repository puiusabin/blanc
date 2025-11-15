import { authHandlers } from "./auth"
import { mailHandlers } from "./mail"
import { web3Handlers } from "./web3"

export const handlers = [...authHandlers, ...mailHandlers, ...web3Handlers]
