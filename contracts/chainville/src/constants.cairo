use chainville::models::resource::{ResourceType};


pub const DISTRICT_GRID_SIZE: u32 = 6;
pub const DISTRICT_SIZE: u32 = 10;
pub const DISTRICT_SPACING: u32 = 10;
pub const CELLS_PER_DISTRICT: u32 = 30;
pub const CELL_SPACING: u32 = 100;  // 0.0001 * 1000000
pub const DISTRICT_COUNT: u16 = 12;

/// Resource ID constants organized by category
pub mod resource_ids {
    // ID ranges:
    // 1000-1999: Residential
    // 2000-2999: Commercial
    // 3000-3999: Industrial
    // 4000-4999: Utilities
    // 5000-5999: Parks
    // 6000-6999: Roads
    // 7000-7999: Special

    // Residential building IDs (1000-1999)
    pub mod residential {
        pub const APARTMENT_CHINA: u32 = 1001;
        pub const HOUSE_BLOCK: u32 = 1002;
        pub const HOUSE_BLOCK_BIG: u32 = 1003;
        pub const HOUSE_BLOCK_OLD: u32 = 1004;
        pub const HOUSE_FAMILY_LARGE: u32 = 1005;
        pub const HOUSE_FAMILY_SMALL: u32 = 1006;
        pub const HOUSE_MODERN: u32 = 1007;
        pub const HOUSE_MODERN_BIG: u32 = 1008;
    }
    
    // Commercial building IDs (2000-2999)
    pub mod commercial {
        pub const BANK: u32 = 2001;
        pub const CAFE: u32 = 2002;
        pub const CASINO: u32 = 2003;
        pub const CINEMA: u32 = 2004;
        pub const MALL: u32 = 2005;
        pub const MARKET_CHINA: u32 = 2006;
        pub const OFFICE: u32 = 2007;
        pub const OFFICE_BALCONY: u32 = 2008;
        pub const OFFICE_BIG: u32 = 2009;
        pub const OFFICE_PYRAMID: u32 = 2010;
        pub const OFFICE_ROUNDED: u32 = 2011;
        pub const OFFICE_TALL: u32 = 2012;
        pub const BURGER_JOINT_SIGN: u32 = 2013;
        pub const BURGER_STATUE: u32 = 2014;
        pub const SHOP_CHINA: u32 = 2015;
    }
    
    // Industrial building IDs (3000-3999)
    pub mod industrial {
        pub const BUILDING: u32 = 3001;
        pub const FACTORY: u32 = 3002;
        pub const FACTORY_HALL: u32 = 3003;
        pub const FACTORY_OLD: u32 = 3004;
        pub const REFINERY: u32 = 3005;
        pub const STORAGE: u32 = 3006;
        pub const WAREHOUSE: u32 = 3007;
        pub const CONSTRUCTION_SMALL: u32 = 3008;
    }
    
    // Utilities building IDs (4000-4999)
    pub mod utilities {
        pub const NUCLEAR_POWER_PLANT: u32 = 4001;
        pub const SOLAR_PANEL_HOUSE: u32 = 4002;
        pub const CONTROL_TOWER: u32 = 4003;
        pub const COOLING_TOWER: u32 = 4004;
        pub const DATA_CENTER: u32 = 4005;
        pub const FIRE_HYDRANT: u32 = 4006;
        pub const FIRETRUCK: u32 = 4007;
        pub const FIRESTATION: u32 = 4008;
        pub const DUMPSTER: u32 = 4009;
    }
    
    // Parks and natural elements IDs (5000-5999)
    pub mod parks {
        // Trees
        pub const TREE_GENERIC: u32 = 5001;
        pub const TREE_BEECH: u32 = 5002;
        pub const TREE_BIRCH: u32 = 5003;
        pub const TREE_BIRCH_TALL: u32 = 5004;
        pub const TREE_BONSAI: u32 = 5005;
        pub const TREE_CONIFER: u32 = 5006;
        pub const TREE_DEAD: u32 = 5007;
        pub const TREE_DRY: u32 = 5008;
        pub const TREE_ELIPSE: u32 = 5009;
        pub const TREE_FALL: u32 = 5010;
        pub const TREE_FOREST: u32 = 5011;
        pub const TREE_GINKGO: u32 = 5012;
        pub const TREE_LITTLE: u32 = 5013;
        pub const TREE_OAK: u32 = 5014;
        pub const TREE_POPLAR: u32 = 5015;
        pub const TREE_POT: u32 = 5016;
        pub const TREE_ROUND: u32 = 5017;
        pub const TREE_SPRUCE: u32 = 5018;
        pub const TREE_SQUARE: u32 = 5019;
        pub const TREE_TALL: u32 = 5020;
        
