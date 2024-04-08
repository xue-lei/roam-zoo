package watch

import (
	"context"
	"log/slog"

	"github.com/go-zookeeper/zk"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Watcher struct {
	Ctx     context.Context
	CloseCh chan int
}

func (w *Watcher) WatchSelectedNode(zkConn *zk.Conn, path string) error {

	slog.Info("Watcher", "start", path)

	for {
		_, _, e, err := zkConn.ChildrenW(path)

		if err != nil {
			slog.Error(err.Error())
			return err
		}

		select {
		case <-w.CloseCh:
			slog.Info("watcher", "close", path)
			return nil
		case event := <-e:
			slog.Info("change", "path", event.Path, "type", event.Type.String(), "state", event.State.String())
			runtime.EventsEmit(w.Ctx, "childrenNodeChange", path)
		}
	}
}
