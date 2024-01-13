package main

import (
	"context"
	"log/slog"
	"time"

	"github.com/go-zookeeper/zk"
)

// App struct
type App struct {
	ctx    context.Context
	zkConn *zk.Conn
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	conn, _, err := zk.Connect([]string{"192.168.14.8:2181"}, time.Second*5)
	if err != nil {
		panic(err)
	}
	a.zkConn = conn
}

// Greet returns a greeting for the given name
func (a *App) GetRootNodes() []string {

	rootNodes, _, _ := a.zkConn.Children("/")
	slog.Info("rootNodes", rootNodes)
	return rootNodes
}
