# Nurnrebel / XNX storefront and card club

The Next.js storefront and the Flutter application in `../admin_app` share one Firebase project. Products, category options, variant inventory, orders, profiles, subscribers, contact messages, published journal posts, music, lookbook entries, collections, settings, and online game rooms use the same document schemas.

## Local development

Run `npm ci`, then `npm run dev`. The Flutter admin uses `flutter pub get` and `flutter run -d chrome`. Server routes need Firebase Admin credentials or Application Default Credentials. Keep secrets out of source control.

The public Firebase variables are `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`. The admin Firebase options and server project must match the storefront project.

For a local service account, configure `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY`. On Firebase App Hosting, the runtime can use Application Default Credentials. Configure `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.

## Commerce

Admin products create one inventory row per variant. The storefront matches option values rather than JSON property order. Cart lines carry the variant key and SKU. Checkout reads current prices, images, names, weights, active state, and variant availability from Firestore.

Checkout atomically reserves available stock and increments reserved units before creating a Stripe payment URL. Payments settle the exact variant, increment sales, and create a customer-linked order once. Expired sessions restore stock once. Untracked variants still reserve their identity; backorders can record negative availability. Admin writes reject stale stock edits, protect pending reservations, and log changes atomically.

Configure `STRIPE_SECRET_KEY` on the site and functions, plus `STRIPE_WEBHOOK_SECRET` on functions. Register `stripeWebhook` with Stripe for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, and `checkout.session.async_payment_failed`. Deploy `cleanupCheckouts` to recover abandoned reservations and missed webhook deliveries. Checkout sessions expire after 30 minutes; recovery checks run every 30 minutes and process reservations older than an hour.

Deploy the rules and indexes from `firebase.json`. Admin authorization comes from `users/{uid}.role == admin`, with disabled accounts excluded. Bootstrap the first administrator through a trusted Firebase console or Admin SDK, never through a customer profile form. Customers can update profile fields but cannot change roles or award their own rewards.

Existing products with options but no variant inventory must be opened and saved in admin before purchase. Simple legacy products without options can use product-only inventory until migrated. Existing paid orders are retained. Pre-upgrade unpaid checkout sessions need to be expired before switching to the reservation-based webhook. Refunds and automatic shipping-label purchase are not implemented; changing fulfillment status does not issue a refund or purchase a label.

Shipping requires `SHIPPO_TOKEN` and `SHIP_FROM_*` address fields. Local delivery requires `GOOGLE_MAPS_SERVER_API_KEY`, the same origin address, and optionally `LOCAL_DELIVERY_BASE_FEE`, `LOCAL_DELIVERY_PER_MILE_FEE`, and `LOCAL_DELIVERY_MAX_MILES`. Shipping quote amounts, addresses, expiration and canonical cart weights are verified at checkout; delivery estimates are recalculated on the server. Enable only configured fulfillment methods in admin Store Settings.

Subscriber welcome messages and admin campaigns use the Firestore `mail` collection. Install and configure Firebase Trigger Email with an SMTP provider to deliver those queued messages. Public clients cannot write arbitrary outbound mail. Subscriber creation handles existing email records and queues each welcome message once.

## Content and management

Published `blogPosts`, active `lookbook` entries and `collections` appear on the storefront. Drafts remain private. Journal search and category filters work on live content. Collections contain product IDs and link to filtered shop views. Store Settings controls announcements, pickup instructions and fulfillment methods. Customer account order history updates when admin changes fulfillment status. Music's development preview override is restricted to development builds.

## Tonk and Spades

Both games support solo bots, local pass-and-play, online room codes, three bot difficulty levels, configurable house rules, match scoring, saved local games and pause/resume. Tonk calls the low-hand action **Drop** throughout the interface.

Classic and Hood Rules presets are available in Options. Hood Spades uses Joker-Joker-Deuce-Deuce, no nil, no bag penalty, and a four-book minimum team bid; each setting can be changed independently. The 2 of hearts is trump. Both decks contain exactly 52 cards.

Hood Tonk enables a ten-point drop ceiling, waiting after spreads and hits, opening 49/50 double wins and optional opening 9-or-fewer triple wins. Three waiting turns follow a new spread; a hit adds one turn to its owner. Ties catch the dropper. This table uses the documented house variation where the lowest eligible opponent collects double from the dropper and the normal amount from other players; low ties go to the eligible seat closest left of dealer. All games use points.

Online rooms authenticate every request through Firebase Auth. Existing customer sessions work; guest play requires Anonymous Auth to be enabled. At least two humans must join before the host starts; empty seats can become bots. Only the host starts, deals the next round, or closes a room. The server stores the full game, validates actions and versions in Firestore transactions, and sends only each member's own hand and public table information. Rooms reconnect using the saved code on the same device and expire after 24 hours. Closed or expired rooms remain available for admin history; configure retention separately if needed.

Admin Game Rooms can monitor the latest rooms and close a table. Client reads of the full room documents are denied. Polling drives room updates and server bots; the room continues when a member reconnects. This is not a websocket service. Unfilled bot seats are fixed after a match starts.

## Validation

- `npm run build` and `npm run lint`
- `npm test` for game rules and complete bot rounds
- With a local Firestore emulator: set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8088`, then `npm test` for multiplayer privacy and concurrency
- In `functions`: with the same emulator variable, run `npm test` for reservations, payment retries, expiration, and access rules
- In `../admin_app`: `flutter analyze --no-fatal-infos`, `flutter test`, `flutter build web`

Emulator suites reject non-loopback hosts and use the `demo-xnx` project. They never operate on production data. Live Stripe, Shippo, delivery, SMTP, and cross-device online play still require configured services and deployment validation.

## Artwork and fonts

Original assets generated with the built-in imagegen tool are saved in this project:

- `public/assets/cards-corner-hero.png`
- `public/assets/card-back-emerald.png`

Hero prompt: “Use case: stylized-concept. Asset type: original wide 1536x1024 hero artwork for the Nurnrebel / XNX Cards Corner web games. Premium underground card club aesthetic, cinematic editorial still life of elegant ivory playing cards with accurate spade and heart motifs floating above a deep dark emerald green felt poker table, black obsidian edges, muted antique gold inlay, restrained olive neon rim light, subtle smoke, tactile paper and velvet, refined luxurious typography-free composition. Cards clustered on the right half, moody empty dark left half for website text overlay, no words, no money, no gambling chips, no people. Crisp professional game environment art, polished and beautiful.”

Card-back prompt: “Use case: stylized-concept. Asset type: original portrait playing-card back artwork, full bleed, for Nurnrebel / XNX Tonk and Spades web games. Produce a flat straight-on perfectly rectangular 2:3 vertical ornamental card back design, symmetrical intricate antique-gold filigree on deep black and emerald-green background. Central refined spade emblem surrounded by art deco geometry, subtle embossed metallic texture, small olive accents, beautiful luxury underground card-club atmosphere, precise mirrored corners, legible silhouette when rendered small. No text or letters, no card face values, no mockup perspective, no outside background, no shadows beyond edges; the entire canvas is the card back itself. Matches a dark emerald felt table and ivory card faces.”

Geist fonts are bundled locally so production builds do not depend on Google Fonts network access. Their SIL Open Font License is in `app/fonts/LICENSE.txt`.
