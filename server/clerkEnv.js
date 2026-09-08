const PUBLIC_CLERK_KEY =
  'pk_test_ZXZvbHZpbmctc2FpbGZpc2gtNTUwMS5jbGVyay5hY2NvdW50cy5kZXYk'

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY =
    process.env.VITE_CLERK_PUBLISHABLE_KEY || PUBLIC_CLERK_KEY
}
