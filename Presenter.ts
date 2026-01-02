
import { AssetManager } from './managers/AssetManager';
import { ChatManager } from './managers/ChatManager';
import { ActionManager } from './managers/ActionManager';

export class Presenter {
  public assetManager: AssetManager = new AssetManager();
  public chatManager: ChatManager = new ChatManager();
  public actionManager: ActionManager = new ActionManager();
}

export const globalPresenter = new Presenter();
