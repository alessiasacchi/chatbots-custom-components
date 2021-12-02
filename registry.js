module.exports =
{

  // SmartRetailBot
  'stockquery.searchItems' : require('./stockquery/searchItems'),
  'stockquery.showResults' : require('./stockquery/showResults'),
  'stockquery.shareLocation' : require('./stockquery/shareLocation'),
  'stockquery.lookupStores' : require('./stockquery/lookupStores'),

  // SmartUniBot
  'university.timetable' : require('./university/timetableHandler'),

  // First University Bot
  'manageSubjects' : require('./university/manageSubjects'),
  'offerPackage' : require('./university/offerPackage'),
  'returnAddress' : require('./university/returnAddress'),
  'returnHowDoI' : require('./university/returnHowDoI'),
  'returnNextSubject' : require('./university/returnNextSubject'),
  'returnTimetable' : require('./university/returnTimetable'),

  //new util
  'util.entityMatcher' : require('./util/entityMatcher'),


  // PizzaBot
  'AgeChecker' : require('./pizza/age_checker'),

  // Components for testing
  'LocationBasedOptions' : require('./testing/location_options'),
  'WeatherQuery' : require('./testing/weather_query'),
  'VariableSetter' : require('./testing/variable_setter'),
  'MultipleResponses' : require('./testing/multiresponse'),

  // FinancialBot
  'BalanceRetrieval' : require('./banking/balance_retrieval'),
  'TransactionsRetrieval' : require('./banking/transactions_retrieval'),
  'TrackSpending' : require('./banking/track_spending'),
  'FAQ' : require('./banking/faq'),
  'Payments' : require('./banking/payments'),

  // TelcoBot
  'MobileChargeAccount' : require('./telco/mobile_chargeaccount'),
  'MobileEligible' : require('./telco/mobile_eligible'),
  'MobileLoadData' : require('./telco/mobile_loaddata'),
  'MobileUsage' : require('./telco/mobile_usage'),
  'MobileBillPay' : require('./telco/mobile_billpay'),
  'MobileBillingStatement' : require('./telco/mobile_statement'),

  // RetailBot
  'retail.ListStores' : require('./retail/ListStores'),
  'retail.StoreInfo' : require('./retail/StoreInfo'),
  'retail.OrderSummary' : require('./retail/OrderSummary'),
  'retail.CancelOrder' : require('./retail/CancelOrder'),
  'retail.GiftCardBalance' : require('./retail/GiftCardBalance'),
  'retail.InventoryCheck' : require('./retail/InventoryCheck'),
  'retail.ReturnStatus' : require('./retail/ReturnStatus'),
  'retail.Greeting' : require('./retail/Greeting'),
  'retail.ListOrders' : require('./retail/ListOrders'),
  'retail.Agent' : require('./retail/Agent'),
  'retail.FAQ' : require('./retail/FAQ'),
  'retail.Community' : require('./retail/Community'),
  'retail.ApptSetup' : require('./retail/ApptSetup'),
  'retail.DownloadApp' : require('./retail/DownloadApp'),
  'retail.Image' : require('./retail/Image'),

  // Utility components
  'ActionFromVariable' : require('./util/action_from_variable'),
  'SetVariablesFromFile' : require('./util/set_variables_from_file'),
  'SetVariableFromEntityMatches' : require('./util/set_variable_from_entity_matches'),
  'OutputVariables' : require('./util/output_variables'),
  'ConditionalIsNull' : require('./util/conditional_is_null'),
  'FilteredIntent' : require('./util/filteredIntent'),

  // Hackathon - stocks bot
  'stocks.GetStockInfo' : require('./stocks/stock_info'),
  'stocks.GetAuthURL' : require('./stocks/get_auth_url'),
  'stocks.TradePreview': require('./stocks/trade_preview'),
  'stocks.TradeConfirm': require('./stocks/trade_confirm'),
  'stocks.BankUserProfile': require('./stocks/BankUserProfile'),
  'stocks.TwoFactorAuth' : require ('./stocks/two_factor_auth'),
  'stocks.CheckAuthCode' : require ('./stocks/check_auth'),

  // Hackathon - Hello Kids
  'parenting.HelloKids' : require('./parenting/hello_kids')
};
