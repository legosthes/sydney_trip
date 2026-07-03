CREATE TABLE budgets (
            category TEXT PRIMARY KEY,
            budget_twd INTEGER NOT NULL
        );
INSERT INTO budgets VALUES('Flights',100000);
INSERT INTO budgets VALUES('Food',10000);
INSERT INTO budgets VALUES('SIM Card',1500);
INSERT INTO budgets VALUES('Tickets',5000);
INSERT INTO budgets VALUES('Accommodation',30000);
INSERT INTO budgets VALUES('Transportation',6200);
CREATE TABLE expenses (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            amount_twd INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
INSERT INTO expenses VALUES('3045f165-ab0d-48a6-876f-6e66020460c7','Accommodation','',1313.950000000000045,'AUD',26936,'2026-07-19','2026-03-26 07:41:33');
INSERT INTO expenses VALUES('51f0332c-2abe-4e76-a6c4-13d9fcae83c5','Flights','',92253.0,'TWD',92253,'2026-03-27','2026-03-26 07:42:54');
INSERT INTO expenses VALUES('cc86f9e3-3ed4-483d-8bc8-4644771c3cff','Tickets','ETA',1361.0,'TWD',1361,'2026-05-30','2026-05-30 08:48:24');
INSERT INTO expenses VALUES('2f67f6f2-7259-4187-9ad0-0b5b4402e339','SIM Card','',1488.0,'TWD',1488,'2026-07-23','2026-06-23 15:17:06');
CREATE TABLE attractions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            location TEXT,
            maps_url TEXT,
            image_url TEXT,
            tag TEXT,
            day_label TEXT
        );
INSERT INTO attractions VALUES('a1','Sydney Opera House','UNESCO World Heritage icon on Bennelong Point. Take a kid-friendly Junior Tour and snap harbour-front photos.','Bennelong Point','https://www.google.com/maps/search/?api=1&query=Sydney+Opera+House','https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80','Landmark','Day 2');
INSERT INTO attractions VALUES('a2','The Rocks Market','Sydney''s oldest neighborhood with artisan stalls, street performers, and Harbour Bridge views.','The Rocks','https://www.google.com/maps/search/?api=1&query=The+Rocks+Sydney','https://images.unsplash.com/photo-1713262841373-6e045ac8ab91?w=500&auto=format&fit=crop&q=60','Market','Day 2');
INSERT INTO attractions VALUES('a3','SEA LIFE Sydney Aquarium','Home to sharks, penguins, and Australia''s only dugongs. Interactive exhibits perfect for toddlers.','Darling Harbour','https://www.google.com/maps/search/?api=1&query=SEA+LIFE+Sydney+Aquarium','https://www.darlingharbour.com/getmedia/942467a1-59e6-44f3-897e-8a482c710090/sealife-aquarium-8.jpg','Family Fun','Day 3');
INSERT INTO attractions VALUES('a4','Sydney Fish Market','Australia''s largest fish market. Fresh seafood, rock oysters, and fish & chips.','Pyrmont','https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market','https://assets.atdw-online.com.au/images/13c262933509a479b608d051ab07af95.jpeg?rect=62%2C0%2C2876%2C2157&w=1600&h=1200&fm=jpg','Food','Day 3');
INSERT INTO attractions VALUES('a5','Featherdale Wildlife Park','Get up close with koalas, kangaroos, wombats, and more. A highlight for kids of all ages.','Doonside','https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney','https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&auto=format&fit=crop&q=60','Wildlife','Day 4');
INSERT INTO attractions VALUES('a6','Luna Park Sydney','Iconic amusement park with family-friendly rides and the famous smiling face entrance.','Milsons Point','https://www.google.com/maps/search/?api=1&query=Luna+Park+Sydney','https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1470&auto=format&fit=crop','Theme Park','Day 4');
INSERT INTO attractions VALUES('a7','Manly Beach','A scenic 30-min ferry ride from Circular Quay. Build sandcastles, splash in the shallows, and walk to Shelly Beach.','Manly','https://www.google.com/maps/search/?api=1&query=Manly+Beach+Sydney','https://images.unsplash.com/photo-1729023410572-ae94d0019ec9?q=80&w=1469&auto=format&fit=crop','Beach','Day 5');
INSERT INTO attractions VALUES('a8','Darling Harbour','Waterfront precinct with restaurants, playgrounds, and stunning night lights.','Darling Harbour','https://www.google.com/maps/search/?api=1&query=Darling+Harbour+Sydney','https://images.unsplash.com/photo-1659684383997-adcabe839378?q=80&w=1471&auto=format&fit=crop','Waterfront','Day 1');
INSERT INTO attractions VALUES('a9','Queen Victoria Building (QVB)','Heritage shopping arcade with beautiful Romanesque architecture. Home to the Royal Clock.','CBD','https://www.google.com/maps/search/?api=1&query=Queen+Victoria+Building+Sydney','https://images.unsplash.com/photo-1668376186936-7d003242d9a1?q=80&w=1470&auto=format&fit=crop','Shopping','Day 6');
INSERT INTO attractions VALUES('a10','Hyde Park','Sydney''s oldest public park with lawns, fountains, and St. Mary''s Cathedral nearby.','CBD','https://www.google.com/maps/search/?api=1&query=Hyde+Park+Sydney','https://assets.atdw-online.com.au/images/33c2b3d0228741c4cad0094a332d4d74.jpeg?rect=0%2C0%2C2048%2C1536&w=2048&h=1536','Park','Day 6');
CREATE TABLE restaurants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            cuisine TEXT,
            description TEXT,
            price_range TEXT,
            address TEXT,
            area TEXT NOT NULL,
            maps_url TEXT,
            website TEXT,
            image_url TEXT,
            kid_friendly INTEGER DEFAULT 1,
            meal_type TEXT,
            day_labels TEXT
        );
