/// Population metrics for a district
#[derive(Copy, Drop, Serde, Debug)]
pub struct PopulationMetrics {
    pub total_population: u32,         // Current district population
    pub max_population: u32,           // Maximum possible population
    pub employment_rate: u8,           // 0-100% of population employed
}

/// Infrastructure capacity and demand
#[derive(Copy, Drop, Serde, Debug)]
pub struct InfrastructureMetrics {
    pub water_demand: u16,             // Water required
    pub water_capacity: u16,           // Water available
    pub power_demand: u16,             // Electricity required
    pub power_capacity: u16,           // Electricity available
    pub traffic_load: u16,             // Current traffic pressure
    pub road_capacity: u16,            // Road infrastructure capacity
}

/// Economic demand factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct DemandFactors {
    pub residential_demand: u8,        // Housing demand
    pub commercial_demand: u8,         // Commercial services demand
    pub industrial_demand: u8,         // Industrial services demand
}

/// Zoning balance ratios
#[derive(Copy, Drop, Serde, Debug)]
pub struct ZoningRatios {
    pub res_com_ratio: u16,            // Residential to Commercial ratio (ideal: ~300)
    pub res_ind_ratio: u16,            // Residential to Industrial ratio (ideal: ~600)
    pub com_ind_ratio: u16,            // Commercial to Industrial ratio (ideal: ~200)
    pub park_density: u16,             // Parks to total cells ratio (ideal: ~10%)
}

/// Quality of life metrics
#[derive(Copy, Drop, Serde, Debug)]
pub struct QualityMetrics {
    pub land_value: u16,               // Average land value
    pub pollution: u16,                // Pollution level
    pub crime_rate: u16,               // Crime rate
    pub happiness: u16,                // Overall citizen happiness
    pub district_health: u8,           // Overall district health score
}

/// Financial metrics
#[derive(Copy, Drop, Serde, Debug)]
pub struct FinancialMetrics {
    pub hourly_tax_income: u64,        // Tax revenue per hour
    pub hourly_maintenance: u64,       // Maintenance costs per hour
}

/// District Balance - tracks ratios, needs, and satisfaction levels
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DistrictBalance {
    #[key]
    pub game_id: u32,
    #[key]
    pub district_id: u32,
    
    // Modularized metrics
    pub population: PopulationMetrics,
    pub infrastructure: InfrastructureMetrics,
    pub demand: DemandFactors,
    pub zoning: ZoningRatios,
    pub quality: QualityMetrics,
}