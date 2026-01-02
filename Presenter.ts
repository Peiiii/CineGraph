
import { AssetManager } from './managers/AssetManager';
import { ChatManager } from './managers/ChatManager';

export class Presenter {
  public assetManager: AssetManager;
  public chatManager: ChatManager;

  constructor() {
    this.assetManager = new AssetManager();
    this.chatManager = new ChatManager(this.assetManager);
  }
}

export const globalPresenter = new Presenter();
