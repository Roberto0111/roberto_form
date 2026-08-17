export type Category = "燈具" | "飾品" | "酒具" | "家居" | "植栽" | "收納" | "廚房" | "寵物" | "辦公" | "衛浴" | "旅行" | "戶外";

export type Product = {
  name: string;
  zh: string;
  category: Category;
  image: string;
  lifestyle?: string;
  source: string;
  tag: string;
};

export type PriceEstimate = {
  material: "PLA" | "PETG";
  grams: number;
  hours: number;
  price: number;
  partsNote: string;
};

export const products: Product[] = [
  { name: "Large Illuminated Lunar Wall Lamp", zh: "月球發光壁燈", category: "燈具", image: "/products/lamp-01.webp", lifestyle: "/lifestyle/lunar-wall-lamp-scenes.webp", source: "https://makerworld.com/zh/models/2320985-large-illuminated-lunar-wall-lamp-version-2", tag: "氛圍照明" },
  { name: "Moon Lamp with Wavy Stand", zh: "波浪底座月球燈", category: "燈具", image: "/products/lamp-02.webp", lifestyle: "/lifestyle/moon-wavy-scenes.webp", source: "https://makerworld.com/zh/models/1266343-moon-lamp-with-wavy-stand-fuzzy-skin", tag: "桌上燈" },
  { name: "Lush Leaf Lamp", zh: "繁葉造型燈", category: "燈具", image: "/products/lamp-03.webp", lifestyle: "/lifestyle/lamp-leaf-scenes.webp", source: "https://makerworld.com/zh/models/1913623-lush-leaf-lamp-pendant-or-standing", tag: "吊燈／立燈" },
  { name: "Wavy Lamp E27", zh: "波浪 E27 燈", category: "燈具", image: "/products/lamp-04.webp", lifestyle: "/lifestyle/wavy-e27-scenes.webp", source: "https://makerworld.com/zh/models/965182-wavy-lamp-e27-e26-base-petg", tag: "現代風格" },
  { name: "Super Fast Print Lamp", zh: "極速列印桌燈", category: "燈具", image: "/products/lamp-05.webp", lifestyle: "/lifestyle/fast-lamp-scenes.webp", source: "https://makerworld.com/zh/models/2175648-led-kit-001-super-fast-print-lamp-55-mins-30g", tag: "輕量設計" },
  { name: "Jewelry Organizer Stand", zh: "首飾展示收納架", category: "飾品", image: "/products/jewelry-01.webp", lifestyle: "/lifestyle/jewelry-organizer-scenes.webp", source: "https://makerworld.com/zh/models/757412-jewelry-organizer-necklace-bracelet-ring-stand", tag: "項鍊／戒指" },
  { name: "Sculptural Jewelry Organizer", zh: "雕塑感首飾架", category: "飾品", image: "/products/jewelry-02.webp", lifestyle: "/lifestyle/sculptural-jewelry-scenes.webp", source: "https://makerworld.com/zh/models/1092762-jewelry-organizer", tag: "桌面收納" },
  { name: "Big Letter Beads", zh: "大型字母串珠", category: "飾品", image: "/products/jewelry-03.webp", lifestyle: "/lifestyle/letter-bead-scenes.webp", source: "https://makerworld.com/zh/models/2504346-big-letter-beads-5-inches", tag: "個人化" },
  { name: "Kumihimo Bracelet", zh: "組紐編織手環", category: "飾品", image: "/products/jewelry-04.webp", lifestyle: "/lifestyle/kumihimo-scenes.webp", source: "https://makerworld.com/zh/models/1391285-kumihimo-bracelet-8-strings", tag: "手環" },
  { name: "Custom Letter Beads", zh: "自訂字母珠", category: "飾品", image: "/products/jewelry-05.webp", lifestyle: "/lifestyle/custom-robert-beads-scenes.webp", source: "https://makerworld.com/zh/models/2587491-customizable-letter-beads-letter-beads", tag: "客製禮物" },
  { name: "Arboréa Jewelry Tree", zh: "Arboréa 首飾樹", category: "飾品", image: "/products/jewelry-06.webp", lifestyle: "/lifestyle/jewelry-tree-scenes.webp", source: "https://makerworld.com/zh/models/1391601-arborea-modern-jewelry-tree", tag: "展示設計" },
  { name: "Single-Hand Cap Shooter", zh: "單手瓶蓋發射開瓶器", category: "酒具", image: "/products/bar-01.webp", lifestyle: "/lifestyle/cap-shooter-scenes.webp", source: "https://makerworld.com/zh/models/2777068-single-hand-bottle-cap-shooter", tag: "派對小物" },
  { name: "Glass Beer Bottle Opener", zh: "玻璃瓶啤酒開瓶器", category: "酒具", image: "/products/bar-02.webp", lifestyle: "/lifestyle/glass-bottle-opener-scenes.webp", source: "https://makerworld.com/zh/models/2764241-glass-beer-bottle-opener", tag: "開瓶器" },
  { name: "Bottle Opener & Cap Gun", zh: "開瓶器與瓶蓋槍", category: "酒具", image: "/products/bar-03.webp", lifestyle: "/lifestyle/cap-gun-scenes.webp", source: "https://makerworld.com/zh/models/2128043-bottle-opener-and-cap-gun", tag: "趣味設計" },
  { name: "BeerCounter V5", zh: "啤酒計數開瓶器", category: "酒具", image: "/products/bar-04.webp", lifestyle: "/lifestyle/beer-counter-scenes.webp", source: "https://makerworld.com/zh/models/89566-beercounter-v5-bottle-opener", tag: "聚會神器" },
  { name: "2-in-1 Opener Keychain", zh: "二合一開瓶鑰匙圈", category: "酒具", image: "/products/bar-05.webp", lifestyle: "/lifestyle/keychain-opener-scenes.webp", source: "https://makerworld.com/zh/models/1246368-2-in-1-bottle-and-can-opener-keychain-gadget", tag: "隨身工具" },
  { name: "Beer Cap Launcher", zh: "啤酒瓶蓋發射器", category: "酒具", image: "/products/bar-06.webp", lifestyle: "/lifestyle/cap-launcher-scenes.webp", source: "https://makerworld.com/zh/models/2822922-beer-cap-launcher", tag: "派對玩具" },
  { name: "Entryway Organizer", zh: "玄關置物與鑰匙架", category: "家居", image: "/products/decor-01.webp", lifestyle: "/lifestyle/entryway-organizer-scenes.webp", source: "https://makerworld.com/zh/models/2699152-modern-entryway-organizer-shelf-with-key-hooks-q_c", tag: "玄關收納" },
  { name: "The High Voyager", zh: "太空旅人香座", category: "家居", image: "/products/decor-02.webp", lifestyle: "/lifestyle/alien-incense-scenes.webp", source: "https://makerworld.com/zh/models/2771297-the-high-voyager-incense-holder", tag: "香氛擺件" },
  { name: "Decorative HOME Tray", zh: "HOME 裝飾托盤", category: "家居", image: "/products/decor-03.webp", lifestyle: "/lifestyle/home-tray-scenes.webp", source: "https://makerworld.com/zh/models/2350771-decorative-tray-home", tag: "桌面選物" },
  { name: "Melting Wall Shelf", zh: "融化感造型壁架", category: "家居", image: "/products/decor-04.webp", lifestyle: "/lifestyle/melting-shelf-scenes.webp", source: "https://makerworld.com/zh/models/2211015-melting-wall-shelf-dripping-modern-shelf", tag: "牆面收納" },
  { name: "Hexagon Twisty Object", zh: "六角扭轉桌面擺件", category: "家居", image: "/products/decor-05.webp", lifestyle: "/lifestyle/twisty-fidget-scenes.webp", source: "https://makerworld.com/zh/models/2738294-hexagon-twisty-fidget-toy", tag: "互動擺件" },
  { name: "Modern Japandi Ribbed Plant Pot", zh: "日系侘寂條紋植栽盆", category: "植栽", image: "/products/planter-01.webp", lifestyle: "/lifestyle/planter-scenes.webp", source: "https://makerworld.com/zh/models/2414690-modern-japandi-ribbed-plant-pot-with-drainage", tag: "排水花盆" },
  { name: "The Claudia Planter", zh: "Claudia 雕塑植栽盆", category: "植栽", image: "/products/planter-02.webp", lifestyle: "/lifestyle/claudia-planter-scenes.webp", source: "https://makerworld.com/zh/models/1399976-the-claudia-planter-a-botany-chic-creation-decor", tag: "造型花器" },
  { name: "Mid Century Planter", zh: "世紀中期植栽盆", category: "植栽", image: "/products/planter-03.webp", lifestyle: "/lifestyle/midcentury-planter-scenes.webp", source: "https://makerworld.com/zh/models/1616690-mid-century-planter-with-built-in-drip-tray", tag: "內建滴水盤" },
  { name: "HydroSquare Rain Planter", zh: "水循環方形植栽燈", category: "植栽", image: "/products/planter-04.webp", lifestyle: "/lifestyle/rain-planter-scenes.webp", source: "https://makerworld.com/zh/models/2421936-led-kit-001-hydrosquare-rain-planter", tag: "植栽照明" },
  { name: "Japandi Self-Watering Pot", zh: "日系自動澆水花盆", category: "植栽", image: "/products/planter-05.webp", lifestyle: "/lifestyle/japandi-watering-scenes.webp", source: "https://makerworld.com/zh/models/1339226-japandi-plant-pot-3-versions-automatic-watering", tag: "自動澆水" },
  { name: "Modern Ribbed Planter", zh: "現代條紋花盆", category: "植栽", image: "/products/planter-06.webp", lifestyle: "/lifestyle/modern-ribbed-planter-scenes.webp", source: "https://makerworld.com/zh/models/2593518-modern-ribbed-planter-vase", tag: "花盆／花器" },
  { name: "Japandi Planter with Stand", zh: "日系腳架植栽盆", category: "植栽", image: "/products/planter-07.webp", lifestyle: "/lifestyle/japandi-stand-planter-scenes.webp", source: "https://makerworld.com/zh/models/2534523-japandi-planter-hidden-drip-tray-stand", tag: "隱藏滴水盤" },
  { name: "Wall-Mounted Ball Plant Pot", zh: "壁掛球形植栽盆", category: "植栽", image: "/products/planter-08.webp", lifestyle: "/lifestyle/wall-ball-planter-scenes.webp", source: "https://makerworld.com/zh/models/1272196-wall-mounted-ball-plant-pot", tag: "牆面綠意" },
  { name: "Infinity Spool Tower", zh: "無限延伸線材收納塔", category: "收納", image: "/products/storage-01.webp", lifestyle: "/lifestyle/spool-tower-scenes.webp", source: "https://makerworld.com/zh/models/2172346-infinity-spool-tower-the-ultimate-storage-solution", tag: "模組系統" },
  { name: "Modular Desk Organizer", zh: "模組桌面收納系統", category: "收納", image: "/products/storage-02.webp", lifestyle: "/lifestyle/modular-desk-scenes.webp", source: "https://makerworld.com/zh/models/2087511-modular-desk-organizer-system-magsafe-phone-stand", tag: "手機架" },
  { name: "Stackable Organizer Drawers", zh: "可堆疊桌面抽屜", category: "收納", image: "/products/storage-03.webp", lifestyle: "/lifestyle/drawer-organizer-scenes.webp", source: "https://makerworld.com/zh/models/1889262-stackable-desktop-organizer-with-drawers", tag: "抽屜收納" },
  { name: "Ribbed Sliding-Lid Box", zh: "條紋滑蓋收納盒", category: "收納", image: "/products/storage-04.webp", lifestyle: "/lifestyle/ribbed-box-scenes.webp", source: "https://makerworld.com/zh/models/2115383-sliding-lid-storage-box-organizer-ribbed-design", tag: "滑蓋設計" },
  { name: "Clean Modular Organizer", zh: "極簡模組桌面收納", category: "收納", image: "/products/storage-05.webp", lifestyle: "/lifestyle/modular-organizer-scenes.webp", source: "https://makerworld.com/zh/models/2734467-stackable-desktop-organizer-clean-modular", tag: "可堆疊" },
  { name: "Hollow Storage Basket", zh: "鏤空堆疊收納籃", category: "收納", image: "/products/storage-06.webp", lifestyle: "/lifestyle/hollow-basket-scenes.webp", source: "https://makerworld.com/zh/models/2583249-exquisite-and-high-end-sturdy-and-practical-stacka", tag: "居家收納" },
  { name: "Post-It Note Holder", zh: "便利貼與模板收納座", category: "收納", image: "/products/storage-07.webp", lifestyle: "/lifestyle/postit-holder-scenes.webp", source: "https://makerworld.com/zh/models/931302-holder-for-post-it-notes-stencils-included", tag: "文具收納" },
  { name: "Under-Shelf Organizer", zh: "層板下方小型收納盒", category: "收納", image: "/products/storage-08.webp", lifestyle: "/lifestyle/under-shelf-scenes.webp", source: "https://makerworld.com/zh/models/1962101-under-shelf-organizer-small-version", tag: "空間利用" },
  { name: "Monstera Leaf Coaster Set", zh: "龜背芋杯墊組", category: "廚房", image: "/products/kitchen-01.webp", lifestyle: "/lifestyle/monstera-coaster-scenes.webp", source: "https://makerworld.com/zh/models/1658083-monstera-leaf-coaster-set-with-holder", tag: "餐桌佈置" },
  { name: "HydroBowl Produce Washer", zh: "蔬果瀝水清洗碗", category: "廚房", image: "/products/kitchen-02.webp", lifestyle: "/lifestyle/hydrobowl-scenes.webp", source: "https://makerworld.com/zh/models/1507073-hydrobowl-smart-fruit-veggie-washer", tag: "料理工具" },
  { name: "Rolling Egg Rack", zh: "滾動式堆疊蛋架", category: "廚房", image: "/products/kitchen-03.webp", lifestyle: "/lifestyle/egg-rack-scenes.webp", source: "https://makerworld.com/zh/models/1681075-egg-rolling-stacking-rack", tag: "冰箱收納" },
  { name: "Under-Shelf Fridge Drawer", zh: "冰箱層板下抽屜", category: "廚房", image: "/products/kitchen-04.webp", lifestyle: "/lifestyle/fridge-drawer-scenes.webp", source: "https://makerworld.com/zh/models/2018739-under-glass-fridge-drawer-container-with-clip", tag: "冰箱收納" },
  { name: "Spoon and Lid Stand", zh: "鍋蓋與湯匙料理架", category: "廚房", image: "/products/kitchen-05.webp", lifestyle: "/lifestyle/spoon-lid-stand-scenes.webp", source: "https://makerworld.com/zh/models/2076811-kitchen-utensil-holder-spoon-and-lid-stand", tag: "料理檯面" },
  { name: "Mini Bag Clip", zh: "迷你密封袋夾", category: "廚房", image: "/products/kitchen-06.webp", lifestyle: "/lifestyle/mini-clip-scenes.webp", source: "https://makerworld.com/zh/models/1101226-mini-bag-clip", tag: "食品保存" },
  { name: "Wavy Capsule Organizer", zh: "波浪咖啡膠囊架", category: "廚房", image: "/products/kitchen-07.webp", lifestyle: "/lifestyle/wavy-capsule-scenes.webp", source: "https://makerworld.com/zh/models/1452640-wavy-design-nespresso-capsule-holder-organizer", tag: "咖啡角落" },
  { name: "Rotating Capsule Holder", zh: "旋轉咖啡膠囊塔", category: "廚房", image: "/products/kitchen-09.webp", lifestyle: "/lifestyle/rotating-capsule-scenes.webp", source: "https://makerworld.com/zh/models/2138627-rotating-nespresso-capsule-holder", tag: "咖啡收納" },
  { name: "Potato Spiraler", zh: "馬鈴薯螺旋切片器", category: "廚房", image: "/products/kitchen-10.webp", lifestyle: "/lifestyle/potato-spiraler-scenes.webp", source: "https://makerworld.com/zh/models/1169701-potato-spiraler-3d-printable-kitchen-tool", tag: "創意料理" },
  { name: "Onami Bowl Raiser", zh: "波浪寵物碗增高架", category: "寵物", image: "/products/pet-01.webp", lifestyle: "/lifestyle/pet-bowl-scenes.webp", source: "https://makerworld.com/zh/models/1794239-onami-pet-food-bowl-raiser-stand", tag: "用餐姿勢" },
  { name: "Automatic Pet Feeder", zh: "造型自動寵物餵食器", category: "寵物", image: "/products/pet-02.webp", lifestyle: "/lifestyle/pet-feeder-scenes.webp", source: "https://makerworld.com/zh/models/3037139-auto-pet-feeder-module-thermonuclear-reactor", tag: "定時餵食" },
  { name: "Spartan Cat Helmet", zh: "斯巴達貓咪造型帽", category: "寵物", image: "/products/pet-03.webp", lifestyle: "/lifestyle/spartan-cat-scenes.webp", source: "https://makerworld.com/zh/models/2385611-spartan-warrior-cat-helmet", tag: "趣味攝影" },
  { name: "Pet Grooming Brush", zh: "寵物日常梳毛刷", category: "寵物", image: "/products/pet-04.webp", lifestyle: "/lifestyle/pet-brush-scenes.webp", source: "https://makerworld.com/zh/models/632101-purrfect-grooming-brush-easy-to-print-strong", tag: "日常清潔" },
  { name: "Self-Filling Water Bowl", zh: "寵物自動補水碗", category: "寵物", image: "/products/pet-05.webp", lifestyle: "/lifestyle/self-fill-bowl-scenes.webp", source: "https://makerworld.com/zh/models/557391-self-filling-pet-water-bowl-cats-and-small-dogs", tag: "飲水用品" },
  { name: "Poop Bag Dispenser", zh: "狗狗拾便袋收納器", category: "寵物", image: "/products/pet-06.webp", lifestyle: "/lifestyle/poop-bag-scenes.webp", source: "https://makerworld.com/zh/models/549889-dog-poop-bags-roll-dispenser", tag: "散步用品" },
  { name: "Cat Construction Helmet", zh: "貓咪工程造型帽", category: "寵物", image: "/products/pet-07.webp", lifestyle: "/lifestyle/cat-helmet-scenes.webp", source: "https://makerworld.com/zh/models/2397581-catsite-construction-helmet-for-cats", tag: "趣味攝影" },
  { name: "TrailBuddy Travel Bowl", zh: "二合一寵物旅行碗", category: "寵物", image: "/products/pet-08.webp", lifestyle: "/lifestyle/trailbuddy-scenes.webp", source: "https://makerworld.com/zh/models/1358156-trailbuddy-2-in-1-dog-water-treat-bowl", tag: "戶外散步" },
  { name: "Cat Jewelry Tray", zh: "貓咪造型首飾托盤", category: "寵物", image: "/products/pet-09.webp", lifestyle: "/lifestyle/cat-jewelry-tray-scenes.webp", source: "https://makerworld.com/zh/models/1650538-cat-jewelry-tray-playful-animal-home-organizer", tag: "寵物系家居" },
  { name: "Cat Phone Stand", zh: "可愛貓咪手機架", category: "寵物", image: "/products/pet-10.webp", lifestyle: "/lifestyle/cat-phone-stand-scenes.webp", source: "https://makerworld.com/zh/models/1772567-kawaii-style-cat-phone-stand", tag: "桌面小物" },
  { name: "Office Organizer & Phone Holder", zh: "辦公收納與手機架", category: "辦公", image: "/products/office-01.webp", lifestyle: "/lifestyle/office-organizer-scenes.webp", source: "https://makerworld.com/zh/models/1726061-office-desk-organizer-with-integrated-phone-holder", tag: "桌面整合" },
  { name: "Ninja Pen Holder", zh: "忍者造型筆筒", category: "辦公", image: "/products/office-02.webp", lifestyle: "/lifestyle/ninja-pen-scenes.webp", source: "https://makerworld.com/zh/models/2254330-ninja-pen-holder-custom-desk-decoration", tag: "趣味筆筒" },
  { name: "Pattern Cable Box", zh: "圖紋電線收納盒", category: "辦公", image: "/products/office-03.webp", lifestyle: "/lifestyle/cable-box-scenes.webp", source: "https://makerworld.com/zh/models/1689678-cable-organizer-box-multiple-patterns", tag: "線材整理" },
  { name: "Burrow Desk Organizer", zh: "洞穴式桌面收納座", category: "辦公", image: "/products/office-04.webp", lifestyle: "/lifestyle/burrow-organizer-scenes.webp", source: "https://makerworld.com/zh/models/2422868-burrow-desk-organiser-organizer", tag: "文具收納" },
  { name: "Heavy Duty Wall Bracket", zh: "高承重壁面層架架", category: "辦公", image: "/products/office-05.webp", lifestyle: "/lifestyle/wall-bracket-scenes.webp", source: "https://makerworld.com/zh/models/697743-heavy-duty-wall-bracket", tag: "壁面機能" },
  { name: "Crumpled Bag Pen Holder", zh: "皺紙袋造型筆筒", category: "辦公", image: "/products/office-06.webp", lifestyle: "/lifestyle/crumpled-pen-scenes.webp", source: "https://makerworld.com/zh/models/2630368-crumpled-paper-bag-pen-holder-desk-organizer", tag: "雕塑收納" },
  { name: "Scandinavian Organizer", zh: "北歐多用途收納盒", category: "辦公", image: "/products/office-07.webp", lifestyle: "/lifestyle/scandinavian-organizer-scenes.webp", source: "https://makerworld.com/zh/models/1986918-scandinavian-makeup-bath-kitchen-organiser-3", tag: "多用途" },
  { name: "Japandi Tray", zh: "日系侘寂桌面托盤", category: "辦公", image: "/products/office-08.webp", lifestyle: "/lifestyle/japandi-tray-scenes.webp", source: "https://makerworld.com/zh/models/2419531-japandi-tray", tag: "桌面佈置" },
  { name: "Stackable Modular Shelf", zh: "可堆疊模組桌上架", category: "辦公", image: "/products/office-09.webp", lifestyle: "/lifestyle/modular-shelf-scenes.webp", source: "https://makerworld.com/zh/models/2474195-stackable-modular-shelf-24x16-cm-2-3-levels", tag: "模組層架" },
  { name: "Stackable Baskets", zh: "可堆疊桌面收納籃", category: "辦公", image: "/products/office-10.webp", lifestyle: "/lifestyle/stackable-baskets-scenes.webp", source: "https://makerworld.com/zh/models/1526459-stackable-baskets", tag: "文件收納" },
  { name: "Brush & Paste Holder", zh: "牙刷牙膏瀝水座", category: "衛浴", image: "/products/bath-01.webp", lifestyle: "/lifestyle/toothbrush-holder-scenes.webp", source: "https://makerworld.com/zh/models/644568-toothbrush-and-toothpaste-holder", tag: "洗漱收納" },
  { name: "Toothpaste Squeezer", zh: "棘輪式牙膏擠壓器", category: "衛浴", image: "/products/bath-02.webp", lifestyle: "/lifestyle/toothpaste-squeezer-scenes.webp", source: "https://makerworld.com/zh/models/30246-ratcheted-toothpaste-tube-squeezer", tag: "日常機能" },
  { name: "Compartment Roll Holder", zh: "分層衛生紙收納架", category: "衛浴", image: "/products/bath-03.webp", lifestyle: "/lifestyle/roll-holder-scenes.webp", source: "https://makerworld.com/zh/models/1636314-compartment-toilet-paper-holder", tag: "衛浴收納" },
  { name: "Ribbed Soap Dispenser", zh: "條紋質感給皂瓶", category: "衛浴", image: "/products/bath-04.webp", lifestyle: "/lifestyle/soap-dispenser-scenes.webp", source: "https://makerworld.com/zh/models/1941319-aesthetic-soap-dispenser", tag: "檯面美化" },
  { name: "Bow Container", zh: "蝴蝶結造型收納罐", category: "衛浴", image: "/products/bath-05.webp", lifestyle: "/lifestyle/bow-container-scenes.webp", source: "https://makerworld.com/zh/models/2377183-bow-container-with-lid", tag: "小物收納" },
  { name: "Pads & Swabs Organizer", zh: "化妝棉與棉花棒收納", category: "衛浴", image: "/products/bath-06.webp", lifestyle: "/lifestyle/pads-swabs-scenes.webp", source: "https://makerworld.com/zh/models/2151198-pads-swabs-holder-ribbed-bath-organizer", tag: "梳妝整理" },
  { name: "Gravity Towel Hook", zh: "條紋重力毛巾掛勾", category: "衛浴", image: "/products/bath-07.webp", lifestyle: "/lifestyle/bath-towel-hook-scenes.webp", source: "https://makerworld.com/zh/models/1971172-auto-locking-hanger-gravity-towel-hook-ribbed", tag: "毛巾收納" },
  { name: "Hair Dryer Holder", zh: "吹風機壁掛收納座", category: "衛浴", image: "/products/bath-08.webp", lifestyle: "/lifestyle/hair-dryer-holder-scenes.webp", source: "https://makerworld.com/zh/models/1909827-dyson-dryer-holder", tag: "壁面整理" },
  { name: "Travel Brush Holder", zh: "旅行牙刷保護盒", category: "衛浴", image: "/products/bath-09.webp", lifestyle: "/lifestyle/travel-brush-holder-scenes.webp", source: "https://makerworld.com/zh/models/2106307-travel-toothbrush-holder", tag: "旅行用品" },
  { name: "Stackable Roll Dispenser", zh: "可堆疊衛生紙補充盒", category: "衛浴", image: "/products/bath-10.webp", lifestyle: "/lifestyle/stackable-roll-scenes.webp", source: "https://makerworld.com/zh/models/2104783-simple-stackable-toilet-roll-dispenser-max", tag: "備品收納" },
  { name: "Multi-Purpose Hygiene Kit", zh: "多功能旅行盥洗盒", category: "旅行", image: "/products/travel-01.webp", lifestyle: "/lifestyle/travel-hygiene-scenes.webp", source: "https://makerworld.com/zh/models/714018-multi-purpose-hygiene-kit", tag: "盥洗收納" },
  { name: "Toothbrush Head Travel Case", zh: "電動牙刷頭旅行盒", category: "旅行", image: "/products/travel-02.webp", lifestyle: "/lifestyle/toothbrush-head-scenes.webp", source: "https://makerworld.com/zh/models/703962-oral-b-toothbrush-head-travel-case", tag: "衛生防護" },
  { name: "Travel Boxes", zh: "輕巧旅行分類盒", category: "旅行", image: "/products/travel-03.webp", lifestyle: "/lifestyle/travel-boxes-scenes.webp", source: "https://makerworld.com/zh/models/702774-travel-boxes", tag: "行李整理" },
  { name: "USB-A to USB-C Cable Organizer", zh: "USB-A 旅行線材收納器", category: "旅行", image: "/products/travel-04.webp", lifestyle: "/lifestyle/travel-cable-scenes.webp", source: "https://makerworld.com/zh/models/709889-travel-cable-organizer-usb-a-to-usb-c", tag: "線材整理" },
  { name: "USB-C Cable Organizer", zh: "USB-C 旅行線材收納器", category: "旅行", image: "/products/travel-05.webp", lifestyle: "/lifestyle/usb-c-organizer-scenes.webp", source: "https://makerworld.com/zh/models/716789-travel-cable-organizer-usb-c-to-usb-c", tag: "充電配件" },
  { name: "Stackable Travel Capsule", zh: "可堆疊旅行膠囊盒", category: "旅行", image: "/products/travel-06.webp", lifestyle: "/lifestyle/travel-capsule-scenes.webp", source: "https://makerworld.com/zh/models/710610-stackable-container-capsule-modular-organizer", tag: "模組收納" },
  { name: "Retro Luggage Tags", zh: "復古趣味行李吊牌", category: "旅行", image: "/products/travel-07.webp", lifestyle: "/lifestyle/retro-luggage-scenes.webp", source: "https://makerworld.com/zh/models/698438-retro-fun-perfect-luggage-tags-for-you", tag: "行李識別" },
  { name: "Customizable Luggage Tags", zh: "個人化文字行李牌", category: "旅行", image: "/products/travel-08.webp", lifestyle: "/lifestyle/custom-luggage-scenes.webp", source: "https://makerworld.com/zh/models/712323-customizable-luggage-tags-practical-stylish", tag: "姓名訂製" },
  { name: "Luggage Tag Collection", zh: "多款式行李牌組", category: "旅行", image: "/products/travel-09.webp", lifestyle: "/lifestyle/luggage-collection-scenes.webp", source: "https://makerworld.com/zh/models/695070-luggage-tag-collection", tag: "旅行配色" },
  { name: "Custom QR Luggage Tag", zh: "自訂 QR 行李吊牌", category: "旅行", image: "/products/travel-10.webp", lifestyle: "/lifestyle/qr-luggage-scenes.webp", source: "https://makerworld.com/zh/models/710726-custom-qr-code-luggage-bag-tag", tag: "智慧識別" },
  { name: "Fire Making Wallet Kit", zh: "隨身生火工具卡盒", category: "戶外", image: "/products/outdoor-01.webp", lifestyle: "/lifestyle/fire-wallet-scenes.webp", source: "https://makerworld.com/zh/models/219603-fire-making-wallet-kit", tag: "露營工具" },
  { name: "Tick Card with Coin", zh: "戶外除蜱工具卡", category: "戶外", image: "/products/outdoor-02.webp", lifestyle: "/lifestyle/tick-card-scenes.webp", source: "https://makerworld.com/zh/models/596736-tick-card-with-coin", tag: "隨身防護" },
  { name: "Tick Remover", zh: "輕巧除蜱工具", category: "戶外", image: "/products/outdoor-03.webp", lifestyle: "/lifestyle/tick-remover-scenes.webp", source: "https://makerworld.com/zh/models/53207-tick-remover", tag: "寵物／健行" },
  { name: "Snap-On Can Cap", zh: "卡扣式飲料罐防塵蓋", category: "戶外", image: "/products/outdoor-04.webp", lifestyle: "/lifestyle/can-cap-scenes.webp", source: "https://makerworld.com/zh/models/517587-snap-on-can-cap-edmonton-oilers-version", tag: "飲品防護" },
  { name: "Playing Card Storage Box", zh: "露營撲克牌收納盒", category: "戶外", image: "/products/outdoor-05.webp", lifestyle: "/lifestyle/card-box-scenes.webp", source: "https://makerworld.com/zh/models/424195-standard-deck-of-card-storage-box", tag: "營地娛樂" },
  { name: "Camping Chair Feet", zh: "露營椅防陷腳墊", category: "戶外", image: "/products/outdoor-06.webp", lifestyle: "/lifestyle/chair-feet-scenes.webp", source: "https://makerworld.com/zh/models/187543-helinox-chair-feet", tag: "椅具配件" },
  { name: "Camp Chair Cup Holder", zh: "露營椅側掛杯架", category: "戶外", image: "/products/outdoor-07.webp", lifestyle: "/lifestyle/camp-chair-tray-scenes.webp", source: "https://makerworld.com/zh/models/624983-camp-chair-cup-holder", tag: "飲品收納" },
  { name: "Backpacking Chair Sand Adaptor", zh: "背包椅沙地防陷轉接座", category: "戶外", image: "/products/outdoor-08.webp", lifestyle: "/lifestyle/sand-adaptor-scenes.webp", source: "https://makerworld.com/zh/models/745036-backpacking-chair-adaptor-to-prevent-sinking-chair", tag: "沙地機能" },
  { name: "Camping Spice Rack", zh: "旅行露營香料罐架", category: "戶外", image: "/products/outdoor-09.webp", lifestyle: "/lifestyle/camping-spice-scenes.webp", source: "https://makerworld.com/zh/models/704086-travel-camping-spice-rack-with-containers", tag: "戶外料理" },
  { name: "Beach Table with Umbrella", zh: "迷你遮陽傘海灘桌", category: "戶外", image: "/products/outdoor-10.webp", lifestyle: "/lifestyle/beach-table-scenes.webp", source: "https://makerworld.com/zh/models/484308-table-with-umbrella-for-beach-pool-or-camping", tag: "海灘野餐" },
];