        // Grass
        pub const GRASS_BASIC: u32 = 5051;
        pub const GRASS_CLUMB: u32 = 5052;
        pub const GRASS_LONG: u32 = 5053;
        pub const GRASS_TALL: u32 = 5054;
        
        // Other park elements
        pub const SUNFLOWER: u32 = 5101;
        pub const FOUNTAIN: u32 = 5102;
        pub const TILE_PARK: u32 = 5103;
    }
    
    // Road and infrastructure IDs (6000-6999)
    pub mod roads {
        // Main roads
        pub const MAINROAD_INTERSECTION: u32 = 6001;
        pub const MAINROAD_INTERSECTION_T: u32 = 6002;
        pub const MAINROAD_ROAD_INTERSECTION: u32 = 6003;
        pub const MAINROAD_ROAD_INTERSECTION_T: u32 = 6004;
        pub const MAINROAD_STRAIGHT: u32 = 6005;
        pub const MAINROAD_STRAIGHT_CROSSWALK: u32 = 6006;
        
        // Regular roads
        pub const ROAD_INTERSECTION: u32 = 6051;
        pub const ROAD_INTERSECTION_T: u32 = 6052;
        pub const ROAD_MAINROAD_INTERSECTION: u32 = 6053;
        pub const ROAD_STRAIGHT: u32 = 6054;
        pub const ROAD_STRAIGHT_CROSSWALK: u32 = 6055;
        pub const ROAD_TO_MAINROAD: u32 = 6056;
        pub const ROAD_TO_MAINROAD_INTERSECTION_T: u32 = 6057;
        pub const ROAD_END: u32 = 6058;
        pub const ROAD_CURVE: u32 = 6059;
        pub const ROAD_HILL: u32 = 6060;
        
        // Sidewalks
        pub const SIDEWALK_HILL: u32 = 6101;
        pub const SIDEWALK_STRAIGHT: u32 = 6102;
    }
    
    // Special buildings and landmarks IDs (7000-7999)
    pub mod special {
        // Cultural and religious
        pub const TEMPLE_CHINA: u32 = 7001;
        pub const MUSEUM: u32 = 7002;
        pub const MOSQUE: u32 = 7003;
        pub const MOSQUE_TOWER: u32 = 7004;
        
        // Entertainment
        pub const STADIUM: u32 = 7051;
        pub const TENT_CIRCUS_BIG: u32 = 7052;
        pub const FERRIS_WHEEL: u32 = 7053;
        
        // Skyscrapers
        pub const SKYSCRAPER: u32 = 7101;
        pub const SKYSCRAPER_HUGE: u32 = 7102;
        pub const SKYSCRAPER_LARGE: u32 = 7103;
        pub const SKYSCRAPER_MEDIUM: u32 = 7104;
        pub const SKYSCRAPER_SMALL: u32 = 7105;
        pub const SKYSCRAPER_TINY: u32 = 7106;
        
        // Skyscraper parts
        pub const SKYSCRAPER_PART_BOTTOM: u32 = 7151;
        pub const SKYSCRAPER_PART_MIDDLE: u32 = 7152;
        pub const SKYSCRAPER_PART_TOP: u32 = 7153;
    }
}

/// Gets the resource type from a resource ID
pub fn get_resource_type(resource_id: u32) -> ResourceType {
    // Determine the resource type based on ID range
    if resource_id >= 1000 && resource_id < 2000 {
        ResourceType::Residential
    } else if resource_id >= 2000 && resource_id < 3000 {
        ResourceType::Commercial
    } else if resource_id >= 3000 && resource_id < 4000 {
        ResourceType::Industrial
    } else if resource_id >= 4000 && resource_id < 5000 {
        ResourceType::Utilities
    } else if resource_id >= 5000 && resource_id < 6000 {
        ResourceType::Parks
    } else if resource_id >= 6000 && resource_id < 7000 {
        ResourceType::Roads
    } else if resource_id >= 7000 && resource_id < 8000 {
        ResourceType::Special
    } else {
        ResourceType::None
    }
}