INSERT INTO restaurants VALUES('r1','The Malaya','Malaysian','Award-winning Malaysian restaurant at Darling Harbour. Famous for laksa and rendang. Spacious with high chairs available.','$$','39 Lime St, King Street Wharf','Darling Harbour','https://www.google.com/maps/search/?api=1&query=The+Malaya+Sydney','https://themalaya.com.au','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',1,'Dinner','Day 1');
INSERT INTO restaurants VALUES('r2','Hurricane''s Grill','Steakhouse/BBQ','Famous for their pork ribs and harbour views. Kid-friendly with a dedicated children''s menu.','$$','Darling Harbour','Darling Harbour','https://www.google.com/maps/search/?api=1&query=Hurricane''s+Grill+Darling+Harbour+Sydney','https://hurricanesgrill.com.au','https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',1,'Dinner','Day 1,Day 6');
INSERT INTO restaurants VALUES('r3','Zaaffran','Indian','Modern Indian cuisine with stunning harbour views. Great naan and curries. Family-friendly atmosphere.','$$','Level 2, 345 Harbourside','Darling Harbour','https://www.google.com/maps/search/?api=1&query=Zaaffran+Darling+Harbour+Sydney','https://zaaffran.com','https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',1,'Dinner','Day 1');
INSERT INTO restaurants VALUES('r4','The Glenmore','Australian Pub','Rooftop pub in The Rocks with incredible Opera House & Harbour Bridge views. Good pub grub and family-friendly during daytime.','$$','96 Cumberland St, The Rocks','The Rocks','https://www.google.com/maps/search/?api=1&query=The+Glenmore+The+Rocks+Sydney','https://theglenmore.com.au','https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80',1,'Lunch','Day 2');
INSERT INTO restaurants VALUES('r5','Pancakes on the Rocks','Pancakes/Casual','A Sydney institution! Open almost 24/7. Kids love the pancakes, crepes, and pizzas. Very toddler-friendly.','$','4 Hickson Rd, The Rocks','The Rocks','https://www.google.com/maps/search/?api=1&query=Pancakes+on+the+Rocks+Sydney','https://pancakesontherocks.com.au','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',1,'Lunch,Dinner','Day 2');
INSERT INTO restaurants VALUES('r6','Opera Bar','Australian/Bar','Waterfront bar right next to the Opera House. Perfect for drinks and casual bites with the best view in Sydney.','$$','Lower Concourse, Sydney Opera House','Circular Quay','https://www.google.com/maps/search/?api=1&query=Opera+Bar+Sydney','https://operabar.com.au','https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80',1,'Lunch,Dinner','Day 2');
INSERT INTO restaurants VALUES('r7','Sydney Fish Market (Dine-in)','Seafood','Fresh seafood right at the market — oysters, sashimi, fish & chips. Multiple vendors to choose from. Outdoor seating.','$-$$','Bank St, Pyrmont','Pyrmont','https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market','https://www.sydneyfishmarket.com.au','https://images.unsplash.com/photo-1534483509719-8fbc3c37030d?w=600&q=80',1,'Lunch','Day 3');
INSERT INTO restaurants VALUES('r8','Nick''s Seafood Restaurant','Seafood','Premium seafood dining at Darling Harbour. Known for the seafood platter. Kids'' menu available.','$$$','The Promenade, Cockle Bay Wharf','Darling Harbour','https://www.google.com/maps/search/?api=1&query=Nick''s+Seafood+Restaurant+Darling+Harbour+Sydney','https://nicksseafoodrestaurant.com.au','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',1,'Dinner','Day 3');
INSERT INTO restaurants VALUES('r9','Featherdale Cafe','Cafe','On-site cafe inside Featherdale Wildlife Park. Sandwiches, pies, coffee, and kid-friendly snacks.','$','217 Kildare Rd, Doonside','Doonside','https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney','https://www.featherdale.com.au','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',1,'Lunch','Day 4');
INSERT INTO restaurants VALUES('r10','Milky Lane','Burgers/Desserts','Over-the-top burgers, loaded fries, and insane milkshakes. A visual feast kids will love. Multiple locations.','$$','Multiple Sydney locations','CBD','https://www.google.com/maps/search/?api=1&query=Milky+Lane+Sydney','https://milkylane.com.au','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',1,'Dinner','Day 4');
INSERT INTO restaurants VALUES('r11','The Pantry Manly','Australian/Brunch','Beachfront cafe right on Manly Beach. Excellent brunch, acai bowls, and fresh juices. High chairs available.','$$','Ocean Promenade, North Steyne, Manly','Manly','https://www.google.com/maps/search/?api=1&query=The+Pantry+Manly+Sydney','https://thepantrymanly.com','https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80',1,'Brunch,Lunch','Day 5');
INSERT INTO restaurants VALUES('r12','Hugos Manly','Italian/Pizza','Beachfront Italian right on the Manly Wharf. Great pizzas, pasta, and gelato. Kids love the thin-crust pizzas.','$$','Manly Wharf, East Esplanade','Manly','https://www.google.com/maps/search/?api=1&query=Hugos+Manly+Sydney','https://hugos.com.au','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',1,'Lunch,Dinner','Day 5');
INSERT INTO restaurants VALUES('r13','Manly Greenhouse','Modern Australian','Three-level venue with rooftop views of Manly Beach. Ground floor pizzeria is very family-friendly.','$$','56 Sydney Rd, Manly','Manly','https://www.google.com/maps/search/?api=1&query=The+Greenhouse+Manly+Sydney',NULL,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',1,'Lunch,Dinner','Day 5');
INSERT INTO restaurants VALUES('r14','Din Tai Fung (World Square)','Taiwanese/Dumplings','World-famous Taiwanese soup dumplings (xiao long bao). A taste of home! Always busy — go early or expect a queue.','$$','World Square, 644 George St','CBD','https://www.google.com/maps/search/?api=1&query=Din+Tai+Fung+World+Square+Sydney','https://dintaifung.com.au','https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',1,'Lunch','Day 6');
INSERT INTO restaurants VALUES('r15','QVB Tea Room','Cafe/High Tea','Elegant tea room inside the Queen Victoria Building. Great for a light afternoon tea break.','$$','Queen Victoria Building, 455 George St','CBD','https://www.google.com/maps/search/?api=1&query=QVB+Tea+Room+Sydney',NULL,'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',1,'Afternoon Tea','Day 6');
INSERT INTO restaurants VALUES('r16','Ester Restaurant','Modern Australian','Acclaimed woodfired-cooking restaurant in Chippendale, close to the hotel. Great for a special night out.','$$$','46-52 Meagher St, Chippendale','Chippendale','https://www.google.com/maps/search/?api=1&query=Ester+Restaurant+Chippendale+Sydney','https://ester-restaurant.com.au','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',0,'Dinner','Day 1,Day 2,Day 3,Day 4,Day 5,Day 6');
INSERT INTO restaurants VALUES('r17','Kensington Street Social','Modern Australian','Trendy Chippendale dining near the hotel. Spice Alley food court next door is great for casual Asian eats with a toddler.','$$','Kensington St, Chippendale','Chippendale','https://www.google.com/maps/search/?api=1&query=Kensington+Street+Chippendale+Sydney',NULL,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',1,'Dinner','Day 1,Day 2,Day 3,Day 4,Day 5,Day 6');
INSERT INTO restaurants VALUES('r18','Spice Alley','Asian Street Food','Outdoor hawker-style food court in Chippendale. Thai, Malaysian, Chinese, Japanese — affordable and kid-friendly. 2 min walk from hotel.','$','Kensington St, Chippendale','Chippendale','https://www.google.com/maps/search/?api=1&query=Spice+Alley+Chippendale+Sydney','https://spicealley.com.au','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',1,'Lunch,Dinner','Day 1,Day 2,Day 3,Day 4,Day 5,Day 6');
CREATE TABLE my_places (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            notes TEXT,
            maps_url TEXT,
            website TEXT,
            category TEXT,
            day_labels TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        , image_url TEXT);
INSERT INTO my_places VALUES('08fecebd-93e0-4a83-80d3-401ab1cebd86','Spice Alley',NULL,'https://maps.app.goo.gl/fdbd9rnj8v4drLmh8',NULL,'Restaurant','Day 1','2026-03-26 06:38:58','https://media.timeout.com/images/103343991/750/562/image.jpg');
INSERT INTO my_places VALUES('c17c247a-0817-4a1f-8fe3-bf2437666cf5','Broadway Sydney','Mall with Aldi and Coles','https://maps.app.goo.gl/9hWe3AV22vjKgmCL7',NULL,'Shop','Day 1','2026-03-26 07:18:27','https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/93/43/93/broadway-shopping-centre.jpg?w=1200&h=-1&s=1');
INSERT INTO my_places VALUES('22291332-efff-4de8-9216-8f21cec143eb','Victoria Park Sydney',NULL,'https://maps.app.goo.gl/bn6oUkZ9XJLYnX3K7',NULL,'Attraction','Day 1','2026-03-26 07:19:08','https://media.timeout.com/images/105496267/1920/1080/image.webp');
INSERT INTO my_places VALUES('b529c4c1-b287-464d-b5ce-1921e4736993','Featherdale Sydney Wildlife Park','Time: 8:00 - 17:00','https://maps.app.goo.gl/y5d1tMzewYsaVQtGA','https://www.featherdale.com.au/?utm_source=google&utm_medium=organic&utm_content=main_button&utm_campaign=gmb','Attraction',NULL,'2026-03-26 09:13:37','https://bluemountainstours.com.au/wp-content/uploads/2024/06/koaa.jpeg');
INSERT INTO my_places VALUES('73567e8e-85a6-4a97-80a9-72766464cad1','Sydney Opera House',NULL,'https://maps.app.goo.gl/ccXazngyTs9wKQqo7',NULL,'Attraction',NULL,'2026-03-26 09:25:09','https://images.unsplash.com/photo-1590141187901-91517156b553?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
INSERT INTO my_places VALUES('3cfde224-9b34-4cf0-b2bd-5a7052207c49','SEA LIFE Sydney Aquarium','Time: 10:00 - 16:00','https://maps.app.goo.gl/9FW8TsovLTiSZ3p66','https://www.visitsealife.com/','Attraction','Day 1','2026-03-26 09:26:38','https://www.darlingharbour.com/getmedia/942467a1-59e6-44f3-897e-8a482c710090/sealife-aquarium-8.jpg');
INSERT INTO my_places VALUES('f9f7be24-a3d6-4bf4-8059-122f44dc3092','Sydney Fish Market','Time: 7:00 - 22:00','https://share.google/peC27x58qnK9z1Kg3','https://www.sydneyfishmarket.com.au/','Restaurant',NULL,'2026-03-26 10:00:34','https://www.sydneyfishmarket.com.au/wp-content/uploads/2025/11/01_Aerial20-20SFM20Redevelopment-scaled.jpg');
INSERT INTO my_places VALUES('01100593-516c-4f1f-a378-3d4b2445d225','Manly Beach',NULL,'https://maps.app.goo.gl/HQtyyeobNgVpzWHU7',NULL,'Attraction',NULL,'2026-03-26 13:31:20','https://api.nomadsworld.com/wp-content/uploads/2017/08/sydney_manly_beach_istock.jpg');
INSERT INTO my_places VALUES('fa7c76fa-19f1-499f-a7ca-b047526269f3','The Grounds Coffee Factory',NULL,'https://maps.app.goo.gl/4TZfN3fXZr3eE7he7','https://thegrounds.com.au/dine-in/the-coffee-factory/','Cafe',NULL,'2026-03-26 13:32:26','https://offloadmedia.feverup.com/secretsydney.com/wp-content/uploads/2024/09/04144339/458314193_1074669694445417_2452140038531329267_n-1024x683.jpg');
INSERT INTO my_places VALUES('7c07d6d3-f678-41a6-bb71-0e000db6f61a','ANITA GELATO',NULL,'https://maps.app.goo.gl/p4WKugnitRKxeEecA','https://www.anita-gelato.com/','Cafe',NULL,'2026-03-26 13:33:30','https://yeahthatskosher.com/wp-content/uploads/2023/06/Anita-Gelato-LA-Tarzana-the-Valley-kosher-certified-6-scaled.jpg');
INSERT INTO my_places VALUES('5b60a76d-c90a-44f6-91d7-39d62e11283e','Queen Victoria Building',NULL,'https://maps.app.goo.gl/QwCTkW6g2rMgT5Hk7',NULL,'Shop',NULL,'2026-03-26 13:48:22','https://assets.atdw-online.com.au/images/bf7c03a0e48e526583a48ff5f3482ac3.jpeg?rect=139%2C0%2C2223%2C1667&w=1600&h=1200&&rot=360&q=eyJ0eXBlIjoibGlzdGluZyIsImxpc3RpbmdJZCI6IjU2YjI0MGM4ZDVmMTU2NTA0NWQ4NjM4NyIsImRpc3RyaWJ1dG9ySWQiOiI1NmIxZWI5MzQ0ZmVjYTNkZjJlMzIwYzgiLCJhcGlrZXlJZCI6IjU2YjFlZTU5MGNmMjEzYWQyMGRjNTgxOSJ9?w=1600&h=1200&fm=jpg');
INSERT INTO my_places VALUES('a11b968b-5a4d-46ba-81fd-add1fb4d9482','Darling Quarter',NULL,'https://maps.app.goo.gl/mLpMfSYuwP6mct9m8',NULL,'Attraction',NULL,'2026-03-27 08:14:01','https://upload.wikimedia.org/wikipedia/commons/5/50/2019-04-10_Sydney_CBD_view_from_Pyrmont_at_sunset.jpg');
INSERT INTO my_places VALUES('2f774004-c350-4632-b28d-1369dbb76f86','The Rocks',NULL,'https://maps.app.goo.gl/WVh1ok1Nx1ppnUSm7',NULL,'Attraction',NULL,'2026-03-27 08:16:33','https://cdn.odehotels.com/wp-content/uploads/sites/216/2024/09/16012942/the-rocks-christmas-market-2022-1600x1280.jpg');
INSERT INTO my_places VALUES('a27e57ac-ac72-4cce-a3d3-591a739fc104','Sydney Airport',NULL,'https://maps.app.goo.gl/Yz26A5nhcqYHqKMV8',NULL,'Other',NULL,'2026-03-27 08:19:46','https://res.cloudinary.com/momentum-media-group-pty-ltd/images/c_scale,w_398,h_225,dpr_2/f_auto/v1770185468/Australian%20Aviation/Aerial_view_of_Sydney_Airport_xetk6a/Aerial_view_of_Sydney_Airport_xetk6a.jpg?_i=AA');
INSERT INTO my_places VALUES('2131cd88-302f-4b09-a92f-e0978336677e','Royal Botanic Garden Sydney',NULL,'https://maps.app.goo.gl/UBH8mAEQfHxxyh436',NULL,'Attraction',NULL,'2026-03-27 15:25:12','https://media.cntraveler.com/photos/5a836bc2833f8a477b949500/16:9/w_2240,c_limit/Royal-Botanic-Garden__38612186215_a2ecd63ac7_o.jpg');
INSERT INTO my_places VALUES('1e7d5a2f-3c80-4e2d-b0f0-d8d27b10ae9c','Luna Park Sydney',NULL,'https://maps.app.goo.gl/rRtAsoM9KbJRrdSY6',NULL,'Attraction',NULL,'2026-03-27 15:25:49','https://thefreshcollective.com.au/wp-content/uploads/2025/10/Luna-Park-Sydney-001_2024-02-14-053740_jhjj.jpg');
INSERT INTO my_places VALUES('b02fdfcf-7f7d-4efe-a302-b3d468928520','Westpoint Blacktown',NULL,'https://maps.app.goo.gl/XogjFY8Scea66spL7',NULL,'Shop',NULL,'2026-03-31 09:00:19','https://cdn.prod.website-files.com/66c19938a3d76f7428395cb3/67c57f1cdd2a0705ecd5e522_Westpoint%20-%20interior%201.jpg');
INSERT INTO my_places VALUES('e52db1c8-f1c6-4efd-a5de-20db99899a04','Central Park Mall','Shopping center with supermarkets and lots of cafes nearby','https://maps.app.goo.gl/15zvRKYnwWvcLAXr5',NULL,'Shop',NULL,'2026-05-08 13:31:04','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/One_Central_Park_Sydney_3.jpg/500px-One_Central_Park_Sydney_3.jpg');
INSERT INTO my_places VALUES('f8e6a5c2-a60b-40ce-9986-bc1793906064','Australian Museum',NULL,'https://maps.app.goo.gl/xbuW8NJQ1HzTDZKW7','https://australian.museum/','Attraction',NULL,'2026-05-08 14:38:18','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Australian_Museum%2C_Sydney-William_Street_view.jpg/3840px-Australian_Museum%2C_Sydney-William_Street_view.jpg');
INSERT INTO my_places VALUES('30598d07-5125-4a1b-aa94-ef0748ead8ab','Hyde Park',NULL,'https://maps.app.goo.gl/pn54hWJ7bPJzae31A',NULL,'Attraction',NULL,'2026-05-17 13:33:28','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/AUS_Sydney%2C_Central_Business_District%2C_Hyde_Park_020.jpg/1920px-AUS_Sydney%2C_Central_Business_District%2C_Hyde_Park_020.jpg');
CREATE TABLE checklist_items (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            checked INTEGER DEFAULT 0,
            category TEXT,
            sort_order INTEGER DEFAULT 0
        );
INSERT INTO checklist_items VALUES('16c43aff-e9e4-4f00-81b0-601391b08b1d','Passports',0,'Documents',1);
INSERT INTO checklist_items VALUES('2d4611a2-4520-4f86-9552-e29e7e66a50f','Visa / ETA',1,'Documents',2);
INSERT INTO checklist_items VALUES('0a1af17f-25c5-4bd2-9203-f2d1097262fe','Travel insurance docs',0,'Documents',3);
INSERT INTO checklist_items VALUES('46ab1b9f-083b-40b1-b4ad-035aa235b067','Hotel booking confirmation',1,'Documents',4);
INSERT INTO checklist_items VALUES('11296b1b-137e-434b-9279-05effad1a782','Flight tickets (QF 8730 / QF 8729)',1,'Documents',5);
INSERT INTO checklist_items VALUES('6b87b5a7-09f7-4794-9fcd-c4ddf06a6bd2','Copies of IDs (digital + paper)',0,'Documents',6);
INSERT INTO checklist_items VALUES('ae2d7152-43c2-4d63-9651-30cbee3d0291','Winter jacket (July is winter!)',0,'Clothing',10);
INSERT INTO checklist_items VALUES('e8ce8ce9-7cc3-48cf-8225-377872aed6f5','Warm layers / sweaters',0,'Clothing',11);
INSERT INTO checklist_items VALUES('4c052afa-273c-49cc-b4f5-842906af72f5','Comfortable walking shoes',0,'Clothing',12);
INSERT INTO checklist_items VALUES('a13fd6c0-f1ee-445c-bf02-f0d8db01e029','Rain jacket / umbrella',0,'Clothing',13);
INSERT INTO checklist_items VALUES('0a53fb5c-8889-4e0a-bf27-c7a1cc8fa4f4','Warm pajamas',0,'Clothing',14);
INSERT INTO checklist_items VALUES('1b0be2dd-b218-4183-94b3-27102414369f','Hat & scarf',0,'Clothing',15);
INSERT INTO checklist_items VALUES('c37e9ac3-eaf8-4640-ac42-5dec8455397f','Toothbrush & toothpaste',0,'Toiletries',20);
INSERT INTO checklist_items VALUES('23c135ba-1eed-4306-9f6d-5336e9b2eeaa','Sunscreen (UV is strong even in winter)',0,'Toiletries',21);
INSERT INTO checklist_items VALUES('82529f1a-d997-4974-b299-1d525738a501','Medications',0,'Toiletries',22);
INSERT INTO checklist_items VALUES('54f9cb72-1072-4494-af47-56f0e431f08a','Hand sanitizer',0,'Toiletries',23);
INSERT INTO checklist_items VALUES('dbeb2726-3715-4ef7-93cc-e95b9ca206eb','Stroller',0,'Baby Items',30);
INSERT INTO checklist_items VALUES('b80a9ec2-191a-4125-a3d3-46bc924b7463','Diapers & wipes',0,'Baby Items',31);
INSERT INTO checklist_items VALUES('12cd1163-917a-4d9d-acc9-3b9b9eb07984','Baby food & snacks',0,'Baby Items',32);
INSERT INTO checklist_items VALUES('99601276-2275-4d99-ba7c-d288715fd16b','Sippy cup / water bottle',0,'Baby Items',33);
INSERT INTO checklist_items VALUES('94080ae4-836f-4c10-8f7d-9ff64acad738','Favorite toys / books',0,'Baby Items',34);
INSERT INTO checklist_items VALUES('aa0503d8-a8e7-4ba8-8d78-d85addfd54e3','Extra change of clothes',0,'Baby Items',35);
INSERT INTO checklist_items VALUES('a0dcbd90-d2a5-451f-9c4b-58c5e3c5b974','Phone chargers',0,'Electronics',40);
INSERT INTO checklist_items VALUES('5e573170-75fa-4c4e-85a1-b5c57eaec69d','Type I power adapter (AU plug)',0,'Electronics',41);
INSERT INTO checklist_items VALUES('1c7357bc-ab21-46b5-8b72-74209a686eb6','Portable battery pack',0,'Electronics',42);
INSERT INTO checklist_items VALUES('5d930968-a1ae-4751-8c51-e34234dedaa3','Camera',0,'Electronics',43);
INSERT INTO checklist_items VALUES('424264ef-56a5-4def-ba45-fc47923824af','Headphones',0,'Electronics',44);
INSERT INTO checklist_items VALUES('8a04919d-6063-45d9-b396-cdf9664fd2e0','Reusable water bottle',0,'Miscellaneous',50);
INSERT INTO checklist_items VALUES('9ead3b46-b88d-432a-8ad7-ac92a502cda3','SIM Card',1,'Documents',99);
CREATE TABLE itinerary_slots (
            id TEXT PRIMARY KEY,
            day_number INTEGER NOT NULL,
            slot_type TEXT NOT NULL CHECK (slot_type IN ('morning','breakfast','afternoon','lunch','evening','dinner')),
            place_id TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (place_id) REFERENCES my_places(id) ON DELETE CASCADE,
            UNIQUE (day_number, slot_type, place_id)
        );
INSERT INTO itinerary_slots VALUES('8ce77e15-ef1a-4ba7-b230-63e864ebc125',5,'afternoon','01100593-516c-4f1f-a378-3d4b2445d225',0,'2026-03-26 13:34:16');
INSERT INTO itinerary_slots VALUES('55e00e86-d17e-4072-83c1-97596d22a07c',2,'morning','3cfde224-9b34-4cf0-b2bd-5a7052207c49',0,'2026-03-26 16:09:44');
INSERT INTO itinerary_slots VALUES('155ec825-1768-4afd-8ef0-6ef605ec8755',3,'morning','b529c4c1-b287-464d-b5ce-1921e4736993',0,'2026-03-26 16:10:22');
INSERT INTO itinerary_slots VALUES('f9b0a9e1-ac26-4076-9334-bebfe2ffd868',4,'morning','73567e8e-85a6-4a97-80a9-72766464cad1',0,'2026-03-26 16:10:48');
INSERT INTO itinerary_slots VALUES('88a7a884-b73e-4e9b-b3e1-f4b9688a6d86',4,'lunch','2f774004-c350-4632-b28d-1369dbb76f86',0,'2026-03-27 08:17:02');
INSERT INTO itinerary_slots VALUES('96e05a46-63b9-47e9-817a-f2c5b34580a3',1,'morning','a27e57ac-ac72-4cce-a3d3-591a739fc104',0,'2026-03-27 08:19:52');
INSERT INTO itinerary_slots VALUES('191d364e-d70f-4791-80d6-b3f82e328543',6,'evening','a27e57ac-ac72-4cce-a3d3-591a739fc104',0,'2026-03-27 08:19:59');
INSERT INTO itinerary_slots VALUES('6f261043-662a-425c-9b57-4938e3460021',5,'lunch','01100593-516c-4f1f-a378-3d4b2445d225',0,'2026-03-27 15:30:42');
INSERT INTO itinerary_slots VALUES('877a0947-7241-4ad6-8801-c8886419096c',2,'lunch','a11b968b-5a4d-46ba-81fd-add1fb4d9482',0,'2026-03-31 02:12:39');
INSERT INTO itinerary_slots VALUES('374d560a-dbe6-47bb-94b4-2e0f7d847b92',2,'afternoon','f9f7be24-a3d6-4bf4-8059-122f44dc3092',0,'2026-03-31 02:14:05');
INSERT INTO itinerary_slots VALUES('8edfdb12-ad55-4949-8d7a-aee54eb4c326',6,'afternoon','5b60a76d-c90a-44f6-91d7-39d62e11283e',0,'2026-03-31 06:44:14');
INSERT INTO itinerary_slots VALUES('a3e678e9-aacd-43ab-a546-15c9cbb35000',3,'lunch','b02fdfcf-7f7d-4efe-a302-b3d468928520',0,'2026-03-31 09:00:28');
INSERT INTO itinerary_slots VALUES('6e0d2d8c-eb0d-49ec-b263-acc67d491159',3,'afternoon','b02fdfcf-7f7d-4efe-a302-b3d468928520',0,'2026-03-31 09:00:42');
INSERT INTO itinerary_slots VALUES('ed94ae3d-9e1f-4c3e-9955-7f1a30ba6a50',1,'lunch','e52db1c8-f1c6-4efd-a5de-20db99899a04',0,'2026-05-08 13:31:19');
INSERT INTO itinerary_slots VALUES('fcb85867-d871-47c0-98c4-6def062d2735',1,'afternoon','e52db1c8-f1c6-4efd-a5de-20db99899a04',0,'2026-05-08 13:31:28');
INSERT INTO itinerary_slots VALUES('61b0034e-425a-4a02-9c71-7a65cd8f936f',4,'afternoon','f8e6a5c2-a60b-40ce-9986-bc1793906064',0,'2026-05-12 15:47:14');
INSERT INTO itinerary_slots VALUES('c90e771f-8113-48a8-8f3c-38a8cd379426',1,'breakfast','a27e57ac-ac72-4cce-a3d3-591a739fc104',0,'2026-05-14 12:40:30');
INSERT INTO itinerary_slots VALUES('d3b25f0b-be11-43dc-92ea-f6e3d3a8f8c4',6,'lunch','08fecebd-93e0-4a83-80d3-401ab1cebd86',0,'2026-05-17 13:29:19');
INSERT INTO itinerary_slots VALUES('a2feaa46-1496-4a4e-a36d-c65669197c2f',4,'afternoon','30598d07-5125-4a1b-aa94-ef0748ead8ab',1,'2026-05-17 13:34:00');
CREATE TABLE day_customizations (
            day_number INTEGER PRIMARY KEY,
            title TEXT,
            image_url TEXT
        );
INSERT INTO day_customizations VALUES(1,'Arrival & Chippendale','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/One_Central_Park_Sydney_3.jpg/500px-One_Central_Park_Sydney_3.jpg');
INSERT INTO day_customizations VALUES(2,'SEA LIFE Aquarium & Fish Market','https://www.sydneyfishmarket.com.au/wp-content/uploads/2025/11/01_Aerial20-20SFM20Redevelopment-scaled.jpg');
INSERT INTO day_customizations VALUES(3,'Featherdale Sydney Wildlife Park','https://bluemountainstours.com.au/wp-content/uploads/2024/06/koaa.jpeg');
INSERT INTO day_customizations VALUES(4,'Sydney Opera House & The Rocks','https://images.unsplash.com/photo-1590141187901-91517156b553?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
INSERT INTO day_customizations VALUES(5,NULL,'https://api.nomadsworld.com/wp-content/uploads/2017/08/sydney_manly_beach_istock.jpg');
INSERT INTO day_customizations VALUES(6,NULL,'https://assets.atdw-online.com.au/images/bf7c03a0e48e526583a48ff5f3482ac3.jpeg?rect=139%2C0%2C2223%2C1667&w=1600&h=1200&&rot=360&q=eyJ0eXBlIjoibGlzdGluZyIsImxpc3RpbmdJZCI6IjU2YjI0MGM4ZDVmMTU2NTA0NWQ4NjM4NyIsImRpc3RyaWJ1dG9ySWQiOiI1NmIxZWI5MzQ0ZmVjYTNkZjJlMzIwYzgiLCJhcGlrZXlJZCI6IjU2YjFlZTU5MGNmMjEzYWQyMGRjNTgxOSJ9?w=1600&h=1200&fm=jpg');
