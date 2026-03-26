export type Lang = "en" | "zh";

const translations = {
  // Navbar
  "nav.overview": { en: "Overview", zh: "總覽" },
  "nav.itinerary": { en: "Itinerary", zh: "行程" },
  "nav.places": { en: "Places", zh: "景點" },
  "nav.budget": { en: "Budget", zh: "預算" },
  "nav.info": { en: "Info", zh: "旅遊資訊" },
  "nav.checklist": { en: "Checklist", zh: "行李清單" },

  // Overview
  "overview.badge": { en: "Family Adventure", zh: "家庭冒險之旅" },
  "overview.title": { en: "Sydney, Australia", zh: "澳洲 · 雪梨" },
  "overview.subtitle": {
    en: "— A week of harbour views, wildlife encounters, and beach days with the whole family.",
    zh: "— 一週的港灣美景、野生動物邂逅，以及全家人的海灘時光。",
  },
  "overview.viewItinerary": { en: "View Itinerary", zh: "查看行程" },
  "overview.budgetTracker": { en: "Budget Tracker", zh: "預算追蹤" },
  "overview.dates": { en: "Dates", zh: "日期" },
  "overview.travelers": { en: "Travelers", zh: "旅客" },
  "overview.hotel": { en: "Hotel", zh: "飯店" },
  "overview.flights": { en: "Flights", zh: "航班" },
  "overview.highlights": { en: "Trip Highlights", zh: "旅行亮點" },
  "overview.highlightsDesc": {
    en: "Places we'll visit on this adventure",
    zh: "這趟冒險之旅將造訪的景點",
  },
  "overview.seeAll": { en: "See all", zh: "查看全部" },
  "overview.allAttractions": { en: "All Attractions", zh: "所有景點" },
  "overview.allAttractionsDesc": {
    en: "Every stop on our Sydney adventure",
    zh: "雪梨之旅的每一站",
  },
  "overview.places": { en: "Saved Places", zh: "已儲存景點" },
  "overview.placesDesc": {
    en: "Restaurants, cafes, and spots on our list",
    zh: "我們清單上的餐廳、咖啡廳和景點",
  },
  "overview.journey": { en: "6-Day Journey", zh: "六日旅程" },
  "overview.journeyDesc": {
    en: "A day-by-day snapshot of our Sydney adventure",
    zh: "雪梨之旅的每日概覽",
  },
  "overview.budgetSummary": { en: "Budget Summary", zh: "預算摘要" },
  "overview.budgetSummaryDesc": {
    en: "Quick overview of trip spending",
    zh: "旅行開銷快速概覽",
  },
  "overview.remaining": { en: "remaining", zh: "剩餘" },
  "overview.spent": { en: "spent", zh: "已花費" },
  "overview.of": { en: "of", zh: "/" },

  // Itinerary
  "itinerary.title": { en: "Trip Itinerary", zh: "旅行行程" },
  "itinerary.subtitle": {
    en: "6 days exploring the best of Sydney with the family",
    zh: "與家人一起探索雪梨精華的六天旅程",
  },
  "itinerary.activities": { en: "Activities", zh: "活動" },
  "itinerary.locations": { en: "Locations", zh: "地點" },
  "itinerary.places": { en: "Places", zh: "景點" },
  "itinerary.savedPlaces": { en: "Saved Places", zh: "已儲存景點" },
  "itinerary.viewAll": { en: "View all →", zh: "查看全部 →" },
  "itinerary.mapView": { en: "Day Route", zh: "當日路線" },
  "itinerary.showAll": { en: "Show all stops", zh: "顯示所有站點" },
  "itinerary.morning": { en: "Morning", zh: "上午" },
  "itinerary.breakfast": { en: "Breakfast", zh: "早餐" },
  "itinerary.afternoon": { en: "Afternoon", zh: "下午" },
  "itinerary.lunch": { en: "Lunch", zh: "午餐" },
  "itinerary.evening": { en: "Evening", zh: "晚上" },
  "itinerary.dinner": { en: "Dinner", zh: "晚餐" },
  "itinerary.addToSlot": { en: "Add place", zh: "新增景點" },
  "itinerary.removeFromSlot": { en: "Remove", zh: "移除" },
  "itinerary.pickPlace": { en: "Pick a place", zh: "選擇景點" },
  "itinerary.slotFull": { en: "Slot is full", zh: "此時段已滿" },
  "itinerary.searchPlaces": { en: "Search places...", zh: "搜尋景點..." },
  "itinerary.dragHint": { en: "Drag from sidebar or click + to add", zh: "從側欄拖曳或點擊 + 新增" },
  "itinerary.allPlaces": { en: "All Saved Places", zh: "所有已儲存景點" },
  "itinerary.unassigned": { en: "Unassigned Places", zh: "未分配景點" },
  "itinerary.allAssigned": { en: "All places assigned!", zh: "所有景點已分配！" },

  // My Places
  "places.title": { en: "My Places", zh: "我的景點" },
  "places.subtitle": {
    en: "Save restaurants, cafes, and places you want to visit",
    zh: "儲存想去的餐廳、咖啡廳和景點",
  },
  "places.addPlace": { en: "Add Place", zh: "新增景點" },
  "places.editPlace": { en: "Edit Place", zh: "編輯景點" },
  "places.name": { en: "Name", zh: "名稱" },
  "places.notes": { en: "Notes", zh: "備註" },
  "places.mapsUrl": { en: "Google Maps URL", zh: "Google Maps 連結" },
  "places.website": { en: "Website", zh: "網站" },
  "places.category": { en: "Category", zh: "分類" },
  "places.dayLabels": { en: "Assign to days", zh: "指定日期" },
  "places.save": { en: "Save", zh: "儲存" },
  "places.all": { en: "All", zh: "全部" },
  "places.search": { en: "Search places...", zh: "搜尋景點..." },
  "places.map": { en: "Map", zh: "地圖" },
  "places.noPlaces": { en: "No places saved yet", zh: "尚未儲存景點" },
  "places.imageUrl": { en: "Image URL (optional)", zh: "圖片網址（選填）" },
  "places.noPlacesHint": {
    en: "Click \"Add Place\" to save restaurants and attractions",
    zh: "點擊「新增景點」儲存餐廳和景點",
  },

  // Budget
  "budget.title": { en: "Budget Tracker", zh: "預算追蹤器" },
  "budget.subtitle": {
    en: "Track expenses in TWD & AUD — Rate: 1 AUD =",
    zh: "以台幣和澳幣追蹤開銷 — 匯率：1 AUD =",
  },
  "budget.twd": { en: "TWD", zh: "TWD" },
  "budget.addExpense": { en: "Add Expense", zh: "新增支出" },
  "budget.addNewExpense": { en: "Add New Expense", zh: "新增支出" },
  "budget.editExpense": { en: "Edit Expense", zh: "編輯支出" },
  "budget.totalBudget": { en: "Total Budget", zh: "總預算" },
  "budget.totalSpent": { en: "Total Spent", zh: "總支出" },
  "budget.remaining": { en: "Remaining", zh: "剩餘金額" },
  "budget.overallSpending": { en: "Overall Spending", zh: "整體花費" },
  "budget.used": { en: "used", zh: "已使用" },
  "budget.categoryBudgets": { en: "Category Budgets", zh: "分類預算" },
  "budget.expenses": { en: "Expenses", zh: "支出明細" },
  "budget.items": { en: "items", zh: "筆" },
  "budget.noExpenses": { en: "No expenses yet", zh: "尚無支出記錄" },
  "budget.noExpensesHint": {
    en: 'Click "Add Expense" to start tracking your spending',
    zh: "點擊「新增支出」開始記錄您的花費",
  },
  "budget.category": { en: "Category", zh: "分類" },
  "budget.description": { en: "Description", zh: "描述" },
  "budget.descriptionOptional": { en: "Description (optional)", zh: "描述（選填）" },
  "budget.amount": { en: "Amount", zh: "金額" },
  "budget.currency": { en: "Currency", zh: "幣別" },
  "budget.date": { en: "Date", zh: "日期" },
  "budget.save": { en: "Save", zh: "儲存" },
  "budget.exportCsv": { en: "Export CSV", zh: "匯出 CSV" },

  // Travel Info
  "info.title": { en: "Travel Info", zh: "旅遊資訊" },
  "info.subtitle": {
    en: "Essential information for your Sydney trip in July",
    zh: "七月雪梨之旅的必備資訊",
  },
  "info.weather": { en: "Weather in July", zh: "七月天氣" },
  "info.weatherDesc": {
    en: "July is winter in Sydney. Expect temperatures of 8-17°C (46-63°F). Days are mild but nights can be cold. Occasional rain is possible — pack a rain jacket. Sunrise around 7:00 AM, sunset around 5:10 PM.",
    zh: "七月是雪梨的冬季。預計氣溫為 8-17°C。白天溫和但夜晚偏冷。偶爾可能下雨，請準備雨衣。日出約早上 7:00，日落約下午 5:10。",
  },
  "info.clothing": { en: "What to Wear", zh: "穿著建議" },
  "info.clothingDesc": {
    en: "Dress in layers — mornings and evenings are cold, but midday can be pleasant. Bring a warm jacket, comfortable walking shoes, and a rain jacket. A scarf and beanie are useful for windy harbour areas.",
    zh: "建議穿搭多層穿法 — 早晚較冷，但中午舒適。帶保暖外套、舒適步行鞋和雨衣。圍巾和毛帽在港口風大的地方很實用。",
  },
  "info.power": { en: "Power & Sockets", zh: "電源與插座" },
  "info.powerDesc": {
    en: "Australia uses Type I sockets (three angled pins). Voltage is 230V, 50Hz. You will need a Type I adapter — available at the airport or convenience stores. Taiwan devices (110V) may need a voltage converter for high-wattage items.",
    zh: "澳洲使用 Type I 插座（三腳斜角插頭）。電壓 230V，頻率 50Hz。需要 Type I 轉接頭，機場或便利商店可購買。台灣電器（110V）高瓦數設備可能需要變壓器。",
  },
  "info.currency": { en: "Currency", zh: "貨幣" },
  "info.currencyDesc": {
    en: "Australian Dollar (AUD). 1 AUD ≈ 20.5 TWD. Contactless payments (Apple Pay, credit cards) are widely accepted — even at markets. Tipping is not customary in Australia. ATMs are plentiful.",
    zh: "澳幣（AUD）。1 AUD ≈ 20.5 TWD。非接觸式支付（Apple Pay、信用卡）廣泛接受，甚至市場都可以使用。澳洲不流行小費。ATM 隨處可見。",
  },
  "info.emergency": { en: "Emergency", zh: "緊急電話" },
  "info.emergencyDesc": {
    en: "Emergency: 000 (police, fire, ambulance)\nNon-emergency police: 131 444\nTaiwan TECO Sydney: +61-2-8650-4200\nHealth Direct (24hr): 1800 022 222",
    zh: "緊急電話：000（警察、消防、救護車）\n非緊急警察：131 444\n駐雪梨台北經濟文化辦事處：+61-2-8650-4200\n24小時健康諮詢：1800 022 222",
  },
  "info.timezone": { en: "Timezone", zh: "時區" },
  "info.timezoneDesc": {
    en: "AEST (UTC+10). Sydney is 2 hours ahead of Taiwan (UTC+8). When it's 10 AM in Sydney, it's 8 AM in Taipei. No daylight saving in July (winter).",
    zh: "AEST（UTC+10）。雪梨比台灣（UTC+8）快 2 小時。雪梨上午 10 點時，台北是上午 8 點。七月（冬季）無日光節約時間。",
  },
  "info.language": { en: "Language", zh: "語言" },
  "info.languageDesc": {
    en: "English is the primary language. Most signs, menus, and public transport information are in English. Google Translate works well for any needs. Australians are very friendly and helpful!",
    zh: "英語是主要語言。大多數標誌、菜單和公共交通資訊都是英文的。Google 翻譯可以滿足任何需求。澳洲人非常友善且樂於助人！",
  },
  "info.sim": { en: "SIM Card & WiFi", zh: "SIM卡與WiFi" },
  "info.simDesc": {
    en: "Prepaid SIM cards available at Sydney Airport (Optus, Telstra, Vodafone). ~A$30-40 for 7 days with unlimited calls + 10-20GB data. Free WiFi at most cafes, shopping centres, and the hotel. Opal card for transport can be a physical card or digital via phone.",
    zh: "雪梨機場可購買預付 SIM 卡（Optus、Telstra、Vodafone）。約 A$30-40 可享 7 天無限通話 + 10-20GB 上網。大多數咖啡廳、購物中心和飯店有免費 WiFi。交通可用 Opal 卡（實體或手機數位版）。",
  },
  "info.familyTips": { en: "Family Tips", zh: "親子旅行小提示" },
  "info.familyTipsDesc": {
    en: "• Most attractions are free for children under 4\n• Strollers are welcome on buses and trains (fold on escalators)\n• Nappy change facilities in most shopping centres and public toilets\n• Highchairs available at most family restaurants\n• Pharmacies (Chemist Warehouse, Priceline) everywhere for baby supplies\n• BYO (Bring Your Own food) is common at many Sydney restaurants",
    zh: "• 大多數景點 4 歲以下免費\n• 公車和火車可使用嬰兒車（手扶梯需摺疊）\n• 大多數購物中心和公廁有換尿布設施\n• 大多數親子餐廳提供兒童高腳椅\n• 到處有藥局（Chemist Warehouse、Priceline）購買嬰兒用品\n• 許多雪梨餐廳允許自帶食物（BYO）",
  },

  // Checklist
  "checklist.title": { en: "Packing Checklist", zh: "行李清單" },
  "checklist.subtitle": {
    en: "Track what you need to pack for the trip",
    zh: "追蹤旅行需要打包的物品",
  },
  "checklist.addItem": { en: "Add Item", zh: "新增項目" },
  "checklist.editItem": { en: "Edit Item", zh: "編輯項目" },
  "checklist.itemText": { en: "Item", zh: "項目" },
  "checklist.category": { en: "Category", zh: "分類" },
  "checklist.save": { en: "Save", zh: "儲存" },
  "checklist.progress": { en: "Packing Progress", zh: "打包進度" },
  "checklist.packed": { en: "packed", zh: "已打包" },
  "checklist.noItems": { en: "No items in checklist", zh: "清單中沒有項目" },
  "checklist.checked": { en: "packed!", zh: "已打包！" },
  "checklist.unchecked": { en: "unpacked", zh: "已取消打包" },

  // Toast
  "toast.expenseAdded": { en: "Expense added", zh: "已新增支出" },
  "toast.expenseUpdated": { en: "Expense updated", zh: "已更新支出" },
  "toast.expenseDeleted": { en: "Expense deleted", zh: "已刪除支出" },
  "toast.budgetUpdated": { en: "Budget updated", zh: "已更新預算" },
  "toast.placeAdded": { en: "Place added", zh: "已新增景點" },
  "toast.placeUpdated": { en: "Place updated", zh: "已更新景點" },
  "toast.placeDeleted": { en: "Place deleted", zh: "已刪除景點" },
  "toast.itemAdded": { en: "Item added", zh: "已新增項目" },
  "toast.itemUpdated": { en: "Item updated", zh: "已更新項目" },
  "toast.itemDeleted": { en: "Item deleted", zh: "已刪除項目" },
  "toast.error": { en: "Something went wrong", zh: "發生錯誤" },
  "toast.slotAdded": { en: "Place added to itinerary", zh: "已新增景點至行程" },
  "toast.slotRemoved": { en: "Place removed from itinerary", zh: "已從行程移除景點" },
  "toast.slotFull": { en: "This slot is already full", zh: "此時段已滿" },

  // Theme
  "theme.light": { en: "Light", zh: "淺色" },
  "theme.dark": { en: "Dark", zh: "深色" },
  "theme.ocean": { en: "Ocean", zh: "海洋" },
  "theme.sunset": { en: "Sunset", zh: "夕陽" },
  "theme.forest": { en: "Forest", zh: "森林" },
  "theme.slate": { en: "Slate", zh: "石墨" },
  "theme.neon": { en: "Neon", zh: "霓虹" },
  "theme.brutalist": { en: "Brutalist", zh: "粗獷" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
