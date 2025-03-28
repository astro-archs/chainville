// models.ts - Import and define the model categories

import { ModelCategories } from "../../types/types";

// Model categories definition
// Model categories definition
    const modelCategories : ModelCategories = {
      "Residential": [
        "building-apartment-china.glb",
        "building-house-block.glb",
        "building-house-block-big.glb",
        "building-house-block-old.glb",
        "building-house-family-large.glb",
        "building-house-family-small.glb",
        "building-house-modern.glb",
        "building-house-modern-big.glb",
        "building-cabin-big.glb",
        "building-cabin-small.glb"
      ],
      "Commercial": [
        "building-bank.glb",
        "building-cafe.glb",
        "building-casino.glb",
        "building-cinema.glb",
        "building-mall.glb",
        "building-market-china.glb",
        "building-burger-joint.glb",
        "building-restaurant.glb",
        "building-restaurant-china.glb",
        "building-shop-china.glb",
        "building-hotel.glb"
      ],
      "Industrial": [
        "construction-small.glb",
        "data-center.glb",
        "cargo-shipping_blue.glb",
        "cargo-shipping_green.glb",
        "cargo-shipping_orange.glb",
        "cargo-shipping_red.glb",
        "cargo-shipping_white.glb",
        "building-port-sea.glb",
        "cargo-sign.glb",
        "forklift.glb"
      ],
      "Office": [
        "building-office.glb",
        "building-office-balcony.glb",
        "building-office-big.glb",
        "building-office-pyramid.glb",
        "building-office-rounded.glb",
        "building-office-tall.glb",
        "building-skyscraper.glb"
      ],
      "Water": [
        "canal-cover.glb"
      ],
      "Electricity": [
        "cooling-tower.glb"
      ],
      "Roads": [
        "tile-mainroad-road-intersection.glb",
        "tile-mainroad-road-intersection-t.glb",
        "tile-mainroad-straight.glb",
        "tile-mainroad-straight-crosswalk.glb",
        "tile-road-intersection.glb",
        "tile-road-intersection-t.glb",
        "tile-road-mainroad-intersection.glb",
        "tile-road-straight.glb",
        "tile-road-straight-crosswalk.glb",
        "tile-road-to-mainroad.glb",
        "tile-road-to-mainroad-intersection-t.glb",
        "tile-sidewalk-hill.glb",
        "tile-sidewalk-straight.glb",
        "tile-road-end.glb",
        "tile-road-curve.glb",
        "tile-road-hill.glb",
        "tile-mainroad-intersection.glb",
        "tile-mainroad-intersection-t.glb"
      ],
      "Public Transport": [
        "bus-stop.glb",
        "bus-stop-sign.glb",
        "bus-passenger.glb",
        "bus-school.glb",
        "building-train-station.glb",
        "freight-train.glb",
        "control-tower.glb",
        "floatplane.glb",
        "boat-fishing.glb",
        "boat-sail.glb",
        "boat-speed.glb"
      ],
      "Healthcare": [
        "building-hospital.glb",
        "car-ambulance-pickup.glb"
      ],
      "Fire Department": [
        "building-firestation.glb",
        "fire-hydrant.glb",
        "firetruck.glb",
        "car-firefighter-pickup.glb"
      ],
      "Police": [
        "building-policestation.glb",
        "building-policestation-garage.glb",
        "car-police.glb"
      ],
      "Education": [
        "building-school.glb",
        "building-museum.glb"
      ],
      "Parks": [
        "fountain.glb",
        "basketball-stand.glb",
        "bench-forest.glb",
        "bench-old.glb",
        "bike-stand.glb",
        "ferris-wheel.glb",
        "free-fall-ride.glb",
        "flag-golf.glb",
        "golf-cart.glb",
        "grass.glb"
      ],
      "Unique Buildings": [
        "building-temple-china.glb",
        "building-museum.glb",
        "building-stadium.glb",
        "building-skyscraper.glb",
        "building-antique-china.glb",
        "building-pagoda-china.glb",
        "gate-china.glb"
      ],
      "Vehicles": [
        "armored-truck.glb",
        "bike-old.glb",
        "car-baywatch.glb",
        "car-formula.glb",
        "car-hippie-van.glb",
        "car-passenger.glb",
        "car-passenger-race.glb",
        "car-taxi.glb",
        "car-tow-truck.glb",
        "car-truck-cement.glb",
        "car-truck-dump.glb",
        "car-truck-tanker.glb",
        "car-veteran.glb",
        "excavator.glb"
      ],
      "Props": [
        "balloon-stripes.glb",
        "baby-carriage.glb",
        "atm-mechine.glb",
        "burger-statue.glb",
        "burger-joint-sign.glb",
        "chair-folding.glb",
        "dryer-outside.glb",
        "dumpster.glb",
        "fence.glb",
        "fence-big.glb",
        "fence-classic.glb",
        "fence-picket.glb",
        "fence-shrub.glb",
        "fence-start.glb",
        "fence-stone.glb",
        "fence-stone-gate.glb",
        "fence-stone-gate-small.glb",
        "fence-stone-metal.glb",
        "fence-stone-tower.glb",
        "fence-vineyard.glb",
        "flowers-window.glb",
        "cactus-big.glb",
        "cactus-medium.glb",
        "chimney-big.glb"
      ]
    };
  
  // Helper function to get model name without extension
  export function getModelNameWithoutExtension(filename: string): string {
    return filename.replace('.glb', '');
  }
  
  // Export the model categories
  export default modelCategories;