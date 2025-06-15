package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// CustomTime wraps time.Time to handle Supabase timestamp parsing
type CustomTime struct {
	time.Time
}

// UnmarshalJSON implements json.Unmarshaler interface
func (ct *CustomTime) UnmarshalJSON(b []byte) error {
	s := string(b)
	// Remove quotes
	s = s[1 : len(s)-1]
	
	// Try parsing different formats
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05.999999Z",
		"2006-01-02T15:04:05.999999",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
	}
	
	var err error
	for _, format := range formats {
		ct.Time, err = time.Parse(format, s)
		if err == nil {
			return nil
		}
	}
	
	return fmt.Errorf("could not parse time: %s", s)
}

// MarshalJSON implements json.Marshaler interface
func (ct CustomTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf(`"%s"`, ct.Time.Format(time.RFC3339))), nil
}

// Value implements driver.Valuer interface
func (ct CustomTime) Value() (driver.Value, error) {
	return ct.Time, nil
}

// Scan implements sql.Scanner interface
func (ct *CustomTime) Scan(value interface{}) error {
	switch v := value.(type) {
	case time.Time:
		ct.Time = v
		return nil
	case nil:
		ct.Time = time.Time{}
		return nil
	default:
		return fmt.Errorf("cannot scan type %T into CustomTime", value)
	}
}