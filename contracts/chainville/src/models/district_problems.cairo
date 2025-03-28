/// Water-related problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct WaterProblems {
    pub shortage: bool,
    pub severity: u8,
}

/// Power-related problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct PowerProblems {
    pub shortage: bool,
    pub severity: u8,
}

/// Traffic-related problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct TrafficProblems {
    pub congestion: bool,
    pub severity: u8,
}

/// Environmental problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct EnvironmentalProblems {
    pub pollution_crisis: bool,
    pub declining_land_value: bool,
    pub pollution_severity: u8,
    pub land_value_severity: u8,
}

/// Economic problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct EconomicProblems {
    pub housing_shortage: bool,
    pub unemployment: bool,
    pub tax_revolt: bool,
    pub housing_severity: u8,
    pub unemployment_severity: u8,
    pub tax_severity: u8,
}

/// Social problems
#[derive(Copy, Drop, Serde, Debug)]
pub struct SocialProblems {
    pub crime_wave: bool,
    pub infrastructure_decay: bool,
    pub crime_severity: u8,
    pub infrastructure_severity: u8,
}

/// Problems that can affect a district
#[derive(Drop, Copy, Serde, Debug)]
#[dojo::model]
pub struct DistrictProblems {
    #[key]
    pub game_id: u32,
    #[key]
    pub district_id: u32,
    
    // Modularized problem categories
    pub water: WaterProblems,
    pub power: PowerProblems,
    pub traffic: TrafficProblems,
    pub environment: EnvironmentalProblems,
    pub economy: EconomicProblems,
    pub social: SocialProblems,
    
    // When the problems started
    pub problem_start_time: u64,
    pub last_update: u64,
}
