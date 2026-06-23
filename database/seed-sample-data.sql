-- Sample data for Kaya Agri Trading
-- Run after init.sql has seeded categories, subcategories, and UOMs
-- Usage: psql -U kaya -d kaya_agri -f database/seed-sample-data.sql

-- ─── SUPPLIERS ───────────────────────────────────────────────────────────────

INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
    ('San Miguel Agrivet Supplies', 'Juan dela Cruz', '0917-123-4567', 'juan@sanmiguelagri.com', '123 MacArthur Highway, Malolos, Bulacan'),
    ('Pioneer Feeds Corporation', 'Maria Santos', '0918-234-5678', 'maria@pioneerfeeds.com', '456 Diversion Road, Pulilan, Bulacan'),
    ('Bayer Crop Science Philippines', 'Pedro Reyes', '0919-345-6789', 'pedro.reyes@bayer.com', '789 Ayala Avenue, Makati City'),
    ('Vitarich Corporation', 'Ana Gonzales', '0920-456-7890', 'ana.gonzales@vitarich.com', '321 North Avenue, Quezon City'),
    ('Local Rice Millers Association', 'Jose Rizal', '0921-567-8901', 'jose@localricemillers.ph', '555 Maharlika Highway, Cabanatuan City'),
    ('Growchem Agricultural Supply', 'Ramon Villanueva', '0922-678-9012', 'ramon@growchem.ph', '888 National Road, Sta. Maria, Bulacan'),
    ('Phil Agro-Industrial Corp', 'Luzviminda Hernandez', '0923-789-0123', 'luz@philagro.com', '444 Diversion Road, Baliuag, Bulacan');

-- ─── CUSTOMERS ───────────────────────────────────────────────────────────────

INSERT INTO customers (name, phone, email, address) VALUES
    ('Mario''s Piggery Farm', '0918-111-2222', 'mario@piggeryfarm.com', 'Brgy. San Jose, Pulilan, Bulacan'),
    ('Golden Egg Poultry Farm', '0919-222-3333', 'elena@goldeneggfarm.com', 'Brgy. Santol, Baliuag, Bulacan'),
    ('Barangay Pet Shop', '0920-333-4444', 'carlos@barangaypetshop.com', 'Unit 1, Public Market, Malolos, Bulacan'),
    ('Banaue Rice Retailers', '0921-444-5555', 'sofia@banauerice.com', 'Block 2, Rice Center, Cabanatuan City'),
    ('Green Valley Plantation', '0922-555-6666', 'diego@greenvalley.com', 'Brgy. Poblacion, San Miguel, Bulacan'),
    ('Mayon Pesticide Distributors', '0923-666-7777', 'lisa@mayonpest.com', 'Door 4, Agrivet Bldg, Plaridel, Bulacan'),
    ('Luzon Livestock Traders', '0924-777-8888', 'anton@luzonlivestock.com', 'Brgy. Saluysoy, Meycauayan, Bulacan');

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
-- Subcategory IDs from init.sql (in order):
--   1=Chicken Feed, 2=Pig Feed, 3=Duck Feed,
--   4=Dog Food, 5=Cat Food,
--   6=Insecticides, 7=Herbicides, 8=Fungicides,
--   9=Premium Rice, 10=Regular Rice
-- UOM IDs: 1=kg, 2=bag, 3=L, 4=pc, 5=sack

