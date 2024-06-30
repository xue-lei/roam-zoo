package main

import (
	"context"
	"log/slog"
	"roam-zoo/pkg/connection"
	"roam-zoo/pkg/watch"
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

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{ConnectionManager: connection.NewConnectionManager()}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.ConnectionManager.LoadConfig()
}

func (a *App) Connect(k string) string {

	connection := a.ConnectionManager.ConnectionMap[k]
	config := connection.Config

	if connection.ZkConn == nil {
		conn, _, err := zk.Connect([]string{config.Host + ":" + config.Port}, time.Second*5)
		if err != nil {
			slog.Error("Connect Error", err)
			return err.Error()
		}

		count := 0
		for {
			if count > 15 {
				conn.Close()
				return "connect timeout"
			}

			if conn.SessionID() == 0 {
				count++
				<-time.After(100 * time.Millisecond)
			} else {
				break
			}

		}
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
