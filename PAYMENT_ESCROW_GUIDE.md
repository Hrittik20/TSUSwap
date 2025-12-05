# 💳 TSUSwap Payment & Escrow Guide

## 🛡️ Fraud Prevention System

TSUSwap uses an **escrow system** for card payments to protect both buyers and sellers from fraud.

## How It Works

### For Card Payments (Secure with Escrow)

#### Step 1: Buyer Purchases Item
1. Buyer selects **"Card Payment"** option
2. Payment is processed through Stripe
3. **Funds are HELD (not released to seller yet)**
4. Payment status: `FUNDS_HELD`

#### Step 2: Meetup & Exchange
1. Buyer and seller arrange to meet (at dorm room)
2. Seller brings the item
3. Buyer inspects the item:
   - Check condition matches description
   - Verify it works properly
   - Ensure no hidden damage

#### Step 3: Confirm Receipt
**⚠️ IMPORTANT FOR BUYERS:**
- **DO NOT confirm receipt** until you have inspected the item
- **DO NOT let seller leave** before confirming in their presence
- Only confirm if item is exactly as described

**✅ If Item is Good:**
1. Buyer confirms receipt in the app
2. Funds are released to seller
3. Transaction complete!

**❌ If Item has Issues:**
1. Buyer DOES NOT confirm
2. Contacts support/seller
3. Can dispute or return
4. Funds remain held

### For Sellers: Critical Instructions

**⚠️ READ THIS CAREFULLY:**

```
🚫 DO NOT hand over the item until buyer confirms receipt in front of you!

✅ Correct Process:
1. Meet the buyer
2. Show them the item
3. Let them inspect it
4. Ask them to CONFIRM RECEIPT in the app (right there)
5. Wait for confirmation
6. THEN hand over the item

❌ Wrong Process:
1. Give item to buyer
2. Buyer leaves
3. Buyer never confirms (or claims issue)
4. You lose both item AND money!
```

## Payment Options Comparison

### Card Payment (Escrow Protected)

**Pros:**
- ✅ Buyer protection (funds held until confirmed)
- ✅ Seller protection (payment guaranteed once confirmed)
- ✅ No cash needed
- ✅ Digital record of transaction
- ✅ Dispute resolution possible

**Cons:**
- ⏱️ Requires buyer confirmation
- 💰 5% commission on auctions

**Best For:**
- Expensive items
- Items shipped/delivered
- When extra security needed

### Cash on Meet (No Escrow)

**Pros:**
- ✅ Instant payment
- ✅ No commission fees
- ✅ Simple and direct
- ✅ No confirmation needed

**Cons:**
- ❌ No buyer protection
- ❌ No seller protection
- ❌ Need exact cash
- ❌ No digital record

**Best For:**
- Low-value items
- Quick transactions
- When meeting in person anyway

## Transaction Statuses

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| **PENDING** | Payment being processed | Wait |
| **FUNDS_HELD** | Money held in escrow | Buyer must confirm receipt |
| **COMPLETED** | Transaction finished | None - done! |
| **CANCELLED** | Transaction cancelled | Refund processed |
| **REFUNDED** | Money returned to buyer | None |

## Buyer Instructions

### When Using Card Payment:

1. **Before Meeting:**
   - Review item details
   - Note seller's dorm and room
   - Confirm meeting time

2. **During Meeting:**
   - Inspect item thoroughly
   - Test if it's electronic
   - Check for any damage
   - Compare to photos/description

3. **Confirming Receipt:**
   - Go to Dashboard → My Purchases
   - Find the transaction
   - Click "Confirm Receipt"
   - **ONLY if item is perfect!**

4. **If There's a Problem:**
   - DO NOT confirm
   - Take photos of issue
   - Contact seller first
   - Contact support if needed

### When Using Cash:

1. Bring exact amount
2. Meet at agreed location
3. Inspect item
4. Pay cash
5. Done! (No confirmation needed)

## Seller Instructions

### When Accepting Card Payment:

1. **Before Meeting:**
   - Check transaction status is `FUNDS_HELD`
   - This means buyer already paid
   - Money is waiting for you!

2. **During Meeting:**
   ```
   📋 SELLER CHECKLIST:
   
   □ Meet buyer at agreed location
   □ Show item to buyer
   □ Let them inspect thoroughly
   □ Answer any questions
   □ Ask buyer to CONFIRM RECEIPT in app
   □ WATCH them confirm it
   □ Wait for "Confirmed!" message
   □ THEN hand over the item
   □ Keep receipt/proof
   ```

3. **After Confirmation:**
   - Funds released to your account
   - Money typically arrives in 2-5 business days
   - Check Stripe dashboard

