/**
 * Track the trade of a commodity from one trader to another
 * @param {com.khazandegan.library.Trade} trade - the trade to be processed
 * @transaction
 */
async function Trade(trade) {  // eslint-disable-line no-unused-vars
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