export class Config {
  private static _myconfig: Config | null = null;
  openaikey: string = "";
  ctrlenter: boolean = false;
  maxtokencontext: number = 0;
  maxtokenreply: number = 0;
  voiceover: boolean = false;
  currentsessionid: string = "";
  koboldapi: string = "";

  public static async GetConfigInstanceAsync() {
    //load config from json and return it
    if (Config._myconfig == null) {
      Config._myconfig = await Config.LoadConfigFromJsonAsync();
    }
    return Config._myconfig;
  }
  public static GetConfig() {
    if (Config._myconfig != null) {
      return Config._myconfig;
    } else {
      console.error(
        "this GetConfig can't be used without calling GetConfigInstanceAsync first"
      );
    }
  }
  public async SaveAsync() {
    await fetch("/api/saveconfignew", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this),
    });
  }
  private static async LoadConfigFromJsonAsync() {
    const response = await fetch("/api/getconfignew");
    const jobj = JSON.parse(await response.json());

    var myconfig = new Config();
    myconfig.openaikey = jobj.openaikey;
    myconfig.ctrlenter = jobj.ctrlenter;
    myconfig.maxtokencontext = jobj.maxtokencontext;
    myconfig.maxtokenreply = jobj.maxtokenreply;
    myconfig.voiceover = jobj.voiceover;
    myconfig.currentsessionid = jobj.currentsessionid;
    myconfig.koboldapi = jobj.koboldapi;
    return myconfig;
  }
}