4. **If Buyer Won't Confirm:**
   - Ask them reason
   - If legitimate issue, resolve it
   - If they're trying to scam, contact support
   - DO NOT give item without confirmation!

### When Accepting Cash:

1. Meet buyer
2. Show item
3. Receive cash
4. Count it
5. Hand over item
6. Mark as complete (optional)

## Common Scam Prevention

### Buyer Scams (Sellers Watch Out!)

**Scam:** Buyer takes item and never confirms receipt

**Prevention:**
- ✅ Make buyer confirm IN YOUR PRESENCE
- ✅ Don't hand over item until confirmed
- ✅ Take photo of confirmation screen

**Scam:** Buyer claims item is damaged (when it's not)

**Prevention:**
- ✅ Take photos before meeting
- ✅ Test item in front of buyer
- ✅ Document condition

### Seller Scams (Buyers Watch Out!)

**Scam:** Item not as described

**Prevention:**
- ✅ Inspect thoroughly before confirming
- ✅ Test everything
- ✅ Compare to photos
- ✅ DON'T confirm if different

**Scam:** Broken/fake item

**Prevention:**
- ✅ Test item at meetup
- ✅ Bring friend if expensive
- ✅ Meet in public area
- ✅ DON'T confirm if broken

## Dispute Resolution

### If You Have an Issue:

1. **Try to Resolve with Other Party**
   - Message them in app
   - Explain the problem
   - Try to find solution

2. **Contact Support**
   - Email: support@tsuswap.ru
   - Include transaction ID
   - Provide photos/evidence
   - Explain situation

3. **Refund Process**
   - For FUNDS_HELD status
   - Support can refund if legitimate
   - Usually within 1-3 days

## Best Practices

### For Everyone:

✅ **DO:**
- Meet in public area of dorm
- Bring a friend for expensive items
- Test electronics before confirming
- Take photos of item condition
- Keep all messages as proof
- Be polite and respectful

❌ **DON'T:**
- Meet in private/unsafe locations
- Rush the inspection
- Confirm before inspecting
- Hand over item before confirmation
- Share personal banking details
- Engage in suspicious behavior

### Meeting Safety:

1. **Choose Safe Location:**
   - Dorm common area
   - Lobby
   - Well-lit public space
   - Near security if available

2. **Tell Someone:**
   - Let friend know where you're going
   - Share meeting details
   - Check in after meeting

3. **Be Aware:**
   - Trust your instincts
   - If something feels wrong, leave
   - Don't feel pressured

## Commission Structure

| Listing Type | Commission | When Charged |
|--------------|------------|--------------|
| Buy Now | 0% | Never |
| Auction | 5% | On final sale price |

**Example:**
- Auction final price: 10,000 ₽
- Commission: 500 ₽ (5%)
- Seller receives: 9,500 ₽

## Timeline

### Card Payment Timeline:

```
Day 1: Buyer purchases → Funds held
Day 1: Meet & confirm → Funds released
Day 2-5: Funds arrive in seller account
```

### Cash Payment Timeline:

```
Day 1: Meet, pay, exchange → Complete!
```

## Support & Help

### Need Help?

**Email:** support@tsuswap.ru  
**Response Time:** Usually 24 hours

**Include:**
- Transaction ID
- Screenshots
- Description of issue
- What you want resolved

### Emergency Issues:

If you encounter:
- Threatening behavior
- Fraud attempt
- Safety concern

**Contact:**
1. TSU Security: [number]
2. Local Police: 102
3. Then contact us

## Legal Protection

TSUSwap provides:
- ✅ Transaction records
- ✅ Message history
- ✅ Payment proof
- ✅ User verification

These can be used as evidence if needed.

## Summary

### Quick Reference Card

**🔵 BUYER:** Card Payment
1. Pay → Funds held
2. Meet seller
3. Inspect item
4. Confirm receipt (only if perfect)
5. Take item

**🔴 SELLER:** Card Payment
1. List item
2. Get notification
3. Meet buyer
4. Show item
5. Make buyer confirm IN FRONT OF YOU
6. Give item AFTER confirmation
7. Get paid!

**🟢 BOTH:** Cash Payment
1. Meet
2. Inspect
3. Pay cash
4. Exchange
5. Done!

---

## Remember:

> **The escrow system only works if you follow the process!**

> **Buyers: Don't confirm until you're happy**

> **Sellers: Don't give item until confirmed**

> **Everyone: Be honest and respectful**

**Stay Safe & Happy Trading!** 🛡️💰

---

*TSUSwap - Secure marketplace for TSU students*




