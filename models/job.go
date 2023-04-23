package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// JobStatus describes status for process-step
// It maps as integer to database.
type JobStatus string

func (j *JobStatus) Value() (driver.Value, error) {
	switch *j {
	case JobAwaiting:
		return 0, nil
	case JobRunning:
		return 1, nil
	case JobFinished:
		return 2, nil
	case JobFailure:
		return 3, nil
	default:
		return 0, fmt.Errorf("unknown status: %s", *j)
	}
}

func (j *JobStatus) Scan(src interface{}) error {
	var val int
	if valDefault, ok := src.(int); ok {
		val = valDefault
	} else if val32, ok := src.(int32); ok {
		val = int(val32)
	} else if val64, ok := src.(int64); ok {
		val = int(val64)
	} else {
		return fmt.Errorf("expect int, got: %v", src)
	}
	switch val {
	case 0:
		*j = JobAwaiting
	case 1:
		*j = JobRunning
	case 2:
		*j = JobFinished
	case 3:
		*j = JobFailure
	default:
		return fmt.Errorf("unknown status: %d", val)
	}
	return nil
}

const (
	JobAwaiting JobStatus = "Awaiting"
	JobRunning  JobStatus = "Running"
	JobFinished JobStatus = "Finished"
	JobFailure  JobStatus = "Failure"
)

// Job is a pipeline that each document goes through. It consists of multiple steps to process document.
// Job is only used for logging purposes.
type Job struct {
	Id         int         `db:"id" json:"id"`
	DocumentId string      `db:"document_id" json:"document_id"`
	Message    string      `db:"message" json:"message"`
	Status     JobStatus   `json:"status"`
	Step       ProcessStep `db:"process_step"`

	StartedAt time.Time `db:"started_at" json:"started_at"`
	StoppedAt time.Time `db:"stopped_at" json:"stopped_at"`
}

// JobComposite contains additional information. Actual underlying model is still Job.
type JobComposite struct {
	Job
	Duration time.Duration `db:"duration" json:"duration"`
}

func (jc *JobComposite) SetDuration() {
	jc.Duration = jc.StoppedAt.Sub(jc.StartedAt)
}

// ProcessStep describes next step for document.
// It maps as integer to database.
type ProcessStep int

const (
	// full processing needed, used for new documents
	ProcessAll ProcessStep = 0

	ProcessHash ProcessStep = 1

	ProcessThumbnail    ProcessStep = 2
	ProcessParseContent ProcessStep = 3
	ProcessRules        ProcessStep = 4
	ProcessFts          ProcessStep = 5
)

const (
	ProcessV2Hash           = "hash"
	ProcessV2Thumbnail      = "thumbnail"
	ProcessV2ExtractContent = "extract"
	ProcessV2Metadata       = "metadata"
	ProcessV2Rules          = "rules"
	ProcessV2Fts            = "index"
)

// ProcessStepsAll is a list of default steps to run for new document.
var ProcessStepsAll = []ProcessStep{ProcessHash, ProcessThumbnail, ProcessParseContent, ProcessRules, ProcessFts}

func (ps *ProcessStep) Value() (driver.Value, error) {
	return int(*ps), nil
}

func (ps *ProcessStep) Scan(src interface{}) error {
	var val int
	if valDefault, ok := src.(int); ok {
		val = valDefault
	} else if val32, ok := src.(int32); ok {
		val = int(val32)
	} else if val64, ok := src.(int64); ok {
		val = int(val64)
	} else {
		return fmt.Errorf("expect int, got: %v", src)
	}
	if ProcessStep(val) > ProcessFts {
		return fmt.Errorf("unknown process step: %d", val)
	}
	*ps = ProcessStep(val)
	return nil
}

func (ps ProcessStep) String() string {
	switch ps {
	case 0:
		return "all"
	case 1:
		return "hash"
	case 2:
		return "thumbnail"
	case 3:
		return "parsecontent"
	case 4:
		return "rules"
	case 5:
		return "fts"
	default:
		return fmt.Sprintf("unknkown step: %d", ps)
	}
}

// ProcessItem contains document that awaits further processing.
type ProcessItem struct {
	DocumentId string `db:"document_id"`
	Document   *Document
	Step       ProcessStep `db:"step"`
	CreatedAt  time.Time   `db:"created_at"`
}
