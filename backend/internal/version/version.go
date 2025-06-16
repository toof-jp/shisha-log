package version

// Build-time variables set by ldflags
var (
	// GitCommit is the git commit hash
	GitCommit = "unknown"

	// BuildTime is the build timestamp
	BuildTime = "unknown"

	// Version is the application version
	Version = "unknown"
)

// Info returns version information
func Info() map[string]string {
	return map[string]string{
		"version":   Version,
		"gitCommit": GitCommit,
		"buildTime": BuildTime,
	}
}
