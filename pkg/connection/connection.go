package connection

import (
	"context"
	"roam-zoo/pkg/config"
	"sort"
	"strconv"

	"github.com/go-zookeeper/zk"
)

type Connection struct {
	Config config.Connection
	ZkConn *zk.Conn
}

type ConnectionConfig struct {
	Key    string            `json:"key"`
	Config config.Connection `json:"config"`
}

type ConnectionInfo struct {
	ConnectionConfig
	Connected bool `json:"connected"`
}

type ConnectionManager struct {
	configStore   *config.ConfigStore
	config        *config.Config
	Ctx           context.Context
	ConnectionMap map[string]*Connection
	ConnectedMap  map[string]bool
}

func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{}
}

func (cm *ConnectionManager) LoadConfig() {

	configStore, err := config.NewConfigStore()
	if err != nil {
		panic(err)
	}
	cm.configStore = configStore

	config, err := configStore.Config()
	if err != nil {
		panic(err)
	}
	cm.config = &config

	cm.refreshConfig()
}

func (cm *ConnectionManager) refreshConfig() {
	connectionConfigs := cm.config.Connections
	if len(connectionConfigs) != 0 {
		cm.ConnectionMap = make(map[string]*Connection)
		for i, connectionConfig := range connectionConfigs {
			cm.ConnectionMap[strconv.Itoa(i)] = &Connection{Config: connectionConfig, ZkConn: nil}
		}
	}
}

func (cm *ConnectionManager) GetConnections() []ConnectionInfo {
	configs := make([]ConnectionInfo, 0, len(cm.ConnectionMap))

	for _, key := range getOrderKeys(cm.ConnectionMap) {
		configs = append(configs, ConnectionInfo{
			ConnectionConfig: ConnectionConfig{key, cm.ConnectionMap[key].Config},
			Connected:        cm.ConnectedMap[key],
		})
	}
	return configs
}

func (cm *ConnectionManager) SaveConnection(config config.Connection) {
	cm.config.Connections = append(cm.config.Connections, config)
	cm.configStore.Update(cm.config)
	cm.refreshConfig()
}

func (cm *ConnectionManager) DeleteConnection(k string) {

	delete(cm.ConnectionMap, k)

	cm.config.Connections = make([]config.Connection, 0)
	for _, key := range getOrderKeys(cm.ConnectionMap) {
		cm.config.Connections = append(cm.config.Connections, cm.ConnectionMap[key].Config)
	}

	cm.configStore.Update(cm.config)
	cm.refreshConfig()
}

func getOrderKeys(connectionMap map[string]*Connection) []string {

	keys := make([]string, 0, len(connectionMap))
	for k := range connectionMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	return keys
}
