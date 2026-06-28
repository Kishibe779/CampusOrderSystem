# Campus Ordering Mini Program Design

## Source Requirement

This project follows `task.docx`, the training assignment for "微信小程序开发实践". The selected route is A: native WeChat Mini Program plus WeChat Cloud Development.

## Delivery Scope

- Mini Program source code with cloud functions.
- Core student flow: login, dish browsing, pull refresh, load more, dish detail, cart, address, checkout, payment simulation, order creation, pickup credential, order list, order detail, delivery confirmation.
- Reservation flow: self-pickup or delivery with time/address selection.
- Group meal flow: manual group meal reservation with diner count, meal time, and notes.
- Canteen admin flow: dish management view, order processing, pickup code verification, and simple sales statistics.
- Optional/innovation features: ratings, local cache for home data, order status timeline, electronic receipt text, nutrition/recommendation hints.
- Required documents: requirement analysis, system design, test cases and bug record, AI use record, presentation deck, personal training report.

## Architecture

The Mini Program keeps UI state locally and calls a small API layer in `miniprogram/utils/api.js`. In real deployment, that API layer calls WeChat cloud functions. For local readability and demonstration, it also contains seed-driven fallback behavior that mirrors the cloud-function contracts.

Cloud functions are written as focused Node.js handlers:

- `login`: get or create user profile by OpenID.
- `getDishes`: read paginated dish data by category and keyword.
- `placeOrder`: validate stock, create order, deduct stock, generate pickup code.
- `verifyPickupCode`: admin verification and order status transition.
- `updateOrderStatus`: delivery confirmation and cancel/complete transitions.
- `submitReview`: completed order rating.

Core business rules live in `miniprogram/utils/orderLogic.js` and are covered by Node tests.

## Data Collections

- `users`: student/teacher/admin/group organizer profile.
- `categories`: dish categories.
- `dishes`: dish catalog with price, stock, image, rating, ingredients, nutrition tags, and sale status.
- `carts`: user cart lines.
- `addresses`: user delivery addresses.
- `orders`: normal, reservation, delivery, and group orders.
- `pickup_codes`: pickup credential index for fast verification.
- `reviews`: order and dish reviews.

## UI Plan

The interface uses a clean food-service palette: warm white background, dark ink text, green primary actions, amber status accents, and compact cards. Pages are built for scanning, repeated ordering, and quick admin verification rather than a marketing-style hero.

## Verification

- Unit tests cover total calculation, stock validation, pickup code uniqueness shape, order number format, and legal status transitions.
- A structure check verifies all page paths in `app.json` have corresponding WXML/WXSS/JS/JSON files and all required cloud functions exist.
- Document render QA is attempted through the bundled renderer; the local machine currently lacks LibreOffice/`soffice`, so final DOCX visual QA will be structurally checked and this limitation will be disclosed.