const priceProfiles: Record<Category, { grams: number; handling: number; material: "PLA" | "PETG"; detailHours: number; min: number; max: number }> = {
  燈具: { grams: 250, handling: 150, material: "PLA", detailHours: 1.6, min: 650, max: 2400 },
  飾品: { grams: 75, handling: 75, material: "PLA", detailHours: 0.7, min: 200, max: 700 },
  酒具: { grams: 60, handling: 85, material: "PETG", detailHours: 0.8, min: 250, max: 700 },
  家居: { grams: 150, handling: 95, material: "PLA", detailHours: 1, min: 450, max: 1500 },
  植栽: { grams: 210, handling: 110, material: "PETG", detailHours: 0.8, min: 500, max: 1800 },
  收納: { grams: 170, handling: 100, material: "PLA", detailHours: 1.1, min: 350, max: 1400 },
  廚房: { grams: 105, handling: 90, material: "PETG", detailHours: 0.8, min: 250, max: 1200 },
  寵物: { grams: 115, handling: 95, material: "PETG", detailHours: 1, min: 250, max: 1500 },
  辦公: { grams: 140, handling: 100, material: "PLA", detailHours: 0.9, min: 350, max: 1300 },
  衛浴: { grams: 90, handling: 90, material: "PETG", detailHours: 0.8, min: 250, max: 1000 },
  旅行: { grams: 60, handling: 80, material: "PLA", detailHours: 0.7, min: 180, max: 650 },
  戶外: { grams: 85, handling: 90, material: "PETG", detailHours: 0.8, min: 250, max: 1000 },
};

