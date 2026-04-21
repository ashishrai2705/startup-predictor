import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "startup-prediction"

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable")
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In dev, reuse the same connection across hot-reloads
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create a new connection per cold start
  const client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDb() {
  const client = await clientPromise
  return client.db(dbName)
}
