"use client";

import { useMemo, useState } from "react";

type Category = "燈具" | "飾品" | "酒具" | "家居" | "植栽" | "收納" | "廚房" | "寵物" | "辦公" | "衛浴" | "旅行" | "戶外";

type Product = {
  name: string;
  zh: string;
  category: Category;
  image: string;
  lifestyle?: string;
  source: string;
  tag: string;
};

type PriceEstimate = {
  material: "PLA" | "PETG";
  grams: number;
  hours: number;
  price: number;
  partsNote: string;
};

const products: Product[] = [
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

const filters = ["全部", "燈具", "飾品", "酒具", "家居", "植栽", "收納", "廚房", "寵物", "辦公", "衛浴", "旅行", "戶外"] as const;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

const categoryNotes: Record<Category, { use: string; styling: string; custom: string }> = {
  燈具: { use: "作為床邊、閱讀角或餐桌旁的柔和輔助光，讓造型與光影一起成為焦點。", styling: "搭配木質、亞麻與低彩度牆面，能放大燈罩層次與列印紋理。", custom: "可依空間洽詢燈罩色彩、尺寸與底座搭配，並確認適用燈組。" },
  飾品: { use: "集中展示戒指、手環與項鍊，拿取方便，也讓每天的搭配一目了然。", styling: "放在梳妝台或玄關，以首飾金屬色對比霧面材質，形成精緻層次。", custom: "可洽詢高度、分枝配置、姓名字樣與適合首飾數量的尺寸。" },
  酒具: { use: "適合家庭聚會、吧台與野餐開瓶使用，兼具互動感與收納機能。", styling: "搭配木托盤、透明玻璃與深色桌面，營造輕鬆但有設計感的飲酒角落。", custom: "可洽詢握柄色彩、尺寸、文字與適合瓶蓋規格；製作前確認結構強度。" },
  家居: { use: "放置鑰匙、香氛與日常小物，或單獨作為空間中的雕塑擺件。", styling: "適合玄關、層架與茶几，搭配石材、木質與留白能凸顯輪廓。", custom: "可依擺放位置洽詢尺寸、表面質感與符合室內色票的配色。" },
  植栽: { use: "承接小型觀葉、多肉或香草植物，依款式提供排水、滴水或壁掛功能。", styling: "以同色系花器成組陳列，搭配木架與自然光，建立有節奏的綠意角落。", custom: "可依盆徑、根系與澆水方式洽詢尺寸、排水孔及托盤配置。" },
  收納: { use: "整理桌面、層板與櫃內零散物件，利用堆疊或模組結構提高空間效率。", styling: "以兩至三種低彩度色分區，搭配標籤與整齊留白，視覺更清爽。", custom: "可洽詢格數、抽屜高度、堆疊方式與現有空間的精準尺寸。" },
  廚房: { use: "用於料理備料、餐具暫放、冰箱分類或咖啡角落的日常整理。", styling: "搭配淺木、白色檯面與不鏽鋼器具，維持乾淨實用的料理視覺。", custom: "可依器具與櫃體尺寸調整；接觸食物或高溫前會先確認合適材料與用途。" },
  寵物: { use: "協助飲水、餵食、梳理、散步或趣味攝影，讓日常照護更順手。", styling: "以居家主色搭配寵物用品，讓碗架與收納配件自然融入空間。", custom: "可依寵物體型、用品規格與姓名洽詢高度、尺寸及配色。" },
  辦公: { use: "集中筆具、手機、文件與線材，減少桌面干擾並保留快速拿取動線。", styling: "用同色系模組搭配木桌與金屬文具，建立安靜、清楚的工作區。", custom: "可依桌深、用品數量、線材出口與企業色洽詢尺寸及模組組合。" },
  衛浴: { use: "整理盥洗用品、毛巾與備品，讓檯面保持乾燥並縮短早晚拿取時間。", styling: "搭配石紋檯面、霧面五金與柔和中性色，營造乾淨的飯店感。", custom: "可依瓶罐、壁面與抽屜尺寸洽詢配色、排水方式與安裝結構。" },
  旅行: { use: "在行李箱、盥洗包或隨身包中分類線材、衛生用品與小型必需品。", styling: "以一致色系區分用途，搭配布質收納袋，打開行李時依然整齊清楚。", custom: "可洽詢姓名、QR 資訊、容量、分隔與符合行李配色的客製版本。" },
  戶外: { use: "服務露營、健行、沙灘與野餐情境，讓飲品、椅具與小工具更好使用。", styling: "選擇高辨識度色彩搭配帆布、木質與金屬裝備，兼顧安全與風格。", custom: "可依裝備規格、固定方式與戶外環境洽詢尺寸、色彩及耐候材料。" },
};

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

const estimatePrice = (product: Product): PriceEstimate => {
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

const formatPrice = (price: number) => `NT$${price.toLocaleString("zh-TW")}`;

export default function Home() {
  const [active, setActive] = useState<(typeof filters)[number]>("全部");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const selectedPricing = selected ? estimatePrice(selected) : null;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (active === "全部" || product.category === active) &&
        (!q ||
          `${product.name} ${product.zh} ${product.tag} ${product.category}`
            .toLowerCase()
            .includes(q)),
    );
  }, [active, query]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ROBERT FORM 首頁">
          <span className="brand-mark">RF</span>
          <span>ROBERT <span className="brand-light">FORM</span></span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#catalog">選品目錄</a>
          <a href="#pricing">定價方式</a>
          <a href="#process">訂製流程</a>
          <a href="#about">關於作品</a>
        </nav>
        <a className="header-cta" href="#custom-order">
          <span aria-hidden="true" />立即詢問訂製 ↘
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">3D PRINTED OBJECTS · CURATED DAILY</p>
          <h1>把想像，<br />印成生活的形狀。</h1>
          <p className="hero-intro">
            從燈光、飾品到派對酒具，探索適合空間與日常的 3D 列印設計。
            選一個喜歡的方向，我們再一起調整顏色、尺寸與細節。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#catalog">瀏覽 97 件選品 <span>↘</span></a>
            <a className="text-button" href="#process">了解訂製方式 →</a>
          </div>
          <div className="hero-stats" aria-label="目錄資訊">
            <div><strong>97</strong><span>精選設計</span></div>
            <div><strong>12</strong><span>生活系列</span></div>
            <div><strong>∞</strong><span>客製可能</span></div>
          </div>
        </div>
        <div className="hero-collage" aria-label="精選作品">
          <figure className="hero-main"><img src={assetPath("/products/lamp-03.webp")} alt="繁葉造型燈" /></figure>
          <figure className="hero-small top"><img src={assetPath("/products/jewelry-06.webp")} alt="首飾樹" /></figure>
          <figure className="hero-small bottom"><img src={assetPath("/products/bar-04.webp")} alt="啤酒計數開瓶器" /></figure>
          <span className="orbit-label">FORM · FUNCTION · PLAY ·</span>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CATALOGUE / 01</p>
            <h2>尋找你的下一件作品</h2>
          </div>
          <p>挑選喜歡的商品，直接查看標準尺寸參考售價、預估耗材與列印時間，再洽詢顏色、尺寸與授權。</p>
        </div>

        <div className="catalog-tools">
          <div className="filters" role="group" aria-label="商品分類">
            {filters.map((filter) => (
              <button
                key={filter}
                className={active === filter ? "active" : ""}
                onClick={() => setActive(filter)}
                aria-pressed={active === filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <label className="search">
            <span>搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="燈、收納、開瓶器…"
            />
          </label>
        </div>

        <div className="product-grid">
          {shown.map((product, index) => {
            const pricing = estimatePrice(product);
            return (
            <article className="product-card" key={`${product.name}-${index}`}>
              <button
                type="button"
                className="product-image"
                onClick={() => setSelected(product)}
                aria-label={`查看 ${product.zh} 的使用情境`}
              >
                <img src={assetPath(product.image)} alt={product.zh} loading="lazy" />
                <span className="view-source">查看使用情境 ↗</span>
                <span className="index">{String(index + 1).padStart(2, "0")}</span>
              </button>
              <div className="product-meta">
                <div>
                  <p>{product.category} · {product.tag}</p>
                  <h3>{product.zh}</h3>
                  <span>{product.name}</span>
                  <div className="product-price">
                    <strong>{formatPrice(pricing.price)} 起</strong>
                    <small>約 {pricing.hours} 小時 · {pricing.material} {pricing.grams}g</small>
                  </div>
                </div>
                <span className="custom-badge">標準尺寸估價</span>
              </div>
            </article>
          )})}
        </div>
        {shown.length === 0 && <p className="empty">找不到符合條件的作品，換個關鍵字試試看。</p>}
      </section>

      {selected && selectedPricing && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-label={`${selected.zh} 商品介紹`}>
          <button className="modal-backdrop" onClick={() => setSelected(null)} aria-label="關閉商品介紹" />
          <article className="modal-panel">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="關閉">×</button>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{selected.category} · {selected.tag}</p>
                <h2>{selected.zh}</h2>
                <span>{selected.name}</span>
              </div>
              <div className="modal-price">
                <span>標準尺寸參考售價</span>
                <strong>{formatPrice(selectedPricing.price)} 起</strong>
                <small>可洽詢顏色與尺寸</small>
              </div>
            </div>
            <div className="modal-gallery">
              <figure className="modal-main-image"><img src={assetPath(selected.image)} alt={`${selected.zh} 商品照`} /></figure>
              {selected.lifestyle ? (
                <figure className="modal-lifestyle">
                  <img src={assetPath(selected.lifestyle)} alt={`${selected.zh} 的三種使用與空間搭配情境`} />
                </figure>
              ) : (
                <div className="styling-placeholder">
                  <span>ROBERT FORM · STYLING NOTE</span>
                  <h3>把它放進你的生活</h3>
                  <p>適合玄關、書桌、餐廚或送禮情境。可依空間調整色彩、尺寸與表面質感。</p>
                  <div className="swatches" aria-label="建議配色">
                    <i className="swatch ivory" /><i className="swatch olive" /><i className="swatch clay" /><i className="swatch ink" />
                  </div>
                </div>
              )}
            </div>
            <div className="use-grid">
              <div><span>01</span><h3>怎麼使用</h3><p>{categoryNotes[selected.category].use}</p></div>
              <div><span>02</span><h3>怎麼搭配</h3><p>{categoryNotes[selected.category].styling}</p></div>
              <div><span>03</span><h3>怎麼訂製</h3><p>{categoryNotes[selected.category].custom} 正式製作前會先確認可用授權。</p></div>
            </div>
            <div className="estimate-panel" aria-label="製作與價格估算">
              <div><span>預估耗材</span><strong>{selectedPricing.material} {selectedPricing.grams}g</strong></div>
              <div><span>預估列印</span><strong>約 {selectedPricing.hours} 小時</strong></div>
              <div><span>價格包含</span><strong>{selectedPricing.partsNote}</strong></div>
              <p>以標準尺寸、單色與一般層高估算；實際售價會依切片結果、顏色、尺寸、支撐、多色換料、零件與原作商用授權調整。</p>
            </div>
            <div className="modal-actions">
              <a
                className="modal-cta instagram"
                href="https://www.instagram.com/radish_studio_/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setSelected(null)}
              >
                Instagram 私訊這件商品 ↗
              </a>
              <a
                className="modal-cta email"
                href={`mailto:loxa8858@gmail.com?subject=${encodeURIComponent(`ROBERT FORM 訂製洽詢｜${selected.zh}`)}&body=${encodeURIComponent(`商品：${selected.zh}\n參考售價：${formatPrice(selectedPricing.price)} 起\n預估製作：${selectedPricing.material} ${selectedPricing.grams}g／約 ${selectedPricing.hours} 小時\n\n我想詢問的顏色、尺寸與數量：`)}`}
                onClick={() => setSelected(null)}
              >
                Email 詢問 →
              </a>
            </div>
          </article>
        </div>
      )}

      <section className="pricing-section" id="pricing">
        <div>
          <p className="eyebrow">FAIR PRICE / 02</p>
          <h2>不是只算一捲線材，<br />而是算完整製作。</h2>
        </div>
        <div className="pricing-explainer">
          <p>每件售價以標準尺寸的切片需求推估，並參考台灣 3D 列印代工與同類生活選品的公開價帶。目錄價格是接單前的透明起點，正式製作仍會重新切片確認。</p>
          <ol>
            <li><span>01</span><strong>材料與耗損</strong><p>PLA／PETG 用量，加計支撐、換色與約 15% 試印耗損。</p></li>
            <li><span>02</span><strong>機台時間</strong><p>依預估列印時數計入耗電、噴嘴與設備折舊。</p></li>
            <li><span>03</span><strong>完成工序</strong><p>包含拆支撐、基本修整、品檢與一般包裝。</p></li>
            <li><span>04</span><strong>市場校正</strong><p>小物不低價傾銷，大件也不直接套用高額代印工時計價。</p></li>
          </ol>
          <small>價格不含運費、特殊建模與額外商用授權費；大量製作可依排版與耗材效率另行報價。</small>
        </div>
      </section>

      <section className="process" id="process">
        <div>
          <p className="eyebrow">MADE FOR YOU / 03</p>
          <h2>從喜歡，走到專屬。</h2>
        </div>
        <ol>
          <li><span>01</span><h3>挑選方向</h3><p>從目錄找到喜歡的風格、用途或結構。</p></li>
          <li><span>02</span><h3>確認授權</h3><p>先確認原作授權，再討論顏色、尺寸與調整範圍。</p></li>
          <li><span>03</span><h3>打樣製作</h3><p>確認材料與細節，完成試印後再進入正式製作。</p></li>
        </ol>
      </section>

      <section className="order-contact" id="custom-order">
        <div className="order-contact-copy">
          <p className="eyebrow">CUSTOM SERVICES / 04</p>
          <h2>想做自己的版本？<br />請洽詢。</h2>
          <p>
            可從你的照片、文字或圖案開始，再一起評估造型、尺寸、顏色與適合的製作方式。
          </p>
        </div>
        <div className="custom-services">
          <div className="custom-services-heading">
            <span>可提供的訂製服務</span>
            <strong>ROBERT FORM · MADE FOR YOU</strong>
          </div>
          <div className="service-grid">
            <article>
              <span>01</span>
              <h3>照片轉立體作品</h3>
              <p>提供清晰照片，可評估轉成浮雕、燈片、輪廓擺件或紀念品。</p>
            </article>
            <article>
              <span>02</span>
              <h3>印上姓名與文字</h3>
              <p>姓名、日期、祝福語、編號或專屬短句，可討論字體與位置。</p>
            </article>
            <article>
              <span>03</span>
              <h3>Logo、圖案與 QR Code</h3>
              <p>可提供有使用權的 Logo、圖案或 QR Code，評估浮雕、鏤空或多色呈現。</p>
            </article>
            <article>
              <span>04</span>
              <h3>顏色、尺寸與用途調整</h3>
              <p>依空間、物件或使用情境，討論配色、比例、孔位與安裝方式。</p>
            </article>
            <article>
              <span>05</span>
              <h3>送禮、婚禮與活動小物</h3>
              <p>可評估少量多款或批量製作，適合送禮、店家、活動與企業客製。</p>
            </article>
            <article>
              <span>06</span>
              <h3>改圖與打樣評估</h3>
              <p>有現成檔案或參考圖也可提供，製作前會先確認結構、材料與授權。</p>
            </article>
          </div>
          <div className="inquiry-brief">
            <strong>洽詢時請提供</strong>
            <p>參考照片或檔案 · 想印的文字／圖案 · 預期尺寸 · 數量 · 用途 · 希望完成時間</p>
            <small>照片品質、產品結構與圖樣授權會影響可製作範圍，以實際評估為準。</small>
          </div>
          <div className="order-contact-options">
            <a
              className="contact-card instagram"
              href="https://www.instagram.com/radish_studio_/"
              target="_blank"
              rel="noreferrer"
            >
              <span>回覆最快</span>
              <strong>Instagram 私訊</strong>
              <small>@radish_studio_ ↗</small>
            </a>
            <a
              className="contact-card email"
              href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢"
            >
              <span>適合完整需求</span>
              <strong>Email 訂製洽詢</strong>
              <small>loxa8858@gmail.com ↗</small>
            </a>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <p className="eyebrow">A RESPONSIBLE CATALOGUE</p>
        <h2>尊重每一個<br />被創造的形狀。</h2>
        <p>
          本站圖片整理自 MakerWorld 公開作品頁，作為選品靈感與訂製討論使用；
          各作品權利屬於原創作者。商業製作前，我們會逐件確認授權，不直接轉售未獲許可的模型。
        </p>
      </section>

      <footer id="contact">
        <div><span className="brand-mark">RF</span><strong>ROBERT FORM</strong></div>
        <p>你的想法，值得被做出來。</p>
        <div className="footer-links">
          <a href="https://www.instagram.com/radish_studio_/" target="_blank" rel="noreferrer">Instagram 私訊 ↗</a>
          <a href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢">loxa8858@gmail.com ↗</a>
        </div>
        <small>Curated 3D design inspiration · Licensing checked before production</small>
      </footer>

      <aside className="contact-dock" aria-label="快速聯絡訂製">
        <span className="dock-label">有想法？現在就問</span>
        <a
          className="dock-action instagram"
          href="https://www.instagram.com/radish_studio_/"
          target="_blank"
          rel="noreferrer"
        >
          IG 私訊
        </a>
        <a
          className="dock-action email"
          href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢"
        >
          Email
        </a>
      </aside>
    </main>
  );
}
