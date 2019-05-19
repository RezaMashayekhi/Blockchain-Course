/**
 * Track the trade of a commodity from one trader to another
 * @param {com.khazandegan.library.Trade} trade - the trade to be processed
 * @transaction
 */
async function Trade(trade) {
  // eslint-disable-line no-unused-vars
  const oldOwner = trade.book.owner;
  trade.book.owner = trade.orderer;
  const assetRegistry = await getAssetRegistry("com.khazandegan.library.Book");
  await assetRegistry.update(trade.book);
  let event = getFactory().newEvent(
    "com.khazandegan.library",
    "PlaceTradeEvent"
  );
  event.orderID = trade.orderID;
  event.book = trade.book;
  event.oldOwner = oldOwner;
  event.newOwner = trade.orderer;
  emit(event);
}
/**
 * Send an offer for a book
 * @param {com.khazandegan.library.AcceptOffer} acceptOffer - the offer to be processed
 * @transaction
 */
async function AcceptOffer(acceptOffer) {
  offer = acceptOffer.offer;
  if (offer.orderer.credit >= offer.price) {
    const oldOwner = offer.book.owner;
    offer.book.owner = offer.orderer;
    oldOwner.credit += offer.price;
    offer.orderer.credit -= offer.price;
    offer.status = "DONE";
    const assetRegistry = await getAssetRegistry(
      "com.khazandegan.library.Book"
    );
    await assetRegistry.update(offer.book);
	const assetRegistry2 = await getAssetRegistry(
      "com.khazandegan.library.Offer"
    );
    await assetRegistry2.update(offer);
    const participantRegistryOwner = await getParticipantRegistry(
      "com.khazandegan.library.Person"
    );
    await participantRegistryOwner.update(oldOwner);
    const participantRegistryOrderer = await getParticipantRegistry(
      "com.khazandegan.library.Person"
    );
    await participantRegistryOrderer.update(offer.orderer);
    let event = getFactory().newEvent(
      "com.khazandegan.library",
      "PlaceOfferEvent"
    );
    event.offerID = offer.offerID;
    event.book = offer.book;
    event.oldOwner = oldOwner;
    event.newOwner = offer.orderer;
    event.offerStatus = "DONE";
    emit(event);
  }
}
/**
 * reject an offer for a book
 * @param {com.khazandegan.library.RejectOffer} rejectOffer - the offer to be processed
 * @transaction
 */
async function RejectOffer(rejectOffer) {
    offer = rejectOffer.offer;
    offer.status = "CANCELED";
    const assetRegistry = await getAssetRegistry(
      "com.khazandegan.library.Offer"
    );
    await assetRegistry.update(offer);
    let event = getFactory().newEvent(
      "com.khazandegan.library",
      "RejectOfferEvent"
    );
    event.offerID = offer.offerID;
    event.offerStatus = "CANCELED";
    emit(event);
  
}


/**
 * Bid on a book in auction
 * @param {com.khazandegan.library.Bid} bid - the bid to be processed
 * @transaction
 */
async function Bid(bid) {
	if (bid.price>bid.auction.lastBid){
	  const lastBidder=bid.auction.bidder;
      lastBidder.credit+=bid.auction.lastBid;
      bid.auction.lastBid=bid.price;
      bid.auction.bidder=bid.bidder;
      bid.auction.bidder.credit-=bid.price;
	  const assetRegistry = await getAssetRegistry(
      "com.khazandegan.library.Auction"
    );
    await assetRegistry.update(bid.auction);
	  const participantRegistry = await getParticipantRegistry(
      "com.khazandegan.library.Person"
    );
    await participantRegistry.update(bid.bidder);
	  const participantRegistry2 = await getParticipantRegistry(
      "com.khazandegan.library.Person"
    );
    await participantRegistry2.update(lastBidder);
	let event = getFactory().newEvent(
      "com.khazandegan.library",
      "BidUpEvent"
    );
    event.bidID = bid.bidID;
    event.auction = bid.auction;
    event.lastBidder = lastBidder;
    event.newBidder = bid.auction.bidder;
    emit(event);
    }
	
}

/**
 * End auction
 * @param {com.khazandegan.library.AuctionOff} auctionoff - the auction to be processed
 * @transaction
 */
async function AuctionOff(auctionoff) {
	if (auctionoff.auction.status=="OPEN"){
	  const oldOwner=auctionoff.auction.book.owner;
      oldOwner.credit+=auctionoff.auction.lastBid;
      auctionoff.auction.book.owner=auctionoff.auction.bidder;
	  auctionoff.auction.status="DONE";
	  const assetRegistry1 = await getAssetRegistry(
      "com.khazandegan.library.Book"
    );
    await assetRegistry1.update(auctionoff.auction.book);
	  const assetRegistry2 = await getAssetRegistry(
      "com.khazandegan.library.Auction"
    );
    await assetRegistry2.update(auctionoff.auction);
	  const participantRegistry = await getParticipantRegistry(
      "com.khazandegan.library.Person"
    );
    await participantRegistry.update(oldOwner);
	let event = getFactory().newEvent(
      "com.khazandegan.library",
      "AuctionOffEvent"
    );
    event.auctionOffID = auctionoff.auctionOffID;
    event.auction = auctionoff.auction;
    event.oldOwner = oldOwner;
    event.newOwner = auctionoff.auction.book.owner;
    emit(event);
    }
	
}
