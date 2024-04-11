package main

import (
	"changeme/pkg/watch"
	"context"
	"log/slog"
	"time"

	"github.com/go-zookeeper/zk"
)

// App struct
type App struct {
	ctx     context.Context
	zkConn  *zk.Conn
	watcher *watch.Watcher
}

type Node struct {
	Key      string
	Path     string
	Name     string
	Children []Node
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	conn, _, err := zk.Connect([]string{"127.0.0.1:2181"}, time.Second*5)
	if err != nil {
		panic(err)
	}
	a.zkConn = conn
}

// Greet returns a greeting for the given name
func (a *App) GetNodes(path string) []Node {

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
	nodeInfoByte, _, err := a.zkConn.Get(path)
	if err != nil {
		slog.Error(err.Error())
	}
	slog.Info("NodeInfo", "Path", path, "Info", string(nodeInfoByte[:]))
	return string(nodeInfoByte[:])
}

func (a *App) SetWatcherForSelectedNode(path string) {
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
