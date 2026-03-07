# Auctify: Project Requirements & Specifications

## Overview
Auctify is a modern, real-time auction platform designed to connect buyers and sellers in a secure, transparent, and user-friendly environment. The platform allows users to list items, participate in real-time bidding wars, manage payments securely through an escrow system, and communicate directly with winners via a built-in chat module.

---

## 1. Core Features & Functionality

### 1.1 User Authentication & Profiles
- **Secure Registration/Login**: Powered by Supabase Auth with secure password hashing.
- **Identity Verification**: Users must add and verify a payment method before listing or bidding on items, ensuring a high-quality community and discouraging fraud.
- **User Dashboard**: A central hub where users can monitor their Active Bids, My Listings, Watchlisted items, and Direct Messages.

### 1.2 Auction Management
- **Listing Creation**: Sellers can create detailed listings with titles, descriptions, categories (Jewelry, Cars, Electronics, Fashion, etc.), starting prices, and upload multiple product images.
- **Scheduled Auctions**: Auctions have explicit start and end times, preventing premature bidding and automatically closing when time expires.
- **Real-Time Bidding Engine**: Powered by Supabase Realtime integrations, incoming bids are instantly broadcasted to all viewers without needing to refresh the page.
- **Bid Validation**: The database enforces strict rules (e.g., bids must be strictly greater than the current price, sellers cannot bid on their own items, and auctions must be active).
- **Search & Filtering**: Users can filter active auctions by Category and use text search to find specific items. Sorting options include "Newest", "Ending Soonest", and "Price (High/Low)".

### 1.3 Secure Payment Escrow System
- **Pre-requisite Verification**: The platform simulates a requirement for a payment method on file to hold users accountable.
- **Escrow-style Payments**: When an auction ends, the winning bidder processes payment. Instead of going directly to the seller, funds are held in an "Escrow" status.
- **Fund Release**: Only when the buyer manually confirms receipt of the physical item are the funds formally marked as "Released" to the seller.

### 1.4 Real-Time Chat System
- **Post-Auction Communication**: Once an auction concludes, a private, real-time chat room is unlocked *only* for the seller and the winning bidder.
- **Integrated Escrow Banners**: The chat UI includes contextual banners that update based on the payment status (e.g., warning the seller if payment is not yet in escrow, or reminding the buyer to release funds once the item arrives).
- **Instant Messaging**: Messages are delivered instantly using Supabase Realtime channels.

---

## 2. Technical Architecture

- **Frontend Framework**: React with TypeScript, built using Vite for fast hot-module replacement and optimized builds.
- **Styling**: Tailwind CSS combined with `shadcn/ui` components for a modern, responsive, and accessible interface.
- **Routing**: `react-router-dom` for client-side routing.
- **State Management**: React Query (`@tanstack/react-query`) for efficient data fetching, caching, and cache invalidation.
- **Backend/Database**: 
  - Supabase (PostgreSQL) acts as the backend-as-a-service.
  - Features heavily utilize Row Level Security (RLS) to ensure data privacy.
  - PostgreSQL functions (RPCs) are used to handle complex atomic transactions, such as placing a bid and ensuring no race conditions occur.

---

## 3. Security & Trust Management

### 3.1 Data Security
- **Row Level Security (RLS)**: PostgreSQL policies dictate exactly who can read or write data. For example:
  - Only the specific buyer and seller can view their payment records.
  - Only the sender and receiver can view their private chat messages.
  - Users can only delete or edit their *own* auction listings.
- **Atomic Transactions**: Bidding logic is handled via a `security definer` SQL function. It uses `FOR UPDATE` row locking to prevent race conditions when two users attempt to bid at the exact same millisecond.

### 3.2 User Trust
- **Escrow Mechanics**: The platform protects buyers by preventing sellers from taking the money and running. It protects sellers by ensuring the buyer has actually paid into escrow before the seller ships the item.
- **Identity Friction**: Requiring a verified payment method before participating acts as a strong deterrent against bot accounts and bad actors.
- **Accountability**: Real-time communication ensures sellers and buyers have an audited trail of conversation if disputes arise.

---

## 4. Why Auctify is Best for Users
1. **Dynamic Design**: The UI leverages glassmorphism, smooth animations, and interactive hover states to create a premium, engaging feel that encourages interaction.
2. **Instant Feedback**: From bidding to chatting, everything happens in real-time. Users never have to manually refresh the page to see if they've been outbid or received a message.
3. **Peace of Mind**: The combination of verified accounts and escrow payments creates one of the safest environments possible for peer-to-peer transactions.
4. **All-in-One Dashboard**: Users don't need to navigate complex menus. Everything from their watchlists to their active chats is accessible from a single, unified dashboard view.
