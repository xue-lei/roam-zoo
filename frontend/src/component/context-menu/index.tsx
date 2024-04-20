import Menu from '@mui/material/Menu';
import { ComponentType, MouseEvent, MouseEventHandler, useState } from 'react';

interface ContextMenuPropsItem {
  k: string | undefined
  close: () => void
}

interface ChildrenProps {
  className?: string
  menus: Array<{ key: string, node: ComponentType<ContextMenuPropsItem> }>
}

const ContextMenuHoc = (
  childrenComponents: Array<{ k: string, ChildrenItem: ComponentType<{ onContextMenu: MouseEventHandler, style: any }> }>
): ComponentType<ChildrenProps> => {

  return (props) => {

    const [contextMenu, setContextMenu] = useState<{
      mouseX: number;
      mouseY: number;
      k: string
    } | null>(null);

    const handleContextMenu = (event: MouseEvent, k: string) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            k
          }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
      );
    };

    const handleClose = () => {
      setContextMenu(null);
    };

    return (
      <div
        className={props.className}>
        {childrenComponents.map(c =>
          <c.ChildrenItem
            key={c.k}
            onContextMenu={(event: MouseEvent) => { handleContextMenu(event, c.k) }}
            style={{ cursor: 'context-menu' }}
          />
        )}
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {props.menus.map(m => <m.node k={contextMenu?.k} key={m.key} close={handleClose} />)}
        </Menu>
      </div>
    );
  }
}

export { ContextMenuHoc, type ContextMenuPropsItem }