INSERT INTO products (subcategory_id, name, sku, description, unit_of_measure_id, unit_price, reorder_level, current_stock) VALUES
    -- Chicken Feed
    (1, 'Broiler Starter Mash', 'CF-BSM-001', 'Complete starter feed for broiler chicks (0-3 weeks)', 1, 25.00, 100, 500),
    (1, 'Layer Pellet Feed', 'CF-LPF-002', 'High-calcium layer pellets for optimal egg production', 2, 850.00, 50, 200),
    (1, 'Grower Finisher Mash', 'CF-GFM-003', 'Finisher feed for broilers (4-6 weeks)', 1, 22.00, 80, 350),

    -- Pig Feed
    (2, 'Swine Grower Pellets', 'PF-SGP-001', 'Complete grower feed for swine 30-60kg', 2, 950.00, 30, 150),
    (2, 'Piglet Starter', 'PF-PLS-002', 'Pre-starter mash for weanling piglets', 1, 35.00, 75, 300),
    (2, 'Swine Fattener Mash', 'PF-SFM-003', 'Fattener ration for swine 60kg to market weight', 2, 880.00, 25, 120),

    -- Duck Feed
    (3, 'Duck Layer Pellets', 'DF-DLP-001', 'Complete layer feed for laying ducks', 2, 780.00, 25, 100),
    (3, 'Duck Starter Crumble', 'DF-DSC-002', 'Starter crumble for ducklings (0-4 weeks)', 1, 28.00, 40, 180),

    -- Dog Food
    (4, 'Adult Dog Kibble 20kg', 'PF-ADK-001', 'Complete nutrition for adult dogs, chicken flavor', 2, 1200.00, 20, 80),
    (4, 'Puppy Formula 5kg', 'PF-PPF-002', 'High-protein formula for growing puppies', 2, 450.00, 15, 60),
    (4, 'Senior Dog Maintenance 15kg', 'PF-SDM-003', 'Low-calorie formula for senior dogs', 2, 980.00, 10, 45),

    -- Cat Food
    (5, 'Adult Cat Kibble 7kg', 'PF-ACK-001', 'Complete nutrition for adult cats, salmon flavor', 2, 680.00, 20, 90),

    -- Insecticides
    (6, 'Cypermethrin 50EC 1L', 'IN-CYP-001', 'Broad-spectrum insecticide for field crops', 3, 450.00, 30, 120),
    (6, 'Lambda 25EC 500ml', 'IN-LAM-002', 'Contact insecticide for rice and vegetables', 3, 320.00, 50, 200),
    (6, 'Fipronil 5SC 250ml', 'IN-FIP-003', 'Soil insecticide for corn and sugarcane', 4, 250.00, 40, 160),

    -- Herbicides
    (7, 'Glyphosate 41% 1L', 'HB-GLY-001', 'Non-selective systemic herbicide', 3, 280.00, 60, 250),
    (7, '2,4-D Amine 1L', 'HB-24D-002', 'Selective herbicide for broadleaf weeds in rice', 3, 350.00, 25, 100),
    (7, 'Pretilachlor 500ml', 'HB-PRE-003', 'Pre-emergence herbicide for rice paddies', 3, 290.00, 30, 130),

    -- Fungicides
    (8, 'Mancozeb 75% WP 500g', 'FN-MAN-001', 'Broad-spectrum protectant fungicide', 4, 180.00, 75, 300),
    (8, 'Copper Oxychloride 1kg', 'FN-COX-002', 'Contact fungicide for fruit and vegetable diseases', 1, 220.00, 30, 140),
    (8, 'Carbendazim 50SC 1L', 'FN-CAR-003', 'Systemic fungicide for leaf spot and blight', 3, 380.00, 20, 90),

    -- Premium Rice
    (9, 'Jasmine Premium Rice 50kg', 'RC-JPM-001', 'Fragrant jasmine rice, premium quality', 5, 2500.00, 10, 50),
    (9, 'Sinandomeng Premium 25kg', 'RC-SND-002', 'Premium Sinandomeng variety, soft and fluffy', 5, 1300.00, 10, 40),
    (9, 'Dinorado Heirloom 25kg', 'RC-DIN-003', 'Traditional heirloom variety, aromatic', 5, 1500.00, 5, 25),

    -- Regular Rice
    (10, 'Local Regular Rice 50kg', 'RC-LRR-001', 'Everyday regular milled rice', 5, 1800.00, 15, 75),
    (10, 'Well-Milled Rice 25kg', 'RC-WMR-002', 'Well-milled premium quality regular rice', 5, 950.00, 20, 100);
