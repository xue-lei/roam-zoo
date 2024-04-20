package connection

import (
	"context"
	"roam-zoo/pkg/config"
	"strconv"

	"github.com/go-zookeeper/zk"
)

type Connection struct {
	Config config.Connection
	ZkConn *zk.Conn
}

type ConnectionManager struct {
	configStore   *config.ConfigStore
	config        *config.Config
	Ctx           context.Context
	ConnectionMap map[string]*Connection
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

func (cm *ConnectionManager) GetConnections() map[string]config.Connection {
	configMap := make(map[string]config.Connection)
	for k, connection := range cm.ConnectionMap {
		configMap[k] = connection.Config
	}
	return configMap
}

func (cm *ConnectionManager) SaveConnection(config config.Connection) {
	cm.config.Connections = append(cm.config.Connections, config)
	cm.configStore.Update(cm.config)
	cm.refreshConfig()
}

func (cm *ConnectionManager) DeleteConnection(k string) {
	delete(cm.ConnectionMap, k)
	cm.config.Connections = make([]config.Connection, 0)
	for _, connection := range cm.ConnectionMap {
		cm.config.Connections = append(cm.config.Connections, connection.Config)
	}
	cm.configStore.Update(cm.config)
	cm.refreshConfig()
}
