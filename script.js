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

async function Offer(offer, isAccepted) {
  // eslint-disable-line no-unused-vars
  if (isAccepted) {
    const oldOwner = offer.book.owner;
    offer.book.owner = offer.orderer;
    oldOwner.wallet.totalWallet += offer.price;
    offer.orderer.wallet.totalWallet -= offer.price;
    offer.status = OfferStatus.DONE;
    const assetRegistry = await getAssetRegistry(
      "com.khazandegan.library.Book"
    );
    await assetRegistry.update(offer.book);
    let event = getFactory().newEvent(
      "com.khazandegan.library",
      "PlaceOfferEvent"
    );
    event.offerID = offer.offerID;
    event.book = offer.book;
    event.oldOwner = oldOwner;
    event.newOwner = offer.orderer;
    event.offerStatus = OfferStatus.DONE;
    emit(event);
  } else {
    offer.status = OfferStatus.CANCELED;
    let event = getFactory().newEvent(
      "com.khazandegan.library",
      "PlaceOfferEvent"
    );
    event.offerID = offer.offerID;
    event.offerStatus = OfferStatus.CANCELED;
    emit(event);
  }
}
