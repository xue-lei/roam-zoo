package config

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
)

type Connection struct {
	Host string `json:"host"`
	Port string `json:"port"`
}

type Config struct {
	Connections []Connection
}

func DefaultConfig() Config {
	return Config{make([]Connection, 0)}
}

type ConfigStore struct {
	configPath string
}

func NewConfigStore() (*ConfigStore, error) {
	configFilePath, err := xdg.ConfigFile("roam-zoo/config.json")
	if err != nil {
		return nil, fmt.Errorf("could not resolve path for config file: %w", err)
	}

	slog.Info("appDirPath", "Config", configFilePath)

	return &ConfigStore{
		configPath: configFilePath,
	}, nil
}

func (s *ConfigStore) Config() (Config, error) {
	_, err := os.Stat(s.configPath)
	if os.IsNotExist(err) {
		return DefaultConfig(), nil
	}

	dir, fileName := filepath.Split(s.configPath)
	if len(dir) == 0 {
		dir = "."
	}

	buf, err := fs.ReadFile(os.DirFS(dir), fileName)
	if err != nil {
		return Config{}, fmt.Errorf("could not read the configuration file: %w", err)
	}

	if len(buf) == 0 {
		return DefaultConfig(), nil
	}

	cfg := Config{}
	if err := json.Unmarshal(buf, &cfg); err != nil {
		return Config{}, fmt.Errorf("configuration file does not have a valid format: %w", err)
	}

	return cfg, nil

}

func (s *ConfigStore) Update(config *Config) error {

	buf, err := json.Marshal(config)

	if err != nil {
		return err
	}

	err = os.WriteFile(s.configPath, buf, 0644)

	if err != nil {
		return err
	}

	return nil
}
