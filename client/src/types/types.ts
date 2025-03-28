
// Define interfaces for the model system
export type ModelFileName = string; // Type for .glb filenames

// Interface defining the structure of our categories object
export interface ModelCategories {
  Residential: ModelFileName[];
  Commercial: ModelFileName[];
  Industrial: ModelFileName[];
  Office: ModelFileName[];
  Water: ModelFileName[];
  Electricity: ModelFileName[];
  Roads: ModelFileName[];
  "Public Transport": ModelFileName[];
  Healthcare: ModelFileName[];
  "Fire Department": ModelFileName[];
  Police: ModelFileName[];
  Education: ModelFileName[];
  Parks: ModelFileName[];
  "Unique Buildings": ModelFileName[];
  Vehicles: ModelFileName[];
  Props: ModelFileName[];
  [key: string]: ModelFileName[]; // Allow for extensibility with string indexing
}

// Type for category names derived from the interface
export type CategoryName = keyof ModelCategories;


/**
 * Toast message types for different notification styles
 */
export enum ToastType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error"
}