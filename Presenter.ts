
import { AssetManager } from './managers/AssetManager';
import { ChatManager } from './managers/ChatManager';

export class Presenter {
  public assetManager: AssetManager = new AssetManager();
  public chatManager: ChatManager = new ChatManager();
}

export const globalPresenter = new Presenter();
