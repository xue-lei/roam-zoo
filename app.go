package main

import (
	"context"
	"fmt"
	"log/slog"
	"roam-zoo/pkg/connection"
	"roam-zoo/pkg/watch"
	"strings"
	"time"

	"github.com/go-zookeeper/zk"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx               context.Context
	ConnectionManager *connection.ConnectionManager
	zkConn            *zk.Conn
	watcher           *watch.Watcher
}

type Node struct {
	Key      string `json:"key"`
	Path     string `json:"path"`
	Name     string `json:"name"`
	Children []Node `json:"children"`
}

type NodeInfo struct {
	Path  string `json:"path"`
	Info  string `json:"info"`
	Flags int32  `json:"flags"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	connectionManager := connection.NewConnectionManager()
	connectionManager.ConnectedMap = make(map[string]bool)
	return &App{ConnectionManager: connectionManager}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.ConnectionManager.LoadConfig()
}

var errLog string

type zkLogger struct{}

func (zkLog zkLogger) Printf(v string, i ...interface{}) {
	zkLogS := fmt.Sprintf(v, i...)
	if strings.Contains(zkLogS, "fail") {
		errLog = zkLogS
	}
	slog.Info(zkLogS)
}

func (a *App) Connect(k string) string {

	connection := a.ConnectionManager.ConnectionMap[k]
	config := connection.Config

	if connection.ZkConn == nil {
		conn, _, err := zk.Connect([]string{config.Host + ":" + config.Port}, time.Second*5)
		if err != nil {
			slog.Error("Connect", slog.Any("Error", err))
			return err.Error()
		}

		zkLogger := zkLogger{}

		conn.SetLogger(zkLogger)

		count := 0
		for {
			if count > 30 {
				conn.Close()
				if errLog == "" {
					return "connect err"
				}
				return errLog
			}

			if conn.SessionID() == 0 {
				count++
				<-time.After(100 * time.Millisecond)
			} else {
				break
			}

		}
		a.ConnectionManager.ConnectedMap[k] = true
		connection.ZkConn = conn
	}

	a.zkConn = connection.ZkConn
	a.watcher = nil

	runtime.EventsEmit(a.ctx, "childrenNodeChange", "/")
	return ""
}

// Greet returns a greeting for the given name
func (a *App) GetNodes(path string) []Node {

	if a.zkConn == nil {
		return make([]Node, 0)
	}

	paths, _, _ := a.zkConn.Children(path)
	nodes := make([]Node, len(paths))

	for i, v := range paths {
		path_ := path
		if path == "/" {
			path_ = path + v
		} else {
			path_ = path + "/" + v
		}
		nodes[i] = Node{v, path_, v, make([]Node, 0)}
	}
	return nodes
}

func (a *App) GetNodeInfo(path string) string {

	if a.zkConn == nil {
		return ""
	}

	nodeInfoByte, _, err := a.zkConn.Get(path)
	if err != nil {
		slog.Error(err.Error())
	}
	slog.Info("NodeInfo", "Path", path, "Info", string(nodeInfoByte[:]))
	return string(nodeInfoByte[:])
}

func (a *App) SetWatcherForSelectedNode(path string) {

	if a.zkConn == nil {
		return
	}

	if a.watcher != nil {
		a.watcher.CloseCh <- 0
	}

	watcher := watch.Watcher{}
	watcher.CloseCh = make(chan int)
	watcher.Ctx = a.ctx
	a.watcher = &watcher

	go func() {
		if err := watcher.WatchSelectedNode(a.zkConn, path); err != nil {
			a.watcher = nil
		}
	}()
}

func (a *App) AddNode(nodeInfo NodeInfo) {

	if a.zkConn == nil {
		return
	}

	a.zkConn.Create(nodeInfo.Path, []byte(nodeInfo.Info), nodeInfo.Flags, zk.WorldACL(zk.PermAll))
}