export const estimatePrice = (product: Product): PriceEstimate => {
  const profile = priceProfiles[product.category];
  const nameScore = Array.from(product.name).reduce((total, character) => total + character.charCodeAt(0), 0);
  let sizeFactor = 0.82 + (nameScore % 7) * 0.06;

  if (/Large|Lush Leaf|Wall Lamp|Infinity|HydroSquare|Automatic Pet Feeder|Self-Filling|Stackable Modular Shelf|Beach Table|Fridge Drawer/.test(product.name)) {
    sizeFactor *= 1.55;
  } else if (/Mini|Keychain|Beads|Bracelet|Clip|Tag|Tick|Can Cap|Poop Bag|Toothpaste Squeezer/.test(product.name)) {
    sizeFactor *= 0.52;
  } else if (/Organizer|Drawers|Basket|Rack|Shelf|Planter|Bowl|Lamp|Holder|Stand|Box/.test(product.name)) {
    sizeFactor *= 1.08;
  }

  let grams = Math.max(8, Math.round((profile.grams * sizeFactor) / 5) * 5);
  let hours = Math.max(0.3, Math.round((grams / 32 + profile.detailHours) * 10) / 10);
  let material = profile.material;
  let partsCost = product.category === "燈具" ? 180 : product.category === "酒具" ? 30 : 0;
  let partsNote = product.category === "燈具" ? "含基本燈組估算" : product.category === "酒具" ? "含基本五金估算" : "列印本體與基本後處理";

  if (product.name === "Wavy Lamp E27") material = "PETG";
  if (/HydroSquare|Automatic Pet Feeder/.test(product.name)) {
    partsCost = 350;
    partsNote = "含基礎模組估算，規格另確認";
  }
  if (product.name === "Super Fast Print Lamp") {
    grams = 30;
    hours = 0.9;
    partsCost = 180;
  }

  const materialRate = material === "PETG" ? 1.35 : 1.2;
  const costBasis = grams * materialRate + hours * 18 + profile.handling + partsCost;
  const roundedPrice = Math.round((costBasis * 1.65) / 50) * 50;
  const price = Math.min(profile.max, Math.max(profile.min, roundedPrice));

  return { material, grams, hours, price, partsNote };
};

export const formatPrice = (price: number) => `NT$${price.toLocaleString("zh-TW")}`;

