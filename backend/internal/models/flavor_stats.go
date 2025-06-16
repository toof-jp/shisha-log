package models

// FlavorCount represents a flavor and its usage count
type FlavorCount struct {
	FlavorName string `json:"flavor_name"`
	Count      int    `json:"count"`
}

// FlavorStats contains statistics for flavors
type FlavorStats struct {
	MainFlavors []FlavorCount `json:"main_flavors"` // First flavors only
	AllFlavors  []FlavorCount `json:"all_flavors"`  // All flavors
}
