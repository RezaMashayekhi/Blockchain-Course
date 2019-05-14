async function trade(trade) {  // eslint-disable-line no-unused-vars
    const oldOwner = trade.book.owner;
    trade.book.owner = trade.orderer;
    const assetRegistry = await getAssetRegistry('com.khazandegan.library.Book');
    await assetRegistry.update(trade.book);
    let event = getFactory().newEvent('com.khazandegan.library', 'PlaceTradeEvent');
    event.orderID = trade.orderID;
    event.book = trade.book;
    event.oldOwner = oldOwner;
    event.newOwner = trade.orderer;
    emit(event);
}